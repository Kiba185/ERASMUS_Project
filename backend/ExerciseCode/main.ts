import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import session from 'express-session';
import bcrypt from 'bcrypt';

import { requireAuth } from './auth.ts';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
    }
}

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;

const privileges = {
    "student": 1,
    "parent": 2,
    "teacher": 5,
    "admin": 10
};



app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true               
}));
app.use(express.json());
app.use(session({
    secret: 'cisco',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));





//////////////////////////////////////
//      --=== MISC STUFF ===--

async function userIdFromUsername(username: string) {
    const user = await prisma.user.findFirst({ where: { username } });
    return user?.id ?? 0;
}




////////////////////////////////////////
//      --=== ADMIN STUFF ===--

//DELETE ALL USERS
app.get('/api/admin/users/deleteall', async (req, res) => {
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
})






//LOGIN
async function login(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id; // store user ID in session
        req.session.save((err) => {
            if (err) return res.status(500).json({ success: false });

            // Don't send the password back in the response
            const { password: _, ...safeUser } = user;
            res.json({ success: true, user: safeUser });
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        // Timeout to prevent brute-force attacks
        setTimeout(() => { logout(req, res, next); }, 1000);
    }
}
app.post('/api/login', async (req, res, next) => {
    await login(req, res, next);
})


//REGISTER
async function register(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { firstName, lastName, birthday, username, password, email, phone, adress } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (await prisma.user.findFirst({ where: { username } })) { return res.status(400).json({ success: false, message: 'Username already exists' }) };
    const userRole = username === 'admin' ? 'admin' : 'student'; // default role for new users
    const newUser = await prisma.user.create({
        data: { password: hashedPassword, firstName, lastName, birthday, username, email, phone, adress, role: userRole }
    });

    if (!newUser) { return res.status(400).json({ success: false, message: 'User creation failed' }); }
    res.status(201).json({ success: true, user: newUser });
    //await login(req, res, next);
}
app.post('/api/register', async (req, res, next) => {
    await register(req, res, next);
})


//LOGOUT
async function logout(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        
        try {
            return res.json({ success: true, message: 'Logged out successfully' });
        } catch (err) {
            return
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
app.get('/api/users', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const users = await prisma.user.findMany();
    res.json(users);
});

//GET ALL USERS OF ROLE - ADMIN ONLY
app.get('/api/users/:role', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const users = await prisma.user.findMany({ where: { role: req.params.role } });
    const usersToClassesRelations = await prisma.user.findMany({ where: { role: req.params.role }, include: { classes: true } });
    //const classes = usersToClassesRelations.find(uc => uc.id === u.id)?.classes || [];

    const userInfoWithClasses = users.map(u => {
        const classes = usersToClassesRelations.find(uc => uc.id === u.id)?.classes || [];
        return { ...u, classes: classes.map(c => ({ id: c.id, name: c.name })) };
    });
    res.json(userInfoWithClasses);
});

//GET SPECIFIC USER - ADMIN FOR FOREIGN, ALL FOR THEMSELVES
app.get('/api/user/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await prisma.user.findFirst({ where: { username } });

        /// AUTH ///
        if (req.session.userId !== user?.id) { if (await requireAuth(req, res, next, 10) !== true) { return; } }

        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});

//GET CURRENT USER
app.get('/api/user', async (req, res) => {
    try {
        const id = req.session.userId;
        const user = await prisma.user.findUnique({ where: { id } });

        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
});






///////////////////////////////////////
//      --=== GRADE STUFF ===--

//GET ALL GRADE COLUMNS - ADMIN ONLY
app.get('/api/gradeColumns', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const gradeColumns = await prisma.gradeColumn.findMany();
    res.json(gradeColumns);
});

//CREATE GRADE COLUMN - TEACHER ONLY
app.post('/api/gradeColumns', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const { name, subjectId, weight, date } = req.body;
    const newGradeColumn = await prisma.gradeColumn.create({
        data: { name, subjectId, weight, date, TeacherId: req.session.userId! }
    });
    res.status(201).json(newGradeColumn);
});

//DELETE GRADE COLUMN - TEACHER ONLY
app.delete('/api/gradeColumns/:id', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const gradeColumnId = parseInt(req.params.id);
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



//GET ALL GRADES - ADMIN ONLY
app.get('/api/grades', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const grades = await prisma.grade.findMany();
    res.json(grades);
});

//GET GRADES FROM X USER FUNCTION
async function getUserGrades(req: express.Request, res: express.Response, next: express.NextFunction, userId?: number) {
    try {
        /// AUTH ///
        if (req.session.userId !== userId) { if (await requireAuth(req, res, next, 10) !== true) { return; } }

        const allGrades = await prisma.grade.findMany();
        const userGrades = allGrades.filter(grade => grade.userId === userId);

        return userGrades;
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
}

//GET SPECIFIC USER GRADES - ADMIN FOR FOREIGN, ALL FOR THEMSELVES
app.get('/api/grades/:username', async (req, res) => {
    try {
        const userId = await userIdFromUsername(req.params.username);
        res.json(await getUserGrades(req, res, next, userId));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
});

//GET CURRENT USER GRADES
app.get('/api/mygrades', async (req, res) => {
    try {
        res.json(await getUserGrades(req, res, next, req.session.userId));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
});







///////////////////////////////////////
//      --=== CLASSES STUFF ===--

//GET ALL CLASSES - ADMIN ONLY
app.get('/api/classes', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const classes = await prisma.class.findMany();
    const classToUserRelagtions = await prisma.class.findMany({ include: { students: true } });

    const classToUser = classToUserRelagtions.map(c => ({ id: c.id, name: c.name, students: c.students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` })) }));
    res.json(classToUser);
});






///////////////////////////////////////
//      --=== SUBJECTS STUFF ===--

//GET ALL SUBJECTS - ADMIN ONLY
app.get('/api/subjects', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const subjects = await prisma.subject.findMany();
    res.json(subjects);
});









///////////////////////////////////////
//      --=== LESSONS STUFF ===--

//GET ALL LESSONS - ADMIN ONLY
app.get('/api/lessons', async (req, res) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const lessons = await prisma.lesson.findMany();
    res.json(lessons);
});





















app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function next(): express.NextFunction {
    throw new Error('Function not implemented.');
}

