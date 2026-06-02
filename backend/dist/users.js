import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from "./prisma.js";
import { requireAuth } from './auth.js';
import 'dotenv/config';
const router = express.Router();
// GET ALL USERS WITH CLASSES - ADMIN ONLY
router.get('/api/admin/users', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) {
        return;
    }
    const users = await prisma.user.findMany({
        include: { classes: true }
    });
    const saveUsers = users.map(({ password, ...u }) => ({
        ...u,
        classes: u.classes.map(c => ({ id: c.id, name: c.name }))
    }));
    res.json(saveUsers);
});
// UPDATE USER - ADMIN ONLY (Edit → Save)
router.put('/api/admin/users/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) {
        return;
    }
    const userId = parseInt(req.params.id);
    const { firstName, lastName, email, phone, adress, role, birthday, username } = req.body;
    if (username) {
        const existing = await prisma.user.findFirst({
            where: { username, NOT: { id: userId } }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username already taken' });
        }
    }
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(adress && { adress }),
            ...(role && { role }),
            ...(birthday && { birthday: new Date(birthday) }),
            ...(username && { username }),
        }
    });
    const { password: _, ...saveUser } = updatedUser;
    res.json({ success: true, user: saveUser });
});
// CREATE USER - ADMIN ONLY (Add New User)
router.post('/api/admin/users', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) {
        return;
    }
    const { firstName, lastName, birthday, username, password, email, phone, adress, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    if (await prisma.user.findFirst({ where: { username } })) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            firstName, lastName,
            birthday: new Date(birthday), // ← přidej new Date()
            username, email, phone, adress,
            role: role ?? 'student',
            password: hashedPassword
        }
    });
    const { password: _, ...saveUser } = newUser;
    res.status(201).json({ success: true, user: saveUser });
});
// DELETE USER - ADMIN ONLY
router.delete('/api/admin/users/:id', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) {
        return;
    }
    try {
        const userId = parseInt(req.params.id);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Smaž všechny navázané záznamy v správném pořadí
        await prisma.grade.deleteMany({ where: { userId } });
        await prisma.timeTable.deleteMany({ where: { teacherId: userId } });
        await prisma.user.update({
            where: { id: userId },
            data: { classes: { set: [] } }
        });
        // Pak smaž uživatele
        await prisma.user.delete({ where: { id: userId } });
        res.json({ success: true, message: 'User deleted' });
    }
    catch (error) {
        console.error('DELETE USER ERROR:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
// CHANGE PASSWORD - ADMIN ONLY
router.put('/api/admin/users/:id/password', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) {
        return;
    }
    const userId = parseInt(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed }
    });
    res.json({ success: true, message: 'Password updated' });
});
// UPDATE USER CLASS - ADMIN ONLY
router.put('/api/admin/users/:id/classes', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) {
        return;
    }
    const userId = parseInt(req.params.id);
    const { classId } = req.body;
    console.log('CLASSES UPDATE - userId:', userId, 'classId:', classId);
    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            classes: classId
                ? { set: [{ id: Number(classId) }] }
                : { set: [] }
        },
        include: { classes: true }
    });
    console.log('CLASSES AFTER UPDATE:', result.classes);
    res.json({ success: true, message: 'Class updated' });
});
// REMOVE USER FROM CLASS - ADMIN ONLY
router.delete('/api/admin/users/:id/classes/:classId', async (req, res, next) => {
    if (await requireAuth(req, res, next, 10) !== true) {
        return;
    }
    const userId = parseInt(req.params.id);
    const classId = parseInt(req.params.classId);
    await prisma.user.update({
        where: { id: userId },
        data: {
            classes: { disconnect: { id: classId } }
        }
    });
    res.json({ success: true, message: 'User removed from class' });
});
export default router;
