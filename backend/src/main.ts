import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import session from 'express-session';
import bcrypt from 'bcrypt';
import timetableRouter from './timeTable.ts';

import { requireAuth } from './auth.ts';
import userRoutes from './users.ts';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
    }
}

// Čistá inicializace podle standardu Prisma 7
const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

const privileges = {
    "student": 1,
    "parent": 2,
    "teacher": 5,
    "admin": 10
};

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(session({
    secret: 'cisco',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(userRoutes);

//////////////////////////////////////
//      --=== MISC STUFF ===--

async function userIdFromUsername(username: string) {
    const user = await prisma.user.findFirst({ where: { username } });
    return user?.id ?? 0;
}

////////////////////////////////////////
//      --=== ADMIN STUFF ===--

//DELETE ALL USERS
app.get('/api/admin/users/deleteall', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    await prisma.user.deleteMany();
    res.json({ success: true, message: 'All users deleted' });
});

//ADMINSETUSER
async function adminsetuser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, newrole } = req.body;
    const user = await prisma.user.findFirst({ where: { username } });
    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: { role: newrole }
        });
        res.json({ success: true, message: `${username} role updated to ${newrole}` });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
}
app.post('/api/admin/setuser', async (req, res, next) => {
    await adminsetuser(req, res, next);
});

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
app.post('/api/login', async (req, res, next) => {
    await login(req, res, next);
});

//REGISTER
async function register(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { firstName, lastName, birthday, username, password, email, phone, adress } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (await prisma.user.findFirst({ where: { username } })) { return res.status(400).json({ success: false, message: 'Username already exists' }) };
    const userRole = username === 'admin' ? 'admin' : 'student';
    const newUser = await prisma.user.create({
        data: { password: hashedPassword, firstName, lastName, birthday, username, email, phone, adress, role: userRole }
    });

    if (!newUser) { return res.status(400).json({ success: false, message: 'User creation failed' }); }
    res.status(201).json({ success: true, user: newUser });
}
app.post('/api/register', async (req, res, next) => {
    await register(req, res, next);
});

//CREATE USER - ADMIN ONLY
app.post('/api/admin/createuser', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }
    const { firstName, lastName, birthday, username, password, email, phone, adress, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (await prisma.user.findFirst({ where: { username } })) { return res.status(400).json({ success: false, message: 'Username already exists' }) };
    const newUser = await prisma.user.create({
        data: { password: hashedPassword, firstName, lastName, birthday, username, email, phone, adress, role }
    });

    if (!newUser) { return res.status(400).json({ success: false, message: 'User creation failed' }); }
    res.status(201).json({ success: true, user: newUser });
});

//INITIALIZE CLEAN DATABASE
app.get('/api/initialize', async (req, res, next) => {
    const users = await prisma.user.findMany();
    if (users.length > 0) {
        return res.status(400).json({ success: false, message: 'Database is not empty' });
    }

    for (const role of ['admin', 'teacher', 'student', 'parent']) {
        const hashedPassword = await bcrypt.hash(role, 10);
        await prisma.user.create({
            data: {
                role: role,
                password: hashedPassword,
                firstName: `${role.charAt(0).toUpperCase() + role.slice(1)}`,
                lastName: 'User',
                birthday: new Date('1990-01-01'),
                username: role,
                email: `${role}@example.com`,
                phone: '123456789',
                adress: '123 Main St'
            }
        });
    }

    res.json({ success: true, message: 'Database initialized successfully' });
});

//LOGOUT
async function logout(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }

        try {
            return res.json({ success: true, message: 'Logged out successfully' });
        } catch (err) {
            return;
        }
    });
}
app.post('/api/logout', async (req, res, next) => {
    await logout(req, res, next);
});

//SET USER ROLE - temp, admin only
async function setUserRole(req: express.Request, res: express.Response, next: express.NextFunction) {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const { username, newRole } = req.body;
    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
    });
    res.json({ success: true, user: updatedUser });
}
app.post('/api/setUserRole', async (req, res, next) => {
    await setUserRole(req, res, next);
});

///////////////////////////////////////
//      --=== USER STUFF ===--

//GET ALL USERS - ADMIN ONLY
app.get('/api/users', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const users = await prisma.user.findMany();
    res.json(users);
});

//GET ALL USERS OF ROLE - ADMIN ONLY
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

//GET SPECIFIC USER
app.get('/api/user/:username', async (req, res, next) => {
    try {
        const username = req.params.username;
        const user = await prisma.user.findFirst({ where: { username } });

        /// AUTH ///
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

//GET CURRENT USER
app.get('/api/user', async (req, res, next) => {
    try {
        const id = req.session.userId;
        if (!id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const user = await prisma.user.findUnique({ where: { id } }); 

        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});

///////////////////////////////////////
//      --=== GRADE STUFF ===--

//GET ALL GRADE COLUMNS - TEACHER ONLY
app.get('/api/gradeColumns', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const gradeColumns = await prisma.gradeColumn.findMany();
    res.json(gradeColumns);
});

//CREATE GRADE COLUMN - TEACHER ONLY
app.post('/api/gradeColumns', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const { name, subjectId, weight, date } = req.body;
    const newGradeColumn = await prisma.gradeColumn.create({
        data: {
            name,
            subjectId: Number(subjectId),
            weight: Number(weight),
            date: new Date(date),
            TeacherId: req.session.userId!
        }
    });
    res.status(201).json(newGradeColumn);
});

//DELETE GRADE COLUMN - TEACHER ONLY
app.delete('/api/gradeColumns/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const gradeColumnId = Number(req.params.id);
    if (isNaN(gradeColumnId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: gradeColumnId } });
    if (!gradeColumn) {
        return res.status(404).json({ success: false, message: 'Grade column not found' });
    }
    if (gradeColumn.TeacherId !== req.session.userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own grade columns' });
    }

    await prisma.gradeColumn.delete({ where: { id: gradeColumnId } });
    res.json({ success: true, message: 'Grade column deleted' });
});

//UPDATE GRADE COLUMN - TEACHER ONLY
app.put('/api/gradeColumns/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeColumnId = Number(req.params.id);
    if (isNaN(gradeColumnId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: gradeColumnId } });
    if (!gradeColumn) {
        return res.status(404).json({ success: false, message: 'Grade column not found' });
    }
    if (gradeColumn.TeacherId !== req.session.userId && await requireAuth(req, res, next, 10) !== true) {
        return res.status(403).json({ success: false, message: 'You can only update your own grade columns' });
    }

    const { name, subjectId, weight, date } = req.body;
    const updatedGradeColumn = await prisma.gradeColumn.update({
        where: { id: gradeColumnId },
        data: { name, subjectId, weight, date }
    });
    res.json(updatedGradeColumn);
});

async function formatGradeResponse(grade: any) {
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: grade.gColumnId } });
    const subject = gradeColumn?.subjectId ? await prisma.subject.findUnique({ where: { id: gradeColumn.subjectId } }) : null;

    return {
        ...grade,
        subjectId: subject?.id,
        subjectName: subject?.name,
        date: gradeColumn?.date,
        weight: gradeColumn?.weight,
        gColumnName: gradeColumn?.name
    };
}

//GET ALL GRADES - TEACHER ONLY
app.get('/api/grades', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const grades = await prisma.grade.findMany();
    res.json(grades);
});

//DELETE SPECIFIC GRADE BY ID - TEACHER ONLY
app.delete('/api/grades/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeId = Number(req.params.id);
    if (isNaN(gradeId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade) {
        return res.status(404).json({ success: false, message: 'Grade not found' });
    }
    await prisma.grade.delete({ where: { id: gradeId } });
    res.json({ success: true, message: 'Grade deleted' });
});

//GET GRADES FROM X USER FUNCTION
async function getUserGrades(req: express.Request, res: express.Response, next: express.NextFunction, userId?: number) {
    try {
        /// AUTH ///
        if (req.session.userId !== userId) { if (await requireAuth(req, res, next, 5) !== true) { return; } }

        const allGrades = await prisma.grade.findMany();
        const userGrades = allGrades.filter(grade => grade.userId === userId);

        const formattedGrades = [];
        for (const grade of userGrades) {
            formattedGrades.push(await formatGradeResponse(grade));
        }

        return formattedGrades;
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
}

//GET SPECIFIC USER GRADES
app.get('/api/grades/:username', async (req, res, next) => {
    try {
        const userId = await userIdFromUsername(req.params.username);
        res.json(await getUserGrades(req, res, next, userId));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
});

//GET CURRENT USER GRADES
app.get('/api/mygrades', async (req, res, next) => {
    try {
        res.json(await getUserGrades(req, res, next, req.session.userId));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
});

//GET SPECIFIC GRADE VIA GRADECOLUMNID AND USERID
app.get('/api/grades/:studentId/:gradeColumnId', async (req, res, next) => {
    try {
        const studentId = Number(req.params.studentId);
        const gradeColumnId = Number(req.params.gradeColumnId);
        if (isNaN(studentId) || isNaN(gradeColumnId)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const grade = await prisma.grade.findFirst({ where: { userId: studentId, gColumnId: gradeColumnId } });
        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        /// AUTH ///
        if (req.session.userId !== studentId) { if (await requireAuth(req, res, next, 5) !== true) { return; } }

        const formattedGrade = await formatGradeResponse(grade);
        res.json(formattedGrade);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch grade' });
    }
});

//CREATE GRADE - TEACHER ONLY
app.post('/api/grades', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { value, userId, gradeColumnId } = req.body;

    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: Number(gradeColumnId) } });
    if (!gradeColumn) {
        return res.status(404).json({ success: false, message: 'Grade column not found' });
    }
    if (gradeColumn.TeacherId !== req.session.userId && await requireAuth(req, res, next, 5) !== true) {
        return res.status(403).json({ success: false, message: 'You can only add grades to your own grade columns' });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingGrade = await prisma.grade.findFirst({
        where: {
            userId: Number(userId),
            gColumnId: Number(gradeColumnId)
        }
    });
    if (existingGrade) {
        await prisma.grade.delete({ where: { id: existingGrade.id } });
    }

    const newGrade = await prisma.grade.create({
        data: {
            gColumnId: Number(gradeColumnId),
            userId: Number(userId),
            grade: Number(value)
        }
    });
    res.status(201).json(newGrade);
});

//DELETE GRADE - TEACHER ONLY
app.delete('/api/grades/:studentId/:gradeColumnId', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const studentId = Number(req.params.studentId);
    const gradeColumnId = Number(req.params.gradeColumnId);
    if (isNaN(studentId) || isNaN(gradeColumnId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const grade = await prisma.grade.findFirst({ where: { userId: studentId, gColumnId: gradeColumnId } });
    const gradeId = grade?.id;

    if (!grade) {
        return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: grade.gColumnId } });
    if (gradeColumn?.TeacherId !== req.session.userId && await requireAuth(req, res, next, 5) !== true) {
        return res.status(403).json({ success: false, message: 'You can only delete grades from your own grade columns' });
    }

    if (!gradeId) {
        return res.status(404).json({ success: false, message: 'Grade not found' });
    }
    await prisma.grade.delete({ where: { id: gradeId } });
    res.json({ success: true, message: 'Grade deleted' });
});

///////////////////////////////////////
//      --=== CLASSES STUFF ===--

//GET ALL CLASSES - TEACHER ONLY
app.get('/api/classes', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const classToUserRelagtions = await prisma.class.findMany({ include: { students: true } });

    const classToUser = classToUserRelagtions.map(c => ({ id: c.id, name: c.name, students: c.students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` })) }));
    res.json(classToUser);
});

///////////////////////////////////////
//      --=== SUBJECTS STUFF ===--

//GET ALL SUBJECTS - TEACHER ONLY
app.get('/api/subjects', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const subjects = await prisma.subject.findMany();
    res.json(subjects);
});

///////////////////////////////////////
//      --=== LESSONS STUFF ===--

//GET ALL LESSONS - TEACHER ONLY
app.get('/api/lessons', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const lessons = await prisma.lesson.findMany();
    res.json(lessons);
});

///////////////////////////////////////
//      --=== EVENTS STUFF ===--

//GET ALL EVENTS
app.get('/api/events', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 1) !== true) { return; }

    const events = await prisma.event.findMany({
        include: {
            participantsIndividuals: true,
            participantsClasses: {
                include: {
                    students: true
                }
            }
        }
    });

    const currentUser = req.session.userId ? await prisma.user.findUnique({ where: { id: req.session.userId } }) : null;
    const currentRole = currentUser?.role ?? '';
    const currentPrivilege = privileges[currentRole as keyof typeof privileges] ?? 0;

    const filteredEvents = events.filter(event => {
        const isParticipant = event.participantsIndividuals.some(u => u.id === req.session.userId) ||
            event.participantsClasses.some(c => c.students?.some(s => s.id === req.session.userId));

        if (isParticipant) {
            return true;
        }

        return currentPrivilege >= 5;
    });
    res.json(filteredEvents);
});

//CREATE EVENT - TEACHER AND ADMIN ONLY
app.post('/api/events', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const { title, description, startDate, endDate, type, startTime, allDay, participantIndividualIds, participantClassIds } = req.body;

    const newEvent = await prisma.event.create({
        data: {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            startTime: (startTime && startTime !== 'null') ? new Date(startTime) : new Date(startDate),
            allDay,
            participantsIndividuals: {
                connect: participantIndividualIds.map((id: number) => ({ id }))
            },
            participantsClasses: {
                connect: participantClassIds.map((id: number) => ({ id }))
            }
        },
        include: {
            participantsIndividuals: true,
            participantsClasses: {
                include: {
                    students: true
                }
            }
        }
    });
    res.status(201).json(newEvent);
});

//DELETE EVENT - TEACHER AND ADMIN ONLY
app.delete('/api/events/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const eventId = Number(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const deletedEvent = await prisma.event.delete({
        where: { id: eventId }
    });
    res.json(deletedEvent);
});

//UPDATE EVENT - TEACHER AND ADMIN ONLY
app.put('/api/events/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const eventId = Number(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const { title, description, startDate, endDate, type, startTime, allDay, participantIndividualIds, participantClassIds } = req.body;

    const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            startTime: (startTime && startTime !== 'null') ? new Date(startTime) : new Date(startDate),
            allDay,
            participantsIndividuals: {
                set: participantIndividualIds.map((id: number) => ({ id }))
            },
            participantsClasses: {
                set: participantClassIds.map((id: number) => ({ id }))
            }
        },
        include: {
            participantsIndividuals: true,
            participantsClasses: {
                include: {
                    students: true
                }
            }
        }
    });
    res.json(updatedEvent);
});

app.use(timetableRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
