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

router.get('/api/myattendance', async (req, res, next) => {
  if (await requireAuth(req, res, next, 1) !== true) return;
  const targetUserId = req.query.studentId ? Number(req.query.studentId) : req.session.userId!;
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId: targetUserId },
      include: {
        subject: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(records);
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
      where: { teacherId: req.session.userId! },
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

// ── Absence Notes ─────────────────────────────────────────────────────────────

router.get('/api/absence-notes', async (req, res, next) => {
  if (await requireAuth(req, res, next, 1) !== true) return;
  const targetUserId = req.query.studentId ? Number(req.query.studentId) : req.session.userId!;
  try {
    const notes = await prisma.absenceNote.findMany({
      where: { studentId: targetUserId },
    });
    res.json(notes);
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/api/absence-notes', async (req, res, next) => {
  if (await requireAuth(req, res, next, 1) !== true) return;
  const { attendanceId, reason, startDate, endDate, startPeriod, endPeriod, studentId } = req.body;
  
  try {
    if (attendanceId) {
      const attendance = await prisma.attendance.findUnique({ where: { id: Number(attendanceId) } });
      if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
      
      const note = await prisma.absenceNote.upsert({
        where: { attendanceId: Number(attendanceId) },
        update: { reason, status: 'sent' },
        create: {
          studentId: attendance.studentId,
          attendanceId: Number(attendanceId),
          reason,
          status: 'sent',
        },
      });
      return res.json(note);
    } else {
      // Range-based note
      const note = await prisma.absenceNote.create({
        data: {
          studentId: Number(studentId || req.session.userId!),
          reason,
          status: 'sent',
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          startPeriod: startPeriod ? Number(startPeriod) : null,
          endPeriod: endPeriod ? Number(endPeriod) : null,
        }
      });
      return res.json(note);
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/api/absence-notes/inbox', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    // Teachers (Head Teachers) see absence notes for the students in their class
    const notes = await prisma.absenceNote.findMany({
      where: {
        student: {
          classes: {
            some: {
              classTeacherId: req.session.userId!
            }
          }
        }
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        attendance: { include: { subject: true, class: { select: { id: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/api/absence-notes/:id/approve', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const note = await prisma.absenceNote.update({
      where: { id: Number(req.params.id) },
      data: { status: 'excused' },
    });
    // Mark the attendance record as excused (status: 'absent', absenceType: 'Excused absence')
    await prisma.attendance.update({
      where: { id: note.attendanceId },
      data: { status: 'absent', absenceType: 'Excused absence' }
    });
    res.json({ success: true, data: note });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/api/absence-notes/:id/bulk-approve', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const { attendanceIds } = req.body;
    if (!Array.isArray(attendanceIds)) throw new Error('attendanceIds must be an array');

    const note = await prisma.absenceNote.update({
      where: { id: Number(req.params.id) },
      data: { status: 'excused' },
    });

    await prisma.attendance.updateMany({
      where: { id: { in: attendanceIds.map(Number) } },
      data: { status: 'absent', absenceType: 'Excused absence' }
    });

    res.json({ success: true, data: note });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/api/absence-notes/:id/reject', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    // Delete the note, or set its status to something else. Let's delete it so parent can try again.
    const note = await prisma.absenceNote.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true, data: note });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/api/absence-notes/:id/resolve', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const { status, records } = req.body;
    // status: 'excused' | 'pending' | 'rejected'
    
    // Update the note
    const note = await prisma.absenceNote.update({
      where: { id: Number(req.params.id) },
      data: { status: status === 'pending' ? 'pending' : (status === 'rejected' ? 'rejected' : 'excused') },
    });

    if (status === 'rejected') {
      // If rejected, we don't necessarily update attendance (it stays absent unexcused)
      // but maybe we should ensure they are marked absent.
      // For now, just return the note.
      return res.json({ success: true, data: note });
    }

    // For excused or pending, we upsert the attendance records
    const attendanceStatus = 'absent';
    const absenceType = status === 'excused' ? 'Excused absence' : null;

    if (Array.isArray(records)) {
      for (const rec of records) {
        if (rec.id) {
          await prisma.attendance.update({
            where: { id: Number(rec.id) },
            data: { status: attendanceStatus, absenceType }
          });
        } else {
          await prisma.attendance.upsert({
            where: {
              date_studentId_subjectId_periodNumber: {
                date: new Date(rec.date),
                studentId: note.studentId,
                subjectId: Number(rec.subjectId),
                periodNumber: Number(rec.periodNumber)
              }
            },
            update: { status: attendanceStatus, absenceType },
            create: {
              date: new Date(rec.date),
              studentId: note.studentId,
              subjectId: Number(rec.subjectId),
              classId: Number(rec.classId),
              periodNumber: Number(rec.periodNumber),
              status: attendanceStatus,
              absenceType
            }
          });
        }
      }
    }
    res.json({ success: true, data: note });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/api/attendance/bulk', async (req, res, next) => {
  if (await requireAuth(req, res, next, 5) !== true) return;
  try {
    const { studentIds, startDate, endDate, status, absenceType } = req.body;
    if (!Array.isArray(studentIds) || !startDate || !endDate || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 1. Find classes for these students
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds.map(Number) } },
      include: { classes: true }
    });

    const classIds = new Set<number>();
    for (const s of students) {
      for (const c of s.classes) classIds.add(c.id);
    }

    // 2. Fetch timetables for these classes
    const timetables = await prisma.timeTable.findMany({
      where: { classId: { in: Array.from(classIds) } },
      include: { class: { include: { students: true } } }
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const createdCount = 0;

    // 3. For each date in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = days[d.getDay()];
      
      // Find timetables for this day
      const dayTimetables = timetables.filter(t => t.day === dayName);

      for (const tt of dayTimetables) {
        // Find which selected students are in this timetable's class
        const studentsInClass = tt.class.students.filter(s => studentIds.includes(s.id));

        for (const student of studentsInClass) {
          await prisma.attendance.upsert({
            where: {
              date_studentId_subjectId_periodNumber: {
                date: new Date(d),
                studentId: student.id,
                subjectId: tt.subjectId,
                periodNumber: tt.periodNumber
              }
            },
            update: { status, absenceType: absenceType ?? null },
            create: {
              date: new Date(d),
              studentId: student.id,
              subjectId: tt.subjectId,
              classId: tt.classId,
              periodNumber: tt.periodNumber,
              status,
              absenceType: absenceType ?? null
            }
          });
        }
      }
    }

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;