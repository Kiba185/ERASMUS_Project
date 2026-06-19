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
        const allowedOrigin = process.env.CORS_ORIGIN?.replace(/\/$/, "");
        if (
            origin.startsWith('http://localhost') ||
            origin.endsWith('.onrender.com') ||
            origin.endsWith('.vercel.app') ||
            origin === allowedOrigin
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
    const user = await prisma.user.findFirst({ 
        where: { username },
        include: { children: true }
    });
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


app.get('/api/initialize', async (req, res, next) => {
    try {
        const usersCount = await prisma.user.count();
        if (usersCount > 0) {
            return res.status(400).json({ success: false, message: 'Database is not empty' });
        }

        console.log('Starting database initialization. Please wait...');

        // 1. Security & default password (Hash only once for performance!)
        const defaultPassword = await bcrypt.hash('123', 10);

        // 2. Create Periods, Rooms, and Subjects
        console.log('- Creating basic dictionaries (periods, rooms, subjects)...');
        await prisma.period.createMany({
            data: Array.from({ length: 8 }).map((_, i) => ({
                periodNumber: i + 1,
                startTime: `${7 + i}:00`,
                endTime: `${7 + i}:45`
            }))
        });

        const rooms = await Promise.all(['101', '102', '103', 'Gymnasium', 'Computer Lab'].map(name => 
            prisma.room.create({ data: { name } })
        ));

        const subjectsData = [
            { name: 'Mathematics', code: 'MAT', color: '#e63946' },
            { name: 'English', code: 'ENG', color: '#457b9d' },
            { name: 'Science', code: 'SCI', color: '#1d3557' },
            { name: 'Computer Science', code: 'CS', color: '#2a9d8f' },
            { name: 'Physical Education', code: 'PE', color: '#f4a261' }
        ];
        const subjects = await Promise.all(subjectsData.map(s => prisma.subject.create({ data: s })));

        // 3. Admin and Teachers
        console.log('- Creating users and teachers...');
        const admin = await prisma.user.create({
            data: { role: 'admin', firstName: 'Super', lastName: 'Admin', birthday: new Date('1980-01-01'), username: 'admin', password: defaultPassword, email: 'admin@school.example.com', phone: '111222333', adress: '1 Admin Way' }
        });

        const teachers = [];
        for (let i = 1; i <= 3; i++) {
            const subject = subjects[i % subjects.length];
            const teacher = await prisma.user.create({
                data: {
                    role: 'teacher', firstName: 'Teacher', lastName: `${i}`, birthday: new Date('1975-05-05'), username: `teacher${i}`, password: defaultPassword, email: `teacher${i}@school.example.com`, phone: `22233344${i}`, adress: `School St ${i}`,
                    subjects: { connect: [{ id: subject.id }] }
                }
            });
            teachers.push(teacher);
        }

        // 4. Classes and Groups
        console.log('- Creating classes and students...');
        const classes = [];
        for (const className of ['1A', '2A', '3A']) {
            const newClass = await prisma.class.create({ data: { name: className } });
            classes.push(newClass);
            await prisma.group.createMany({
                data: [
                    { name: 'Group 1', classId: newClass.id },
                    { name: 'Group 2', classId: newClass.id }
                ]
            });
        }

        // 5. Students and Parents (3 classes x 5 students)
        const students = [];
        let studentCounter = 1;
        for (const c of classes) {
            for (let i = 1; i <= 5; i++) {
                // Create parent
                const parent = await prisma.user.create({
                    data: { role: 'parent', firstName: 'Parent', lastName: `${studentCounter}`, birthday: new Date('1980-01-01'), username: `parent${studentCounter}`, password: defaultPassword, email: `parent${studentCounter}@school.example.com`, phone: `777000${studentCounter.toString().padStart(3, '0')}`, adress: `Residence ${studentCounter}` }
                });

                // Create student and link to parent and class
                const student = await prisma.user.create({
                    data: {
                        role: 'student', firstName: 'Student', lastName: `${studentCounter}`, birthday: new Date('2008-01-01'), username: `student${studentCounter}`, password: defaultPassword, email: `student${studentCounter}@school.example.com`, phone: `666000${studentCounter.toString().padStart(3, '0')}`, adress: `Residence ${studentCounter}`,
                        parentId: parent.id,
                        classes: { connect: [{ id: c.id }] }
                    }
                });
                
                // Store student locally with class ID for grade generation later
                students.push({ id: student.id, classId: c.id });
                studentCounter++;
            }
        }

        // 6. TimeTables
        console.log('- Generating timetables...');
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        for (const c of classes) {
            for (const day of days) {
                for (let p = 1; p <= 5; p++) { // 5 periods a day
                    const subject = subjects[Math.floor(Math.random() * subjects.length)];
                    const teacher = teachers[Math.floor(Math.random() * teachers.length)];
                    const room = rooms[Math.floor(Math.random() * rooms.length)];

                    await prisma.timeTable.create({
                        data: {
                            day: day, week: 'A', startTime: `${7 + p}:00`, endTime: `${7 + p}:45`, periodNumber: p, group: 'Whole Class', isPermanent: true, status: 'active',
                            roomId: room.id, subjectId: subject.id, teacherId: teacher.id, classId: c.id
                        }
                    });
                }
            }
        }

        // 7. Grades (GradeColumns & Grades)
        console.log('- Writing test grades...');
        for (const c of classes) {
            const classStudents = students.filter(s => s.classId === c.id);
            for (const subject of subjects) {
                const teacher = teachers[Math.floor(Math.random() * teachers.length)];
                
                // Note: Using TeacherId with capital T as defined in your schema
                const gCol = await prisma.gradeColumn.create({
                    data: { subjectId: subject.id, TeacherId: teacher.id, name: 'Midterm Exam', weight: 10, date: new Date() }
                });

                // Generate random grades (1-5) for all students in this class
                const gradesData = classStudents.map(s => ({
                    gColumnId: gCol.id,
                    userId: s.id,
                    grade: Math.floor(Math.random() * 5) + 1 
                }));
                await prisma.grade.createMany({ data: gradesData });
            }
        }

        // 8. Other sample data (Todo, Event, Attendance, Message, Lesson)
        console.log('- Creating sample messages, todos, and attendance...');
        
        await prisma.todo.create({ data: { title: 'Check Vercel deployment', urgency: 3 } });
        
        await prisma.event.create({
            data: { title: 'School Year Opening', description: 'Welcoming students in the main hall.', startDate: new Date(), endDate: new Date(), type: 'Ceremony', startTime: new Date(), allDay: true }
        });

        await prisma.attendance.create({
            data: { date: new Date(), studentId: students[0].id, subjectId: subjects[0].id, classId: classes[0].id, status: 'present' }
        });

        await prisma.message.create({
            data: { senderId: teachers[0].id, recipientId: students[0].id, subject: 'Project Reminder', body: 'Please do not forget to submit your project by Friday.' }
        });

        await prisma.lesson.create({
            data: { teacherId: teachers[0].id, classId: classes[0].id, subjectId: subjects[0].id, name: 'Introduction to Algorithms', classroom: rooms[0].name }
        });

        await prisma.lessonTopic.create({
            data: { date: new Date(), classId: classes[0].id, subjectId: subjects[0].id, topic: 'Basic loops and conditions' }
        });

        console.log('✅ Database successfully initialized!');
        return res.json({ 
            success: true, 
            message: 'Database initialized successfully with 1 Admin, 10 Teachers, 3 Classes, 90 Students, and 90 Parents.' 
        });

    } catch (error) {
        console.error('Database initialization failed:', error);
        return res.status(500).json({ success: false, message: 'Initialization failed', error: error.message });
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
    const { name, subjectId, classId, weight, date } = req.body;
    
    // Check if the user teaches this subject or is an admin
    const isAdmin = await requireAuth(req, res, next, 10);
    if (!isAdmin) {
        const isTeachingSubject = await prisma.timeTable.findFirst({
            where: { teacherId: req.session.userId, subjectId: Number(subjectId) }
        });
        if (!isTeachingSubject) return res.status(403).json({ success: false, message: 'You can only create grade columns for subjects you teach' });
    }

    const newGradeColumn = await prisma.gradeColumn.create({
        data: { name, subjectId: Number(subjectId), classId: Number(classId), weight: Number(weight), date: new Date(date), TeacherId: req.session.userId! }
    });
    res.status(201).json(newGradeColumn);
});

app.delete('/api/gradeColumns/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeColumnId = parseInt(req.params.id);
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: gradeColumnId } });
    if (!gradeColumn) return res.status(404).json({ success: false, message: 'Grade column not found' });
    if (gradeColumn.TeacherId !== req.session.userId && await requireAuth(req, res, next, 10) !== true) return res.status(403).json({ success: false, message: 'You can only delete your own grade columns' });
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
    const { name, subjectId, classId, weight, date } = req.body;

    const isAdmin = await requireAuth(req, res, next, 10);
    if (!isAdmin) {
        const isTeachingSubject = await prisma.timeTable.findFirst({
            where: { teacherId: req.session.userId, subjectId: Number(subjectId) }
        });
        if (!isTeachingSubject) return res.status(403).json({ success: false, message: 'You can only update grade columns to subjects you teach' });
    }

    const updatedGradeColumn = await prisma.gradeColumn.update({ where: { id: gradeColumnId }, data: { name, subjectId: Number(subjectId), classId: Number(classId), weight: Number(weight), date: new Date(date) } });
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
        if (req.session.userId !== userId) { 
            const targetUser = await prisma.user.findUnique({ where: { id: userId } });
            if (targetUser?.parentId !== req.session.userId) {
                if (await requireAuth(req, res, next, 5) !== true) { return; } 
            }
        }
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
    try { 
        const targetUserId = req.query.studentId ? Number(req.query.studentId) : req.session.userId;
        res.json(await getUserGrades(req, res, next, targetUserId)); 
    }
    catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch user grades' }); }
});

app.get('/api/grades/:studentId/:gradeColumnId', async (req, res, next) => {
    try {
        const { studentId, gradeColumnId } = req.params;
        const grade = await prisma.grade.findFirst({ where: { userId: Number(studentId), gColumnId: Number(gradeColumnId) } });
        if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
        if (req.session.userId !== Number(studentId)) { 
            const targetUser = await prisma.user.findUnique({ where: { id: Number(studentId) } });
            if (targetUser?.parentId !== req.session.userId) {
                if (await requireAuth(req, res, next, 5) !== true) { return; } 
            }
        }
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
    if (gradeColumn.TeacherId !== req.session.userId && await requireAuth(req, res, next, 10) !== true) {
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
    if (gradeColumn?.TeacherId !== req.session.userId && await requireAuth(req, res, next, 10) !== true) {
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
        classTeacherId: c.classTeacherId,
        students: c.students.filter(s => s.role === 'student').map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, role: s.role }))
    }));
    res.json(classToUser);
});

app.post('/api/classes', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { name, studentIds, classTeacherId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
        const newClass = await prisma.class.create({
            data: { 
                name, 
                classTeacherId: classTeacherId || null,
                students: studentIds?.length ? { connect: studentIds.map((id: any) => ({ id: Number(id) })) } : undefined 
            },
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
    const { name, studentIds, classTeacherId } = req.body;
    try {
        const updatedClass = await prisma.class.update({
            where: { id: parseInt(req.params.id) },
            data: { 
                name, 
                classTeacherId: classTeacherId || null,
                students: { set: studentIds.map((id: number) => ({ id })) } 
            },
            include: { students: true },
        });
        res.json(updatedClass);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
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
//      --=== ROOMS STUFF ===--

app.get('/api/rooms', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const rooms = await prisma.room.findMany();
    res.json(rooms);
});

app.post('/api/rooms', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { name } = req.body;
    try {
        const room = await prisma.room.create({ data: { name } });
        res.status(201).json(room);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.delete('/api/rooms/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    try {
        const room = await prisma.room.delete({ where: { id: parseInt(req.params.id) } });
        res.json(room);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
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
    const targetUserId = req.query.studentId ? Number(req.query.studentId) : req.session.userId!;
    const currentUser = req.session.userId ? await prisma.user.findUnique({ where: { id: req.session.userId } }) : null;
    const currentPrivilege = privileges[(currentUser?.role ?? '') as keyof typeof privileges] ?? 0;
    const filteredEvents = events.filter(event => {
        const isParticipant = event.participantsIndividuals.some(u => u.id === targetUserId) ||
            event.participantsClasses.some(c => c.students?.some(s => s.id === targetUserId));
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

// ─── SCHOOL INFO ─────────────────────────────────────────────────────────────

app.get('/api/school-info', async (req, res, next) => {
    try {
        let info = await prisma.schoolInfo.findUnique({ where: { id: 1 } });
        if (!info) {
            info = await prisma.schoolInfo.create({ data: {} });
        }
        res.json(info);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/school-info', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) return;
    try {
        const { schoolName, registrationId, principal, street, city, zipCode, email, phone, website } = req.body;
        const info = await prisma.schoolInfo.upsert({
            where: { id: 1 },
            update: { schoolName, registrationId, principal, street, city, zipCode, email, phone, website },
            create: { schoolName, registrationId, principal, street, city, zipCode, email, phone, website }
        });
        res.json(info);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── SEMESTERS ─────────────────────────────────────────────────────────────

app.get('/api/semesters', async (req, res, next) => {
    try {
        const semesters = await prisma.semester.findMany({ orderBy: { startDate: 'desc' } });
        res.json(semesters);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/semesters', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) return;
    try {
        const { name, startDate, endDate, isActive } = req.body;
        const newSemester = await prisma.semester.create({
            data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isActive: Boolean(isActive) }
        });
        res.status(201).json(newSemester);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/semesters/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) return;
    try {
        const { name, startDate, endDate, isActive } = req.body;
        const updated = await prisma.semester.update({
            where: { id: parseInt(req.params.id) },
            data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isActive: Boolean(isActive) }
        });
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/semesters/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) return;
    try {
        const deleted = await prisma.semester.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json(deleted);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});