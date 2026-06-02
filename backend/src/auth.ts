import express from 'express';
import cors from 'cors';
import 'dotenv/config';
//import { PrismaClient } from '@prisma/client';
import session from 'express-session';
import { prisma } from "./prisma.js";

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
export async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction, permissionLevel: number) {

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

export function roleAuthority(requiredRole: keyof typeof privileges) {
    return privileges[requiredRole] ?? 0; // default to 0 if role not found
}