import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get("/api/timetables/student/:userId", async (req, res, next) => {
    const userIdentifier = req.params.userId;
    /// AUTH ///;
    const user = await prisma.user.findFirst({
        where: { username: userIdentifier },
        include: {
            classes: true
        }
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User does not exist or does not have assigned class'
        });
    }
    if (user.role !== 'teacher' && user.classes.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'User does not exist or does not have assigned class'
        });
    }
    if ((user.role !== 'teacher')) {
        const studentClassId = user.classes[0]?.id;
        if (!studentClassId) {
            return res.status(404).json({
                success: false,
                message: 'User does not exist or does not have assigned class'
            });
        }

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
    }
    else if (user.role === "teacher") {
        const teacherId = user.id;
        const timetable = await prisma.timeTable.findMany({
            where: {
                teacherId: teacherId
            },
            include: {
                subject: true,
                teacher: true,
                class: true
            }
        });
        res.json(timetable);
    }

});

export default router;