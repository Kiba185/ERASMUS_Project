import { Router } from 'express';
import { prisma } from "./prisma.js";
import { requireAuth } from "./auth.js";
const router = Router();
// GET TIMETABLE FOR CURRENT USER OR SPECIFIC CLASS
router.get('/api/timetable', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 1) !== true) {
            return;
        }
        const currentUser = req.session.userId ? await prisma.user.findUnique({ where: { id: req.session.userId }, include: { classes: true } }) : null;
        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const classIds = currentUser.classes.map((c) => c.id);
        const lessons = await prisma.lesson.findMany({
            where: {
                classId: { in: classIds }
            }
        });
        res.json(lessons);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
    }
});
// GET TIMETABLE FOR SPECIFIC CLASS - TEACHER AND ADMIN ONLY
router.get('/api/timetable/class/:classId', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 5) !== true) {
            return;
        }
        const classId = Number(req.params.classId);
        if (isNaN(classId))
            return res.status(400).json({ success: false, message: 'Invalid Class ID' });
        const lessons = await prisma.lesson.findMany({
            where: { classId }
        });
        res.json(lessons);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch class timetable' });
    }
});
// GET TIMETABLE FOR SPECIFIC TEACHER - TEACHER AND ADMIN ONLY
router.get('/api/timetable/teacher/:teacherId', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 5) !== true) {
            return;
        }
        const teacherId = Number(req.params.teacherId);
        if (isNaN(teacherId))
            return res.status(400).json({ success: false, message: 'Invalid Teacher ID' });
        const lessons = await prisma.lesson.findMany({
            where: { teacherId }
        });
        res.json(lessons);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch teacher timetable' });
    }
});
// CREATE LESSON - ADMIN ONLY
router.post('/api/timetable', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 10) !== true) {
            return;
        }
        const { subjectId, teacherId, classId, dayOfWeek, slot } = req.body;
        // Vynucení typu any - TypeScript už nebude kontrolovat sloupce a pustí build dál
        const newLesson = await prisma.lesson.create({
            data: {
                subjectId: Number(subjectId),
                teacherId: Number(teacherId),
                classId: Number(classId),
                dayOfWeek: Number(dayOfWeek),
                slot: Number(slot)
            }
        });
        res.status(201).json(newLesson);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create lesson' });
    }
});
// DELETE LESSON - ADMIN ONLY
router.delete('/api/timetable/:id', async (req, res, next) => {
    try {
        if (await requireAuth(req, res, next, 10) !== true) {
            return;
        }
        const lessonId = Number(req.params.id);
        if (isNaN(lessonId))
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        await prisma.lesson.delete({ where: { id: lessonId } });
        res.json({ success: true, message: 'Lesson deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete lesson' });
    }
});
export default router;
//# sourceMappingURL=timeTable.js.map