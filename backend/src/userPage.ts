import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from "./prisma.js";
import { requireAuth } from './auth.js';

const router = express.Router();

// CHANGE OWN PASSWORD - any logged-in user
router.put('/api/profile/password', async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ success: true, message: 'Password changed' });
});

// UPDATE OWN PROFILE - admin only
router.put('/api/profile/me', async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const { firstName, lastName, email, phone, adress, birthday } = req.body;

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(firstName && { firstName }),
            ...(lastName  && { lastName }),
            ...(email     && { email }),
            ...(phone     && { phone }),
            ...(adress    && { adress }),
            ...(birthday  && { birthday: new Date(birthday) }),
        }
    });

    const { password: _, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
});

export default router;