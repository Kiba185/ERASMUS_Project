import express from 'express';
import { prisma } from "./prisma.js";

const router = express.Router();

// ---------------------------------------------------------
// Získání možností pro roletky v Reactu (Setup data)
// ---------------------------------------------------------
router.get("/api/setup-data", async (req, res) => {
    try {
        const classes = await prisma.class.findMany({ select: { id: true, name: true } });
        const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
        const teachers = await prisma.user.findMany({ 
            where: { role: 'teacher' },
            select: { id: true, firstName: true, lastName: true } 
        });
        // 🌟 NOVÉ: Přidáno načítání místností pro roletku
        const rooms = await prisma.room.findMany({ select: { id: true, name: true } });

        res.json({ success: true, data: { classes, subjects, teachers, rooms } });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// GET /api/periods - Získání seznamu vyučovacích hodin
// ---------------------------------------------------------
router.get("/api/periods", async (req, res) => {
    try {
        let periods = await prisma.period.findMany({
            orderBy: { periodNumber: 'asc' }
        });

        if (periods.length === 0) {
            const defaultPeriods = [
                { periodNumber: 1, startTime: '08:00', endTime: '08:45' },
                { periodNumber: 2, startTime: '08:55', endTime: '09:40' },
                { periodNumber: 3, startTime: '10:00', endTime: '10:45' },
                { periodNumber: 4, startTime: '10:55', endTime: '11:40' },
                { periodNumber: 5, startTime: '11:50', endTime: '12:35' },
                { periodNumber: 6, startTime: '12:45', endTime: '13:30' }
            ];
            await prisma.period.createMany({ data: defaultPeriods });
            periods = await prisma.period.findMany({
                orderBy: { periodNumber: 'asc' }
            });
        }

        res.json({ success: true, data: periods });
    } catch (error: any) {
        console.error("Failed to load periods", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// POST /api/periods - Uložení upravených vyučovacích hodin (Admin Only)
// ---------------------------------------------------------
router.post("/api/periods", async (req, res) => {
    try {
        const { periods } = req.body;
        if (!Array.isArray(periods)) {
            return res.status(400).json({ success: false, message: "Invalid payload format. Expected array." });
        }

        // Validate payload elements
        const formattedPeriods = periods.map((p: any) => ({
            periodNumber: Number(p.periodNumber),
            startTime: String(p.startTime),
            endTime: String(p.endTime)
        }));

        // Use transaction to clear and insert
        await prisma.$transaction([
            prisma.period.deleteMany(),
            prisma.period.createMany({ data: formattedPeriods })
        ]);

        const updatedPeriods = await prisma.period.findMany({
            orderBy: { periodNumber: 'asc' }
        });

        res.json({ success: true, data: updatedPeriods });
    } catch (error: any) {
        console.error("Failed to save periods", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// 1. CREATE (Vytvoření nové hodiny) - ADMIN ONLY
// ---------------------------------------------------------
router.post("/api/timetables/edit/:userId", async (req, res, next) => {
    const userIdentifier = req.params.userId;
    
    // --- AUTH LOGIKA ---
    const adminUser = await prisma.user.findFirst({ where: { username: userIdentifier } });
    if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const { day, time, subject, teacher, className, room, weekType, group, isPermanent, exceptionDate, status, templateId, periodNumber } = req.body;

        const [startTime, endTime] = time.split(' - ');

        // 2. Nalezení IDček pro propojení relací
        const targetClass = await prisma.class.findFirst({ where: { name: className } });
        const targetSubject = await prisma.subject.findFirst({ where: { name: subject } });
        const teacherLastName = teacher.split(' ').pop(); 
        const targetTeacher = await prisma.user.findFirst({ where: { lastName: teacherLastName } });
        
        // 🌟 NOVÉ: Najdeme ID místnosti podle názvu
        const targetRoom = await prisma.room.findFirst({ where: { name: room } });

       if (!targetClass || !targetSubject || !targetTeacher || !targetRoom) {
            // 🌟 Vylepšená chybová hláška, která přesně řekne, co chybí!
            return res.status(400).json({ 
                success: false, 
                message: `Chyba uložení! V DB chybí: ` +
                         `${!targetClass ? 'Třída ('+className+'), ' : ''}` +
                         `${!targetSubject ? 'Předmět ('+subject+'), ' : ''}` +
                         `${!targetTeacher ? 'Učitel ('+teacherLastName+'), ' : ''}` +
                         `${!targetRoom ? 'Místnost ('+room+')' : ''}`
            });
        }

        // 3. Vytvoření v Prisma DB (s použitím cizích klíčů)
        const newTimetable = await prisma.timeTable.create({
            data: {
                day: day,
                week: weekType || "all",
                startTime: startTime,
                endTime: endTime,
                periodNumber: periodNumber !== undefined ? Number(periodNumber) : 1, 
                group: group || "Whole Class",
                isPermanent: isPermanent !== undefined ? isPermanent : true,
                exceptionDate: exceptionDate || null,
                status: status || "active",
                templateId: templateId ? Number(templateId) : null,
                subjectId: targetSubject.id,
                teacherId: targetTeacher.id,
                classId: targetClass.id,
                roomId: targetRoom.id // 🌟 OPRAVA: Ukládáme roomId místo textu
            },
            // 🌟 OPRAVA: Přidáno room: true
            include: { subject: true, teacher: true, class: true, room: true }
        });

        res.json({ success: true, data: newTimetable });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// 2. UPDATE (Editing existing lesson) - ADMIN ONLY
// ---------------------------------------------------------
router.put("/api/timetables/edit/:userId/:timetableId", async (req, res, next) => {
    const { userId, timetableId } = req.params;
    
    const adminUser = await prisma.user.findFirst({ where: { username: userId } });
    if (!adminUser || adminUser.role !== 'admin') return res.status(403).json({ success: false });

    try {
        const { day, time, subject, teacher, className, room, weekType, group, isPermanent, exceptionDate, status, templateId, periodNumber } = req.body;
        const [startTime, endTime] = time.split(' - ');

        // Znovu musíme najít IDčka podle textů
        const targetClass = await prisma.class.findFirst({ where: { name: className } });
        const targetSubject = await prisma.subject.findFirst({ where: { name: subject } });
        const targetTeacher = await prisma.user.findFirst({ where: { lastName: teacher.split(' ').pop() } });
        const targetRoom = await prisma.room.findFirst({ where: { name: room } }); // 🌟 NOVÉ

        if (!targetClass || !targetSubject || !targetTeacher || !targetRoom) {
            return res.status(400).json({ success: false, message: "Missing relational data." });
        }

        const updatedTimetable = await prisma.timeTable.update({
            where: { id: Number(timetableId) },
            data: {
                day, 
                week: weekType, 
                startTime, 
                endTime, 
                periodNumber: periodNumber !== undefined ? Number(periodNumber) : undefined,
                group: group || "Whole Class",
                isPermanent: isPermanent !== undefined ? isPermanent : undefined,
                exceptionDate: exceptionDate !== undefined ? exceptionDate : undefined,
                status: status || undefined,
                templateId: templateId !== undefined ? (templateId ? Number(templateId) : null) : undefined,
                subjectId: targetSubject.id,
                teacherId: targetTeacher.id,
                classId: targetClass.id,
                roomId: targetRoom.id // 🌟 OPRAVA
            },
            include: { subject: true, teacher: true, class: true, room: true } // 🌟 OPRAVA
        });

        res.json({ success: true, data: updatedTimetable });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// 3. DELETE (Deleting lesson) - ADMIN ONLY
// ---------------------------------------------------------
router.delete("/api/timetables/edit/:userId/:timetableId", async (req, res, next) => {
    // ... tvůj původní kód (delete se nemění)
    const { userId, timetableId } = req.params;
    const adminUser = await prisma.user.findFirst({ where: { username: userId } });
    if (!adminUser || adminUser.role !== 'admin') return res.status(403).json({ success: false });

    try {
        await prisma.timeTable.delete({ where: { id: Number(timetableId) } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// 4. GET TIMETABLE (Načítání rozvrhu pro studenty a učitele)
// ---------------------------------------------------------
router.get("/api/timetables/:userId", async (req, res, next) => {
    const userIdentifier = req.params.userId;
    const isId = !isNaN(Number(userIdentifier));
    
    const user = await prisma.user.findFirst({
        where: isId ? { id: Number(userIdentifier) } : { username: userIdentifier },
        include: { classes: true }
    });

    if (!user) {
        return res.status(404).json({ success: false, message: 'User does not exist' });
    }

    if (user.role === "teacher") {
        const teacherId = user.id;
        const timetable = await prisma.timeTable.findMany({
            where: { teacherId: teacherId },
            include: {
                subject: true,
                teacher: true,
                class: true,
                room: true // 🌟 OPRAVA: Připojení místnosti
            }
        });
        return res.json(timetable);
    } 
    else {
        if (user.classes.length === 0) {
            return res.status(404).json({ success: false, message: 'Student does not have assigned class' });
        }

        const studentClassId = user.classes[0].id; 
        const timetable = await prisma.timeTable.findMany({
            where: { classId: studentClassId },
            include: {
                subject: true,
                teacher: true,
                class: true,
                room: true // 🌟 OPRAVA: Připojení místnosti
            }
        });
        return res.json(timetable);
    }
});
// ---------------------------------------------------------
// EXTRA: GET TIMETABLE BY CLASS ID
// ---------------------------------------------------------
router.get("/api/timetables/class-id/:classId", async (req, res) => {
    try {
        const timetable = await prisma.timeTable.findMany({
            where: { classId: Number(req.params.classId) },
            include: { subject: true, teacher: true, class: true, room: true }
        });
        res.json(timetable);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// EXTRA: GET TIMETABLE BY CLASS NAME (Pro editační stránku)
// ---------------------------------------------------------
router.get("/api/timetables/class/:className", async (req, res) => {
    try {
        const targetClass = await prisma.class.findFirst({
            where: { name: req.params.className }
        });

        // Pokud třída neexistuje, vrátíme prázdné pole (žádné hodiny)
        if (!targetClass) {
            return res.json([]); 
        }

        const timetable = await prisma.timeTable.findMany({
            where: { classId: targetClass.id },
            include: { subject: true, teacher: true, class: true, room: true }
        });
        
        res.json(timetable);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;