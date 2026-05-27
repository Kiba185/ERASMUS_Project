import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import session from 'express-session';
import bcrypt from 'bcrypt';

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

app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'cisco', // put this in a .env file!
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
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
app.post('/api/admin/setuser', async (req, res) => {
    await adminsetuser(req, res, next);
})






///////////////////////////////////////////////
//      --=== AUTH/PERMISSION STUFF ===--


//AUTH
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction, permissionLevel: number) {

    if (!req.session.userId) {
        res.status(401).json({ error: 'Not logged in' });
        return false;
    }

    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) {
        res.status(401).json({ error: 'User not found' });
        return false;
    }

    const userRole = (user.role || 'user') as keyof typeof privileges;
    if (roleAuthority(userRole) < permissionLevel) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return false;
    }

    return true;
    //next(); // ✅ they're logged in, let them through

}

function roleAuthority(requiredRole: keyof typeof privileges) {
    return privileges[requiredRole] ?? 0; // default to 0 if role not found
}

//LOGIN
async function login(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id; // store user ID in session
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        // Timeout to prevent brute-force attacks
        setTimeout(() => { logout(req, res, next); }, 1000);
    }
}
app.post('/api/login', async (req, res) => {
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
app.post('/api/register', async (req, res) => {
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
app.post('/api/logout', async (req, res) => {
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
app.post('/api/setUserRole', async (req, res) => {
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






app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function next(): express.NextFunction {
    throw new Error('Function not implemented.');
}

