import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import bcrypt from 'bcrypt';
import timetableRouter from './timeTable.js';
import attendanceRouter from './attendance.js';
import { prisma } from "./prisma.js";

import { requireAuth } from './auth.js';
import userRoutes from './userManagment.js';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

const privileges = {
    "student": 1,
    "parent": 2,
    "teacher": 5,
    "admin": 10
};

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            origin.startsWith('http://localhost') ||
            origin.endsWith('.onrender.com') ||
            origin === process.env.CORS_ORIGIN
        ) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET ?? 'cisco',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        httpOnly: true,
    }
}));

app.use(timetableRouter);
app.use(userRoutes);
app.use(attendanceRouter);


//////////////////////////////////////
//      --=== MISC STUFF ===--

async function userIdFromUsername(username: string) {
    const user = await prisma.user.findFirst({ where: { username } });
    return user?.id ?? 0;
}




////////////////////////////////////////
//      --=== ADMIN STUFF ===--

app.get('/api/admin/users/deleteall', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) { return; }
    await prisma.user.deleteMany();
    res.json({ success: true, message: 'All users deleted' });
});

async function adminsetuser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, newrole } = req.body;
    const user = await prisma.user.findFirst({ where: { username } });
    if (user) {
        await prisma.user.update({ where: { id: user.id }, data: { role: newrole } });
        res.json({ success: true, message: `${username} role updated to ${newrole}` });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
}
app.post('/api/admin/setuser', async (req, res, next) => { await adminsetuser(req, res, next); });


//LOGIN
async function login(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id;
        req.session.save((err) => {
            if (err) return res.status(500).json({ success: false });
            const { password: _, ...safeUser } = user;
            res.json({ success: true, user: safeUser });
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        setTimeout(() => { logout(req, res, next); }, 1000);
    }
}
app.post('/api/login', async (req, res, next) => { await login(req, res, next); });


//REGISTER
async function register(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { firstName, lastName, birthday, username, password, email, phone, adress } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (await prisma.user.findFirst({ where: { username } })) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    const userRole = username === 'admin' ? 'admin' : 'student';
    const newUser = await prisma.user.create({
        data: { password: hashedPassword, firstName, lastName, birthday, username, email, phone, adress, role: userRole }
    });
    if (!newUser) { return res.status(400).json({ success: false, message: 'User creation failed' }); }
    res.status(201).json({ success: true, user: newUser });
}
app.post('/api/register', async (req, res, next) => { await register(req, res, next); });


//CREATE USER - ADMIN ONLY
app.post('/api/admin/createuser', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) { return; }
    const { firstName, lastName, birthday, username, password, email, phone, adress, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (await prisma.user.findFirst({ where: { username } })) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    const newUser = await prisma.user.create({
        data: { password: hashedPassword, firstName, lastName, birthday, username, email, phone, adress, role }
    });
    if (!newUser) { return res.status(400).json({ success: false, message: 'User creation failed' }); }
    res.status(201).json({ success: true, user: newUser });
});


// INITIALIZE DB
app.get('/api/initialize', async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        if (users.length > 0) {
            return res.status(400).json({ success: false, message: 'Database is not empty' });
        }

        // ─── USERS ───────────────────────────────────────────────────────────
        const hash = (pw: string) => bcrypt.hash(pw, 10);

        const admin = await prisma.user.create({
            data: {
                role: 'admin',
                password: await hash('admin'),
                firstName: 'Admin',
                lastName: 'User',
                birthday: new Date('1980-01-01'),
                username: 'admin',
                email: 'admin@example.com',
                phone: '100000000',
                adress: '1 Admin Lane',
            },
        });

        const teachers = await Promise.all([
            prisma.user.create({
                data: {
                    role: 'teacher',
                    password: await hash('teacher'),
                    firstName: 'Alice',
                    lastName: 'Martin',
                    birthday: new Date('1985-03-15'),
                    username: 'teacher',
                    email: 'teacher@example.com',
                    phone: '200000001',
                    adress: '10 Oak Street',
                },
            }),
            prisma.user.create({
                data: {
                    role: 'teacher',
                    password: await hash('teacher2'),
                    firstName: 'Bob',
                    lastName: 'Chen',
                    birthday: new Date('1979-07-22'),
                    username: 'teacher2',
                    email: 'teacher2@example.com',
                    phone: '200000002',
                    adress: '12 Oak Street',
                },
            }),
        ]);

        const parents = await Promise.all([
            prisma.user.create({
                data: {
                    role: 'parent',
                    password: await hash('parent'),
                    firstName: 'Carol',
                    lastName: 'Smith',
                    birthday: new Date('1975-06-10'),
                    username: 'parent',
                    email: 'parent@example.com',
                    phone: '300000001',
                    adress: '5 Maple Ave',
                },
            }),
            prisma.user.create({
                data: {
                    role: 'parent',
                    password: await hash('parent2'),
                    firstName: 'David',
                    lastName: 'Jones',
                    birthday: new Date('1973-11-30'),
                    username: 'parent2',
                    email: 'parent2@example.com',
                    phone: '300000002',
                    adress: '7 Maple Ave',
                },
            }),
        ]);

        const students = await Promise.all([
            prisma.user.create({
                data: {
                    role: 'student',
                    password: await hash('student'),
                    firstName: 'Emma',
                    lastName: 'Smith',
                    birthday: new Date('2010-04-12'),
                    username: 'student',
                    email: 'student@example.com',
                    phone: '400000001',
                    adress: '5 Maple Ave',
                    parentId: parents[0].id,
                },
            }),
            prisma.user.create({
                data: {
                    role: 'student',
                    password: await hash('student2'),
                    firstName: 'Liam',
                    lastName: 'Jones',
                    birthday: new Date('2010-09-05'),
                    username: 'student2',
                    email: 'student2@example.com',
                    phone: '400000002',
                    adress: '7 Maple Ave',
                    parentId: parents[1].id,
                },
            }),
            prisma.user.create({
                data: {
                    role: 'student',
                    password: await hash('student3'),
                    firstName: 'Sophia',
                    lastName: 'Brown',
                    birthday: new Date('2011-01-20'),
                    username: 'student3',
                    email: 'student3@example.com',
                    phone: '400000003',
                    adress: '9 Birch Rd',
                },
            }),
            prisma.user.create({
                data: {
                    role: 'student',
                    password: await hash('student4'),
                    firstName: 'Noah',
                    lastName: 'Davis',
                    birthday: new Date('2011-03-14'),
                    username: 'student4',
                    email: 'student4@example.com',
                    phone: '400000004',
                    adress: '11 Birch Rd',
                },
            }),
        ]);

        // ─── SUBJECTS ────────────────────────────────────────────────────────
        const subjects = await Promise.all([
            prisma.subject.create({
                data: {
                    name: 'Mathematics',
                    code: 'MATH',
                    color: '#4f46e5',
                    teachers: { connect: [{ id: teachers[0].id }] },
                },
            }),
            prisma.subject.create({
                data: {
                    name: 'English',
                    code: 'ENG',
                    color: '#0891b2',
                    teachers: { connect: [{ id: teachers[1].id }] },
                },
            }),
            prisma.subject.create({
                data: {
                    name: 'Science',
                    code: 'SCI',
                    color: '#16a34a',
                    teachers: { connect: [{ id: teachers[0].id }] },
                },
            }),
            prisma.subject.create({
                data: {
                    name: 'History',
                    code: 'HIST',
                    color: '#b45309',
                    teachers: { connect: [{ id: teachers[1].id }] },
                },
            }),
        ]);

        // ─── ROOMS ───────────────────────────────────────────────────────────
        const rooms = await Promise.all([
            prisma.room.create({ data: { name: 'Room 101' } }),
            prisma.room.create({ data: { name: 'Room 102' } }),
            prisma.room.create({ data: { name: 'Science Lab' } }),
        ]);

        // ─── PERIODS ─────────────────────────────────────────────────────────
        const periodDefs = [
            { periodNumber: 1, startTime: '08:00', endTime: '08:45' },
            { periodNumber: 2, startTime: '08:50', endTime: '09:35' },
            { periodNumber: 3, startTime: '09:50', endTime: '10:35' },
            { periodNumber: 4, startTime: '10:40', endTime: '11:25' },
            { periodNumber: 5, startTime: '12:00', endTime: '12:45' },
        ];
        await prisma.period.createMany({ data: periodDefs });

        // ─── CLASS ───────────────────────────────────────────────────────────
        const mainClass = await prisma.class.create({
            data: {
                name: '6A',
                students: { connect: students.map((s) => ({ id: s.id })) },
                classTeacherId: teachers[0].id,
            },
        });

        // ─── GROUPS ──────────────────────────────────────────────────────────
        await Promise.all([
            prisma.group.create({
                data: {
                    name: 'Group A',
                    classId: mainClass.id,
                    students: { connect: [{ id: students[0].id }, { id: students[1].id }] },
                },
            }),
            prisma.group.create({
                data: {
                    name: 'Group B',
                    classId: mainClass.id,
                    students: { connect: [{ id: students[2].id }, { id: students[3].id }] },
                },
            }),
        ]);

        // ─── TIMETABLE ───────────────────────────────────────────────────────
        // Monday & Wednesday: Math (period 1) and English (period 2)
        // Tuesday & Thursday: Science (period 1) and History (period 2)
        const timetableEntries = [
            { day: 'Monday',    subjectIdx: 0, teacherIdx: 0, roomIdx: 0, period: 1, time: ['08:00', '08:45'] },
            { day: 'Monday',    subjectIdx: 1, teacherIdx: 1, roomIdx: 1, period: 2, time: ['08:50', '09:35'] },
            { day: 'Tuesday',   subjectIdx: 2, teacherIdx: 0, roomIdx: 2, period: 1, time: ['08:00', '08:45'] },
            { day: 'Tuesday',   subjectIdx: 3, teacherIdx: 1, roomIdx: 1, period: 2, time: ['08:50', '09:35'] },
            { day: 'Wednesday', subjectIdx: 0, teacherIdx: 0, roomIdx: 0, period: 1, time: ['08:00', '08:45'] },
            { day: 'Wednesday', subjectIdx: 1, teacherIdx: 1, roomIdx: 1, period: 2, time: ['08:50', '09:35'] },
            { day: 'Thursday',  subjectIdx: 2, teacherIdx: 0, roomIdx: 2, period: 1, time: ['08:00', '08:45'] },
            { day: 'Thursday',  subjectIdx: 3, teacherIdx: 1, roomIdx: 1, period: 2, time: ['08:50', '09:35'] },
            { day: 'Friday',    subjectIdx: 0, teacherIdx: 0, roomIdx: 0, period: 3, time: ['09:50', '10:35'] },
            { day: 'Friday',    subjectIdx: 2, teacherIdx: 0, roomIdx: 2, period: 4, time: ['10:40', '11:25'] },
        ];

        await prisma.timeTable.createMany({
            data: timetableEntries.map((e) => ({
                day: e.day,
                week: 'A',
                startTime: e.time[0],
                endTime: e.time[1],
                periodNumber: e.period,
                roomId: rooms[e.roomIdx].id,
                subjectId: subjects[e.subjectIdx].id,
                teacherId: teachers[e.teacherIdx].id,
                classId: mainClass.id,
                isPermanent: true,
                status: 'active',
            })),
        });

        // ─── ATTENDANCE ──────────────────────────────────────────────────────
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.attendance.createMany({
            data: students.flatMap((student, si) =>
                subjects.slice(0, 2).map((subject, sj) => ({
                    date: today,
                    studentId: student.id,
                    subjectId: subject.id,
                    classId: mainClass.id,
                    periodNumber: sj + 1,
                    status: si === 1 && sj === 0 ? 'absent' : 'present',
                    absenceType: si === 1 && sj === 0 ? 'unjustified' : null,
                }))
            ),
        });

        // Give Liam's absence an absence note
        const liamAbsence = await prisma.attendance.findFirst({
            where: { studentId: students[1].id, status: 'absent' },
        });
        if (liamAbsence) {
            await prisma.absenceNote.create({
                data: {
                    studentId: students[1].id,
                    attendanceId: liamAbsence.id,
                    reason: 'Doctor appointment',
                    status: 'sent',
                },
            });
        }

        // ─── LESSON TOPICS ───────────────────────────────────────────────────
        await prisma.lessonTopic.createMany({
            data: [
                {
                    date: today,
                    classId: mainClass.id,
                    subjectId: subjects[0].id,
                    periodNumber: 1,
                    topic: 'Introduction to Fractions',
                },
                {
                    date: today,
                    classId: mainClass.id,
                    subjectId: subjects[1].id,
                    periodNumber: 2,
                    topic: 'Reading Comprehension: Short Stories',
                },
            ],
        });

        // ─── EVENTS ──────────────────────────────────────────────────────────
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        await prisma.event.create({
            data: {
                title: 'Parent-Teacher Meeting',
                description: 'Semester progress review with parents.',
                type: 'meeting',
                startDate: nextWeek,
                endDate: nextWeek,
                startTime: new Date(nextWeek.setHours(17, 0, 0, 0)),
                allDay: false,
                participantsClasses: { connect: [{ id: mainClass.id }] },
                participantsIndividuals: {
                    connect: [...teachers.map((t) => ({ id: t.id })), ...parents.map((p) => ({ id: p.id }))],
                },
            },
        });

        // ─── MESSAGES ────────────────────────────────────────────────────────
        await prisma.message.createMany({
            data: [
                {
                    senderId: parents[0].id,
                    recipientId: teachers[0].id,
                    subject: "Emma's progress",
                    body: "Hi, I was wondering how Emma has been doing in Math lately. She mentioned she finds fractions tricky.",
                    read: true,
                },
                {
                    senderId: teachers[0].id,
                    recipientId: parents[0].id,
                    subject: "Re: Emma's progress",
                    body: "Hello Carol, Emma is doing well overall. We just started fractions this week — I'll keep you posted on her progress.",
                    read: false,
                },
                {
                    senderId: admin.id,
                    recipientId: teachers[0].id,
                    subject: 'Welcome',
                    body: 'Welcome to the platform! Please review the timetable for class 6A.',
                    read: false,
                },
            ],
        });

        // ─── TODOS ───────────────────────────────────────────────────────────
        await prisma.todo.createMany({
            data: [
                { title: 'Review attendance reports', urgency: 2, isCompleted: false },
                { title: 'Prepare parent-teacher meeting agenda', urgency: 1, isCompleted: false },
                { title: 'Update timetable for next semester', urgency: 3, isCompleted: false },
            ],
        });

        res.json({
            success: true,
            message: 'Database initialized successfully',
            summary: {
                users: { admin: 1, teachers: teachers.length, parents: parents.length, students: students.length },
                subjects: subjects.length,
                rooms: rooms.length,
                periods: periodDefs.length,
                classes: 1,
                groups: 2,
                timetableEntries: timetableEntries.length,
                attendanceRecords: students.length * 2,
                lessonTopics: 2,
                events: 1,
                messages: 3,
                todos: 3,
            },
        });
    } catch (error) {
        next(error);
    }
});


//LOGOUT
async function logout(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        try { return res.json({ success: true, message: 'Logged out successfully' }); } catch { return; }
    });
}
app.post('/api/logout', async (req, res, next) => { await logout(req, res, next); });


//SET USER ROLE
async function setUserRole(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (await requireAuth(req, res, next, 10) !== true) { return; }
    const { username, newRole } = req.body;
    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { role: newRole } });
    res.json({ success: true, user: updatedUser });
}
app.post('/api/setUserRole', async (req, res, next) => { await setUserRole(req, res, next); });




///////////////////////////////////////
//      --=== USER STUFF ===--

app.get('/api/users', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) { return; }
    const users = await prisma.user.findMany();
    res.json(users);
});

app.get('/api/users/:role', async (req, res, next) => {
    if (req.params.role === 'student' || req.params.role === 'parent' || req.params.role === 'teacher') {
        if (await requireAuth(req, res, next, 5) !== true) { return; }
    } else {
        if (await requireAuth(req, res, next, 10) !== true) { return; }
    }
    const users = await prisma.user.findMany({ where: { role: req.params.role } });
    const usersToClassesRelations = await prisma.user.findMany({ where: { role: req.params.role }, include: { classes: true } });
    const userInfoWithClasses = users.map(u => {
        const classes = usersToClassesRelations.find(uc => uc.id === u.id)?.classes || [];
        return { ...u, classes: classes.map(c => ({ id: c.id, name: c.name })) };
    });
    res.json(userInfoWithClasses);
});

app.get('/api/user/:username', async (req, res, next) => {
    try {
        const username = req.params.username;
        const user = await prisma.user.findFirst({ where: { username } });
        if (user?.role === 'student' || user?.role === 'parent') {
            if (req.session.userId !== user?.id) { if (await requireAuth(req, res, next, 5) !== true) { return; } }
        } else {
            if (req.session.userId !== user?.id) { if (await requireAuth(req, res, next, 10) !== true) { return; } }
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});

// GET CURRENT USER — includes taughtClass and classes for attendance page
app.get('/api/user', async (req, res, next) => {
    try {
        const id = req.session.userId;
        if (!id) return res.status(401).json({ success: false, message: 'Not authenticated' });
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                taughtClass: true,
                classes: { select: { id: true, name: true } },
            },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});




///////////////////////////////////////
//      --=== GRADE STUFF ===--

app.get('/api/gradeColumns', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeColumns = await prisma.gradeColumn.findMany();
    res.json(gradeColumns);
});

app.post('/api/gradeColumns', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { name, subjectId, weight, date } = req.body;
    const newGradeColumn = await prisma.gradeColumn.create({
        data: { name, subjectId: Number(subjectId), weight: Number(weight), date: new Date(date), TeacherId: req.session.userId! }
    });
    res.status(201).json(newGradeColumn);
});

app.delete('/api/gradeColumns/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeColumnId = parseInt(req.params.id);
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: gradeColumnId } });
    if (!gradeColumn) return res.status(404).json({ success: false, message: 'Grade column not found' });
    if (gradeColumn.TeacherId !== req.session.userId) return res.status(403).json({ success: false, message: 'You can only delete your own grade columns' });
    await prisma.gradeColumn.delete({ where: { id: gradeColumnId } });
    res.json({ success: true, message: 'Grade column deleted' });
});

app.put('/api/gradeColumns/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeColumnId = parseInt(req.params.id);
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: gradeColumnId } });
    if (!gradeColumn) return res.status(404).json({ success: false, message: 'Grade column not found' });
    if (gradeColumn.TeacherId !== req.session.userId && await requireAuth(req, res, next, 10) !== true) {
        return res.status(403).json({ success: false, message: 'You can only update your own grade columns' });
    }
    const { name, subjectId, weight, date } = req.body;
    const updatedGradeColumn = await prisma.gradeColumn.update({ where: { id: gradeColumnId }, data: { name, subjectId, weight, date } });
    res.json(updatedGradeColumn);
});

async function formatGradeResponse(grade: any) {
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: grade.gColumnId } });
    const subject = gradeColumn?.subjectId ? await prisma.subject.findUnique({ where: { id: gradeColumn.subjectId } }) : null;
    return { ...grade, subjectId: subject?.id, subjectName: subject?.name, date: gradeColumn?.date, weight: gradeColumn?.weight, gColumnName: gradeColumn?.name };
}

app.get('/api/grades', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const grades = await prisma.grade.findMany();
    res.json(grades);
});

app.delete('/api/grades/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeId = parseInt(req.params.id);
    const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    await prisma.grade.delete({ where: { id: gradeId } });
    res.json({ success: true, message: 'Grade deleted' });
});

async function getUserGrades(req: express.Request, res: express.Response, next: express.NextFunction, userId?: number) {
    try {
        if (req.session.userId !== userId) { if (await requireAuth(req, res, next, 5) !== true) { return; } }
        const allGrades = await prisma.grade.findMany();
        const userGrades = allGrades.filter(grade => grade.userId === userId);
        const formattedGrades = [];
        for (const grade of userGrades) { formattedGrades.push(await formatGradeResponse(grade)); }
        return formattedGrades;
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
}

app.get('/api/grades/:username', async (req, res, next) => {
    try {
        const userId = await userIdFromUsername(req.params.username);
        res.json(await getUserGrades(req, res, next, userId));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
});

app.get('/api/mygrades', async (req, res, next) => {
    try { res.json(await getUserGrades(req, res, next, req.session.userId)); }
    catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch user grades' }); }
});

app.get('/api/grades/:studentId/:gradeColumnId', async (req, res, next) => {
    try {
        const { studentId, gradeColumnId } = req.params;
        const grade = await prisma.grade.findFirst({ where: { userId: Number(studentId), gColumnId: Number(gradeColumnId) } });
        if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
        if (req.session.userId !== Number(studentId)) { if (await requireAuth(req, res, next, 5) !== true) { return; } }
        res.json(await formatGradeResponse(grade));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch grade' });
    }
});

app.post('/api/grades', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { value, userId, gradeColumnId } = req.body;
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: Number(gradeColumnId) } });
    if (!gradeColumn) return res.status(404).json({ success: false, message: 'Grade column not found' });
    if (gradeColumn.TeacherId !== req.session.userId && await requireAuth(req, res, next, 5) !== true) {
        return res.status(403).json({ success: false, message: 'You can only add grades to your own grade columns' });
    }
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const existingGrade = await prisma.grade.findFirst({ where: { userId: Number(userId), gColumnId: Number(gradeColumnId) } });
    if (existingGrade) { await prisma.grade.delete({ where: { id: existingGrade.id } }); }
    const newGrade = await prisma.grade.create({ data: { gColumnId: Number(gradeColumnId), userId: Number(userId), grade: Number(value) } });
    res.status(201).json(newGrade);
});

app.delete('/api/grades/:studentId/:gradeColumnId', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { studentId, gradeColumnId } = req.params;
    const grade = await prisma.grade.findFirst({ where: { userId: Number(studentId), gColumnId: Number(gradeColumnId) } });
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: grade.gColumnId } });
    if (gradeColumn?.TeacherId !== req.session.userId && await requireAuth(req, res, next, 5) !== true) {
        return res.status(403).json({ success: false, message: 'You can only delete grades from your own grade columns' });
    }
    await prisma.grade.delete({ where: { id: grade.id } });
    res.json({ success: true, message: 'Grade deleted' });
});




///////////////////////////////////////
//      --=== CLASSES STUFF ===--

app.get('/api/classes', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const classToUserRelagtions = await prisma.class.findMany({ include: { students: true } });
    const classToUser = classToUserRelagtions.map(c => ({
        id: c.id,
        name: c.name,
        students: c.students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` }))
    }));
    res.json(classToUser);
});

app.post('/api/classes', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { name, studentIds } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
        const newClass = await prisma.class.create({
            data: { name, students: studentIds?.length ? { connect: studentIds.map((id: any) => ({ id: Number(id) })) } : undefined },
            include: { students: true },
        });
        res.status(201).json(newClass);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/classes/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const deletedClass = await prisma.class.delete({ where: { id: parseInt(req.params.id) } });
    res.json(deletedClass);
});

app.put('/api/classes/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { name, studentIds } = req.body;
    const updatedClass = await prisma.class.update({
        where: { id: parseInt(req.params.id) },
        data: { name, students: { set: studentIds.map((id: number) => ({ id })) } },
        include: { students: true },
    });
    res.json(updatedClass);
});

app.get('/api/class/studentId/:studentId', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const studentId = parseInt(req.params.studentId);
    const classInfo = await prisma.class.findFirst({
        where: { students: { some: { id: studentId } } },
        include: { students: true },
    });
    if (!classInfo) {
        if (await requireAuth(req, res, next, 5) !== true) { return; }
        return res.status(404).json({ success: false, message: 'Class not found for this student' });
    }
    res.json(classInfo);
});




///////////////////////////////////////
//      --=== SUBJECTS STUFF ===--

app.get('/api/subjects', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
});




///////////////////////////////////////
//      --=== LESSONS STUFF ===--

app.get('/api/lessons', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const lessons = await prisma.lesson.findMany();
    res.json(lessons);
});




///////////////////////////////////////
//      --=== EVENTS STUFF ===--

app.get('/api/events', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const events = await prisma.event.findMany({
        include: {
            participantsIndividuals: true,
            participantsClasses: { include: { students: true } }
        }
    });
    const currentUser = req.session.userId ? await prisma.user.findUnique({ where: { id: req.session.userId } }) : null;
    const currentPrivilege = privileges[(currentUser?.role ?? '') as keyof typeof privileges] ?? 0;
    const filteredEvents = events.filter(event => {
        const isParticipant = event.participantsIndividuals.some(u => u.id === req.session.userId) ||
            event.participantsClasses.some(c => c.students?.some(s => s.id === req.session.userId));
        return isParticipant || currentPrivilege >= 5;
    });
    res.json(filteredEvents);
});

app.post('/api/events', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { title, description, startDate, endDate, type, startTime, allDay, participantIndividualIds, participantClassIds } = req.body;
    const newEvent = await prisma.event.create({
        data: {
            title, description,
            startDate: new Date(startDate), endDate: new Date(endDate),
            type,
            startTime: (startTime && startTime !== 'null') ? new Date(startTime) : new Date(startDate),
            allDay,
            participantsIndividuals: { connect: participantIndividualIds.map((id: number) => ({ id })) },
            participantsClasses: { connect: participantClassIds.map((id: number) => ({ id })) }
        },
        include: { participantsIndividuals: true, participantsClasses: { include: { students: true } } }
    });
    res.status(201).json(newEvent);
});

app.delete('/api/events/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    res.json(await prisma.event.delete({ where: { id: parseInt(req.params.id) } }));
});

app.put('/api/events/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { title, description, startDate, endDate, type, startTime, allDay, participantIndividualIds, participantClassIds } = req.body;
    const updatedEvent = await prisma.event.update({
        where: { id: parseInt(req.params.id) },
        data: {
            title, description,
            startDate: new Date(startDate), endDate: new Date(endDate),
            type,
            startTime: (startTime && startTime !== 'null') ? new Date(startTime) : new Date(startDate),
            allDay,
            participantsIndividuals: { set: participantIndividualIds.map((id: number) => ({ id })) },
            participantsClasses: { set: participantClassIds.map((id: number) => ({ id })) }
        },
        include: { participantsIndividuals: true, participantsClasses: { include: { students: true } } }
    });
    res.json(updatedEvent);
});




///////////////////////////////////////
//      --=== MESSAGES STUFF ===--

app.get('/api/messages/inbox', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const messages = await prisma.message.findMany({
        where: { recipientId: req.session.userId! },
        include: { sender: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
});

app.get('/api/messages/sent', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const messages = await prisma.message.findMany({
        where: { senderId: req.session.userId! },
        include: { recipient: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
});

app.post('/api/messages', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const { recipientId, body } = req.body;
    if (!recipientId || !body) return res.status(400).json({ success: false, message: 'recipientId and body are required' });
    const message = await prisma.message.create({
        data: { senderId: req.session.userId!, recipientId: Number(recipientId), body }
    });
    res.status(201).json(message);
});

app.get('/api/messages/recipients', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const users = await prisma.user.findMany({
        where: { id: { not: req.session.userId! } },
        select: { id: true, firstName: true, lastName: true, role: true }
    });
    res.json(users);
});

app.get('/api/setup/messages', async (req, res) => {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Message" (
                "id" SERIAL PRIMARY KEY,
                "senderId" INTEGER NOT NULL REFERENCES "User"("id"),
                "recipientId" INTEGER NOT NULL REFERENCES "User"("id"),
                "body" TEXT NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "read" BOOLEAN NOT NULL DEFAULT FALSE
            );
        `);
        res.json({ success: true, message: 'Message table created' });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});