import express from 'express';
import { prisma } from './prisma.js';
import { requireAuth } from './auth.js';

const router = express.Router();

const toDate = (dateStr: string) => new Date(`${dateStr}T00:00:00.000Z`);

// ── Attendance ────────────────────────────────────────────────────────────────

router.get('/api/attendance/:classId/:date', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const records = await prisma.attendance.findMany({
      where: {
        classId: Number(req.params.classId),
        date: toDate(req.params.date),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        subject: { select: { id: true, name: true } },
      },
    });
    res.json({ success: true, data: records });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/api/attendance', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  const { studentId, subjectId, classId, date, periodNumber = 0, status, absenceType, absenceReason } = req.body;
  try {
    const record = await prisma.attendance.upsert({
      where: {
        date_studentId_subjectId_periodNumber: {
          date: toDate(date),
          studentId: Number(studentId),
          subjectId: Number(subjectId),
          periodNumber: Number(periodNumber),
        },
      },
      update: {
        status,
        absenceType: absenceType ?? null,
        absenceReason: absenceReason ?? null,
      },
      create: {
        date: toDate(date),
        studentId: Number(studentId),
        subjectId: Number(subjectId),
        classId: Number(classId),
        periodNumber: Number(periodNumber),
        status,
        absenceType: absenceType ?? null,
        absenceReason: absenceReason ?? null,
      },
    });
    res.json({ success: true, data: record });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Lesson Topics ─────────────────────────────────────────────────────────────

router.get('/api/lesson-topics/:classId/:date', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const topics = await prisma.lessonTopic.findMany({
      where: {
        classId: Number(req.params.classId),
        date: toDate(req.params.date),
      },
      include: { subject: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: topics });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/api/lesson-topics', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  const { classId, subjectId, date, periodNumber = 0, topic } = req.body;
  try {
    const result = await prisma.lessonTopic.upsert({
      where: {
        date_classId_subjectId_periodNumber: {
          date: toDate(date),
          classId: Number(classId),
          subjectId: Number(subjectId),
          periodNumber: Number(periodNumber),
        },
      },
      update: { topic },
      create: {
        date: toDate(date),
        classId: Number(classId),
        subjectId: Number(subjectId),
        periodNumber: Number(periodNumber),
        topic,
      },
    });
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Teacher Timetable ─────────────────────────────────────────────────────────

router.get('/api/teacher-timetable', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const lessons = await prisma.timeTable.findMany({
      where: { teacherId: req.session.userId!, isPermanent: true },
      include: {
        subject: { select: { id: true, name: true } },
        class:   { select: { id: true, name: true } },
        room:    { select: { id: true, name: true } },
      },
    });
    res.json({ success: true, data: lessons });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Class Subjects (from timetable) ──────────────────────────────────────────

router.get('/api/class-subjects/:classId', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const lessons = await prisma.timeTable.findMany({
      where: { classId: Number(req.params.classId), isPermanent: true },
      select: { subject: { select: { id: true, name: true } } },
      distinct: ['subjectId'],
    });
    res.json({ success: true, data: lessons.map(l => l.subject) });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;