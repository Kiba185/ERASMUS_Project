
//create timetable entry - ADMIN ONLY
import express from 'express';
import { prisma } from "./prisma.js";

const router = express.Router();



// Získání možností pro roletky v Reactu (Setup data)
router.get("/api/setup-data", async (req, res) => {
    try {
        // Vytáhneme z DB všechny třídy, předměty a uživatele, kteří mají roli 'teacher'
        const classes = await prisma.class.findMany({ select: { id: true, name: true } });
        const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
        const teachers = await prisma.user.findMany({ 
            where: { role: 'teacher' },
            select: { id: true, firstName: true, lastName: true } 
        });

        res.json({ success: true, data: { classes, subjects, teachers } });
    } catch (error) {
        console.error(error);
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
        // Data, která přijdou z Reactu (frontendu)
        const { day, time, subject, teacher, className, room, weekType, group } = req.body;

        // 1. Rozdělení času z "08:00 - 08:45" na startTime a endTime
        const [startTime, endTime] = time.split(' - ');

        // 2. Nalezení IDček pro propojení relací!
        const targetClass = await prisma.class.findFirst({ where: { name: className } });
        const targetSubject = await prisma.subject.findFirst({ where: { name: subject } });
        
        // Z frontend jména "Mr. Novak" dostaneme "Novak", abychom ho našli v DB
        const teacherLastName = teacher.split(' ').pop(); 
        const targetTeacher = await prisma.user.findFirst({ where: { lastName: teacherLastName } });

        if (!targetClass || !targetSubject || !targetTeacher) {
            return res.status(400).json({ success: false, message: "Class, Subject or Teacher not found in DB." });
        }

        // 3. Vytvoření v Prisma DB (s použitím cizích klíčů)
        const newTimetable = await prisma.timeTable.create({
            data: {
                day: day,
                week: weekType || "all",
                startTime: startTime,
                endTime: endTime,
                periodNumber: 1, // Zde by mohla být logika pro výpočet (1. hodina, 2. hodina...)
                room: room,
                group: group || "Whole Class",
                subjectId: targetSubject.id,
                teacherId: targetTeacher.id,
                classId: targetClass.id
            },
            // Rovnou si necháme vrátit propojená data, aby je React mohl zobrazit
            include: { subject: true, teacher: true, class: true }
        });

        res.json({ success: true, data: newTimetable });
    } catch (error) {
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
        const { day, time, subject, teacher, className, room, weekType,group } = req.body;
        const [startTime, endTime] = time.split(' - ');

        // Znovu musíme najít IDčka podle textů
        const targetClass = await prisma.class.findFirst({ where: { name: className } });
        const targetSubject = await prisma.subject.findFirst({ where: { name: subject } });
        const targetTeacher = await prisma.user.findFirst({ where: { lastName: teacher.split(' ').pop() } });

        const updatedTimetable = await prisma.timeTable.update({
            where: { id: Number(timetableId) },
            data: {
                day, week: weekType, startTime, endTime, room,
                group: group || "Whole Class",
                subjectId: targetSubject.id,
                teacherId: targetTeacher.id,
                classId: targetClass.id
            },
            include: { subject: true, teacher: true, class: true }
        });

        res.json({ success: true, data: updatedTimetable });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// 3. DELETE (Deleting lesson) - ADMIN ONLY
// ---------------------------------------------------------
router.delete("/api/timetables/edit/:userId/:timetableId", async (req, res, next) => {
    const { userId, timetableId } = req.params;
    
    const adminUser = await prisma.user.findFirst({ where: { username: userId } });
    if (!adminUser || adminUser.role !== 'admin') return res.status(403).json({ success: false });

    try {
        await prisma.timeTable.delete({
            where: { id: Number(timetableId) }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



router.get("/api/timetables/:userId", async (req, res, next) => {
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