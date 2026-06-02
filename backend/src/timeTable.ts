import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from './auth.ts';

const router = Router();

// Čistá inicializace podle standardu Prisma 7
const prisma = new PrismaClient();

const privileges = {
    "student": 1,
    "parent": 2,
    "teacher": 5,
    "admin": 10
};

// GET TIMETABLE FOR CURRENT USER OR SPECIFIC CLASS
router.get('/api/timetable', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 1) !== true) { return; }

        const currentUser = req.session.userId ? await prisma.user.findUnique({ where: { id: req.session.userId }, include: { classes: true } }) : null;
        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const classIds = currentUser.classes.map(c => c.id);

        const lessons = await prisma.lesson.findMany({
            where: {
                classId: { in: classIds }
            },
            include: {
                subject: true,
                teacher: true,
                room: true,
                class: true
            }
        });

        res.json(lessons);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
    }
});

// GET TIMETABLE FOR SPECIFIC CLASS - TEACHER AND ADMIN ONLY
router.get('/api/timetable/class/:classId', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 5) !== true) { return; }

        const classId = Number(req.params.classId);
        if (isNaN(classId)) return res.status(400).json({ success: false, message: 'Invalid Class ID' });

        const lessons = await prisma.lesson.findMany({
            where: { classId },
            include: {
                subject: true,
                teacher: true,
                room: true,
                class: true
            }
        });

        res.json(lessons);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch class timetable' });
    }
});

// GET TIMETABLE FOR SPECIFIC TEACHER - TEACHER AND ADMIN ONLY
router.get('/api/timetable/teacher/:teacherId', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 5) !== true) { return; }

        const teacherId = Number(req.params.teacherId);
        if (isNaN(teacherId)) return res.status(400).json({ success: false, message: 'Invalid Teacher ID' });

        const lessons = await prisma.lesson.findMany({
            where: { teacherId },
            include: {
                subject: true,
                teacher: true,
                room: true,
                class: true
            }
        });

        res.json(lessons);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch teacher timetable' });
    }
});

// CREATE LESSON - ADMIN ONLY
router.post('/api/timetable', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 10) !== true) { return; }

        const { subjectId, teacherId, roomId, classId, dayOfWeek, slot } = req.body;

        const newLesson = await prisma.lesson.create({
            data: {
                subjectId: Number(subjectId),
                teacherId: Number(teacherId),
                roomId: Number(roomId),
                classId: Number(classId),
                dayOfWeek: Number(dayOfWeek),
                slot: Number(slot)
            }
        });

        res.status(201).json(newLesson);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create lesson' });
    }
});

// DELETE LESSON - ADMIN ONLY
router.delete('/api/timetable/:id', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 10) !== true) { return; }

        const lessonId = Number(req.params.id);
        if (isNaN(lessonId)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        await prisma.lesson.delete({ where: { id: lessonId } });
        res.json({ success: true, message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete lesson' });
    }
});

export default router;
