import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { requireAuth } from './auth.ts';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// 🔴 Místo "app = express()" použijeme ROUTER
const router = express.Router();

// 🔴 Místo "app.get" píšeš "router.get"
router.get("/api/timetables/student/:userId", async (req, res, next) => {
    const studentIdentifier = req.params.userId;
    /// AUTH ///;
    const user = await prisma.user.findFirst({
        where: { username: studentIdentifier },
        include: {
            classes: true
        }
    });

    if (!user || user.classes.length === 0) {
        return res.status(404).json({ 
            success: false, 
            message: 'Student does not exist or does not have assigned class' 
        });
    }

    const studentClassId = user.classes[0].id; // 👈 Tady to bylo úplně bez vykřičníku

    const timetable = await prisma.timeTable.findMany({
        where: { 
            classId: studentClassId 
        },
        include: {
            subject: true,
            teacher: true,
            class: true
        }
    });
    res.json(timetable);
});

export default router;