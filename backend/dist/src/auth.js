import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import session from 'express-session';
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
///////////////////////////////////////////////
//      --=== AUTH/PERMISSION STUFF ===--
//AUTH
export async function requireAuth(req, res, next, permissionLevel) {
    if (!req.session.userId) {
        res.status(401).json({ error: 'Not logged in' });
        return false;
    }
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) {
        res.status(401).json({ error: 'User not found' });
        return false;
    }
    const userRole = (user.role || 'user');
    if (roleAuthority(userRole) < permissionLevel) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return false;
    }
    return true;
    //next(); // ✅ they're logged in, let them through
}
export function roleAuthority(requiredRole) {
    return privileges[requiredRole] ?? 0; // default to 0 if role not found
}
//# sourceMappingURL=auth.js.map