import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import bcrypt from 'bcrypt';
import timetableRouter from './timeTable.js';
import { prisma } from "./prisma.js";

import { requireAuth } from './auth.js';
import userRoutes from './userManagment.js';
import profileRouter from './userPage.js';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
    }
}

const app = express();
app.set('trust proxy', 1); // Trust first proxy to allow secure cookies on Render
const PORT = process.env.PORT || 3000;

const privileges = {
    "student": 1,
    "parent": 2,
    "teacher": 5,
    "admin": 10
};



app.use(cors({
    origin: (origin, callback) => {
        // Allow: no origin (curl, mobile), localhost, any *.onrender.com subdomain
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
app.use(profileRouter);


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
})






//LOGIN
async function login(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({ 
        where: { username },
        include: { children: { select: { id: true, firstName: true, lastName: true } } }
    });
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


//INITIALIZE CLEAN DATABASE - WHEN FIRED, REISGTER 4 USERS - ADMIN, TEACHER, STUDENT, PARENT WITH USERNAME = ROLE AND PASSWORD = ROLE
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

    // Create other users (teacher, student, parent) with their respective roles
    // ...

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
app.get('/api/users', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 10) !== true) { return; }

    const users = await prisma.user.findMany();
    res.json(users);
});

//GET ALL USERS OF ROLE - ADMIN ONLY
app.get('/api/users/:role', async (req, res, next) => {
    /// AUTH - if requesting all of STUDENT or all of PARENT then TEACHER and ADMIN can access ///
    if (req.params.role === 'student' || req.params.role === 'parent' || req.params.role === 'teacher') {
        if (await requireAuth(req, res, next, 5) !== true) { return; }
    } else {
        if (await requireAuth(req, res, next, 10) !== true) { return; }
    }

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
        const user = await prisma.user.findUnique({ 
            where: { id },
            include: { children: { select: { id: true, firstName: true, lastName: true } } }
        }); 

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
            subjectId: Number(subjectId), // 👈 make sure it's an Int
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

//UPDATE GRADE COLUMN - TEACHER ONLY
app.put('/api/gradeColumns/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const gradeColumnId = parseInt(req.params.id);
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
    // Add a subjectId and String subjectName to the grade for easier frontend handling and also add a date, weight and column name for better frontend handling

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
    const gradeId = parseInt(req.params.id);
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

        //format each grade with formatGradeResponse for easier frontend handling
        const formattedGrades = [];
        for (const grade of userGrades) {
            formattedGrades.push(await formatGradeResponse(grade));
        }

        return formattedGrades;
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
}

//GET SPECIFIC USER GRADES - ADMIN FOR FOREIGN, ALL FOR THEMSELVES
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
        let studentId = req.session.userId;
        if (req.query.studentId) {
            const requestedId = parseInt(req.query.studentId as string);
            const currentUser = await prisma.user.findUnique({ where: { id: req.session.userId! }, include: { children: true } });
            if (currentUser?.role === 'parent' && currentUser.children.some(c => c.id === requestedId)) {
                studentId = requestedId;
            } else if (await requireAuth(req, res, next, 5) !== true) { return; }
            else { studentId = requestedId; }
        }
        res.json(await getUserGrades(req, res, next, studentId));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user grades' });
    }
});


//GET SPECIFIC GRADE VIA GRADECOLUMNID AND USERID - TEACHER FOR FOREIGN, ALL FOR THEMSELVES
app.get('/api/grades/:studentId/:gradeColumnId', async (req, res, next) => {
    try {
        const { studentId, gradeColumnId } = req.params;

        // Check if grade exists
        const grade = await prisma.grade.findFirst({ where: { userId: Number(studentId), gColumnId: Number(gradeColumnId) } });
        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        /// AUTH ///
        if (req.session.userId !== Number(studentId)) { if (await requireAuth(req, res, next, 5) !== true) { return; } }

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

    // Check if the grade column exists and belongs to the teacher
    const gradeColumn = await prisma.gradeColumn.findUnique({ where: { id: Number(gradeColumnId) } });
    if (!gradeColumn) {
        return res.status(404).json({ success: false, message: 'Grade column not found' });
    }
    if (gradeColumn.TeacherId !== req.session.userId && await requireAuth(req, res, next, 5) !== true) {
        return res.status(403).json({ success: false, message: 'You can only add grades to your own grade columns' });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if there is not already a grade for this user and grade column
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
    //const gradeId = parseInt(req.params.id);
    const { studentId, gradeColumnId } = req.params;
    const grade = await prisma.grade.findFirst({ where: { userId: Number(studentId), gColumnId: Number(gradeColumnId) } });
    const gradeId = grade?.id;

    // Check if the grade exists
    if (!grade) {
        return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    // Check if the grade column belongs to the teacher
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

    const classes = await prisma.class.findMany();
    const classToUserRelagtions = await prisma.class.findMany({ 
        include: { students: true, groups: { include: { students: true } } } 
    });

    const classToUser = classToUserRelagtions.map(c => ({ 
        id: c.id, 
        name: c.name, 
        students: c.students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` })),
        groups: c.groups.map(g => ({
            id: g.id,
            name: g.name,
            studentIds: g.students.map(s => s.id)
        }))
    }));
    res.json(classToUser);
});

//CREATE CLASS - TEACHER ONLY
app.post('/api/classes', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  
  console.log('POST /api/classes body:', JSON.stringify(req.body)); // 👈 log it
  
  const { name, studentIds } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const newClass = await prisma.class.create({
      data: {
        name,
        students: studentIds?.length
          ? { connect: studentIds.map((id: any) => ({ id: Number(id) })) }
          : undefined,
      },
      include: { students: true },
    });
    res.status(201).json(newClass);
  } catch (e: any) {
    console.error('Prisma error:', e);
    res.status(500).json({ error: e.message }); // 👈 send error back
  }
});

//DELETE CLASS - TEACHER ONLY
app.delete('/api/classes/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }

    const classId = parseInt(req.params.id);
    const deletedClass = await prisma.class.delete({
        where: { id: classId }
    });
    res.json(deletedClass);
});

//UPDATE CLASS - TEACHER ONLY
app.put('/api/classes/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const classId = parseInt(req.params.id);
    const { name, studentIds } = req.body;
    const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: {
            name,
            students: {
                set: studentIds.map((id: number) => ({ id }))
            }
        },
        include: {
            students: true
        }
    });
    res.json(updatedClass);
});

// --- GROUP ROUTES ---
app.get('/api/classes/:classId/groups', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    try {
        const classId = parseInt(req.params.classId);
        const groups = await prisma.group.findMany({
            where: { classId },
            include: { students: { select: { id: true } } }
        });
        const formatted = groups.map(g => ({
            id: g.id,
            name: g.name,
            studentIds: g.students.map(s => s.id)
        }));
        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/classes/:classId/groups', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    try {
        const classId = parseInt(req.params.classId);
        const { name, studentIds } = req.body;
        const group = await prisma.group.create({
            data: {
                name,
                classId,
                students: { connect: studentIds.map((id: number) => ({ id })) }
            },
            include: { students: { select: { id: true } } }
        });
        res.status(201).json({
            id: group.id,
            name: group.name,
            studentIds: group.students.map(s => s.id)
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/groups/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    try {
        const id = parseInt(req.params.id);
        const { name, studentIds } = req.body;
        const group = await prisma.group.update({
            where: { id },
            data: {
                name,
                students: { set: studentIds.map((sid: number) => ({ id: sid })) }
            },
            include: { students: { select: { id: true } } }
        });
        res.json({
            id: group.id,
            name: group.name,
            studentIds: group.students.map(s => s.id)
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/groups/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    try {
        const id = parseInt(req.params.id);
        await prisma.group.delete({ where: { id } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

//GET CLASS OFF OF STUDENT ID - STUDENT AND TEACHER ONLY
app.get('/api/class/studentId/:studentId', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 1) !== true) { return; }

    const studentId = parseInt(req.params.studentId);
    const classInfo = await prisma.class.findFirst({
        where: {
            students: {
                some: {
                    id: studentId
                }
            }
        },
        include: {
            students: true
        }
    });

    // If not a class the user is a part of, require teahcer or admin auth
    if (!classInfo) {
        if (await requireAuth(req, res, next, 5) !== true) { return; }
        return res.status(404).json({ success: false, message: 'Class not found for this student' });
    }

    res.json(classInfo);
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

// CREATE SUBJECT (currently only GET /api/subjects exists)
app.post('/api/subjects', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const { name, code, color } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'name and code are required' });
  const subject = await prisma.subject.create({ data: { name, code: code.toUpperCase(), color: color ?? 'blue' } });
  res.status(201).json(subject);
});

// DELETE SUBJECT
app.delete('/api/subjects/:id', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const id = parseInt(req.params.id);
  await prisma.subject.delete({ where: { id } });
  res.json({ success: true });
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

//GET ALL EVENTS - ALL ROLES IF THEY ARE PARTICIPATING IN THEM, OTHERWISE ONLY ADMIN AND TEACHER
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

    const currentUser = req.session.userId ? await prisma.user.findUnique({ where: { id: req.session.userId }, include: { children: true } }) : null;
    let targetStudentId = req.session.userId;
    if (req.query.studentId && currentUser?.role === 'parent' && currentUser.children.some(c => c.id === parseInt(req.query.studentId as string))) {
        targetStudentId = parseInt(req.query.studentId as string);
    }
    const currentRole = currentUser?.role ?? '';
    const currentPrivilege = privileges[currentRole as keyof typeof privileges] ?? 0;

    // Filter events based on participation
    const filteredEvents = events.filter(event => {
        const isParticipant = event.participantsIndividuals.some(u => u.id === targetStudentId) ||
            event.participantsClasses.some(c => c.students?.some(s => s.id === targetStudentId));

        if (isParticipant) {
            return true; // User is a participant, include the event
        }

        // If not a participant, only include if user is admin or teacher
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

    const eventId = parseInt(req.params.id);
    const deletedEvent = await prisma.event.delete({
        where: { id: eventId }
    });
    res.json(deletedEvent);
});

//UPDATE EVENT - TEACHER AND ADMIN ONLY
app.put('/api/events/:id', async (req, res, next) => {
    /// AUTH ///
    if (await requireAuth(req, res, next, 5) !== true) { return; }
    const eventId = parseInt(req.params.id);
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





///////////////////////////////////////
//      --=== MESSAGES STUFF ===--

// GET INBOX
app.get('/api/messages/inbox', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const messages = await prisma.message.findMany({
        where: { recipientId: req.session.userId! },
        include: { sender: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
});

// GET SENT
app.get('/api/messages/sent', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const messages = await prisma.message.findMany({
        where: { senderId: req.session.userId! },
        include: { recipient: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
});

// SEND MESSAGE
app.post('/api/messages', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }

    const { recipientId, recipientIds, body } = req.body;

    if (!body) {
        return res.status(400).json({ success: false, message: 'body is required' });
    }

    // Handle multiple recipients
    if (recipientIds && Array.isArray(recipientIds)) {
        await Promise.all(recipientIds.map((id: number) =>
            prisma.message.create({
                data: {
                    senderId: req.session.userId!,
                    recipientId: Number(id),
                    body
                }
            })
        ));
        return res.status(201).json({ success: true });
    }

    // Handle single recipient
    if (!recipientId) {
        return res.status(400).json({ success: false, message: 'recipientId is required' });
    }

    const message = await prisma.message.create({
        data: {
            senderId: req.session.userId!,
            recipientId: Number(recipientId),
            body
        }
    });
    res.status(201).json(message);
});

// GET RECIPIENTS
app.get('/api/messages/recipients', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const users = await prisma.user.findMany({
        where: { id: { not: req.session.userId! } },
        select: { id: true, firstName: true, lastName: true, role: true }
    });
    res.json(users);
});

// GET CLASSES FOR MESSAGING
app.get('/api/messages/classes', async (req, res, next) => {
    if (await requireAuth(req, res, next, 1) !== true) { return; }
    const classes = await prisma.class.findMany({
        select: { id: true, name: true, students: { select: { id: true } } }
    });
    res.json(classes);
});

// TEMP - create message table
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






/////////////////////////////////////////
//      --=== ROOMS STUFF ===--
// GET ALL ROOMS
app.get('/api/rooms', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const rooms = await prisma.room.findMany({ orderBy: { name: 'asc' } }) || [];
  res.json(rooms);
});

// CREATE ROOM
app.post('/api/rooms', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const room = await prisma.room.create({ data: { name } });
    res.status(201).json(room);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE ROOM
app.delete('/api/rooms/:id', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const id = parseInt(req.params.id);
  await prisma.room.delete({ where: { id } });
  res.json({ success: true });
});





///////////////////////////////////////
//      --=== LESSON TOPICS STUFF ===--

// GET lesson topics for a class on a date
// GET /api/lesson-topics?classId=1&date=2026-06-04
app.get('/api/lesson-topics', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const { classId, date } = req.query;
  if (!classId || !date) return res.status(400).json({ error: 'classId and date are required' });
  try {
    const topics = await prisma.lessonTopic.findMany({
      where: { classId: Number(classId), date: new Date(date as string) },
      include: { subject: { select: { id: true, name: true } } },
    });
    res.json(topics);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// UPSERT lesson topic
// POST /api/lesson-topics
app.post('/api/lesson-topics', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const { date, classId, subjectId, topic } = req.body;
  if (!date || !classId || !subjectId || topic === undefined) {
    return res.status(400).json({ error: 'date, classId, subjectId, topic are required' });
  }
  try {
    const record = await prisma.lessonTopic.upsert({
      where: {
        date_classId_subjectId: {
          date: new Date(date),
          classId: Number(classId),
          subjectId: Number(subjectId),
        }
      },
      update: { topic },
      create: {
        date: new Date(date),
        classId: Number(classId),
        subjectId: Number(subjectId),
        topic,
      }
    });
    res.json(record);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


///////////////////////////////////////
//      --=== ABSENCE NOTES STUFF ===--

// GET absence notes for current student
// GET /api/absence-notes
app.get('/api/absence-notes', async (req, res, next) => {
  if (await requireAuth(req, res, next, 1) !== true) { return; }
  let studentId = req.session.userId!;
  if (req.query.studentId) {
      const requestedId = parseInt(req.query.studentId as string);
      const currentUser = await prisma.user.findUnique({ where: { id: req.session.userId! }, include: { children: true } });
      if (currentUser?.role === 'parent' && currentUser.children.some(c => c.id === requestedId)) {
          studentId = requestedId;
      } else if (await requireAuth(req, res, next, 5) !== true) { return; }
      else { studentId = requestedId; }
  }
  try {
    const notes = await prisma.absenceNote.findMany({
      where: { studentId },
      include: {
        attendance: {
          include: { subject: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE absence note (student submits excuse)
// POST /api/absence-notes
app.post('/api/absence-notes', async (req, res, next) => {
  if (await requireAuth(req, res, next, 1) !== true) { return; }
  const { attendanceId, reason } = req.body;
  if (!attendanceId || !reason?.trim()) {
    return res.status(400).json({ error: 'attendanceId and reason are required' });
  }
  try {
    // Verify the attendance record belongs to this student
    const attendance = await prisma.attendance.findUnique({ where: { id: Number(attendanceId) } });
    if (!attendance) return res.status(404).json({ error: 'Attendance record not found' });
    let isAuthorized = attendance.studentId === req.session.userId;
    if (!isAuthorized) {
        const currentUser = await prisma.user.findUnique({ where: { id: req.session.userId! }, include: { children: true } });
        if (currentUser?.role === 'parent' && currentUser.children.some(c => c.id === attendance.studentId)) {
            isAuthorized = true;
        }
    }
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not your attendance record' });
    }

    const note = await prisma.absenceNote.upsert({
      where: { attendanceId: Number(attendanceId) },
      update: { reason: reason.trim() },
      create: {
        studentId: attendance.studentId,
        attendanceId: Number(attendanceId),
        reason: reason.trim(),
      }
    });
    res.status(201).json(note);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});





///////////////////////////////////////
//      --=== ATTENDANCE STUFF ===--

// GET attendance for a class on a date
// GET /api/attendance?classId=1&date=2026-06-04
app.get('/api/attendance', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const { classId, date } = req.query;
  if (!classId || !date) return res.status(400).json({ error: 'classId and date are required' });
  try {
    const records = await prisma.attendance.findMany({
      where: {
        classId: Number(classId),
        date: new Date(date as string),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        subject: { select: { id: true, name: true, code: true } },
      }
    });
    res.json(records);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// UPSERT attendance record
// POST /api/attendance
app.post('/api/attendance', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) { return; }
  const { date, studentId, subjectId, classId, status, absenceReason } = req.body;
  if (!date || !studentId || !subjectId || !classId || !status) {
    return res.status(400).json({ error: 'date, studentId, subjectId, classId, status are required' });
  }
  try {
    const record = await prisma.attendance.upsert({
      where: {
        date_studentId_subjectId: {
          date: new Date(date),
          studentId: Number(studentId),
          subjectId: Number(subjectId),
        }
      },
      update: { status, absenceReason: absenceReason ?? null },
      create: {
        date: new Date(date),
        studentId: Number(studentId),
        subjectId: Number(subjectId),
        classId: Number(classId),
        status,
        absenceReason: absenceReason ?? null,
      }
    });
    res.json(record);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET absences for a specific student
app.get('/api/attendance/student/:studentId', async (req, res, next) => {
  if (await requireAuth(req, res, next, 1) !== true) { return; }
  const studentId = parseInt(req.params.studentId);
  if (req.session.userId !== studentId) {
    if (await requireAuth(req, res, next, 5) !== true) { return; }
  }
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId, status: 'absent' },
      include: {
        subject: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

//GET ABSENCES FOR THE CURRENT STUDENT
app.get('/api/myattendance', async (req, res, next) => {
  if (await requireAuth(req, res, next, 1) !== true) { return; }
  let studentId = req.session.userId!;
  if (req.query.studentId) {
      const requestedId = parseInt(req.query.studentId as string);
      const currentUser = await prisma.user.findUnique({ where: { id: req.session.userId! }, include: { children: true } });
      if (currentUser?.role === 'parent' && currentUser.children.some(c => c.id === requestedId)) {
          studentId = requestedId;
      } else if (await requireAuth(req, res, next, 5) !== true) { return; }
      else { studentId = requestedId; }
  }
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId, status: 'absent' },
      include: {
        subject: { select: { id: true, name: true } },  
      },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});




























app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
