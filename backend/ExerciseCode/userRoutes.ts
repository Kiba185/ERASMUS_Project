import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import session from 'express-session';


const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const router = express.Router();
const PORT = 3000;

///GETTING GRADES, ONLY LOGGED IN USERS CAN SEE THEIR GRADES, CHECKING IF USER IS LOGGED IN OR NOT
router.get('/grades', async (req, res) =>
    {
    const currentUserId = req.session.userId;
    if(!currentUserId) {
        return res.status(404).json({ error: 'User not authenticated' });
    }
    const userGrades = await prisma.grade.findMany({
        select:{grade: true

        },
            where: {
                userId: currentUserId
            }
    })
    res.json(userGrades);

    })


    ///POSTING GRADES, ONLY TEACHERS CAN POST GRADES, CHECKING IF USER IS TEACHER OR NOT
router.post('/grades', async (req, res) =>{
    const currentUserId = req.session.userId;
    if(!currentUserId) {
        return res.status(404).json({ error: 'User not authenticated' });
    }
    const currentUserRole = await prisma.user.findUnique({
        select:{role: true},
        where:{id: currentUserId}
    })
    if(!currentUserRole) {
        return res.status(404).json({ error: 'User not found' });
    }
    else if(currentUserRole.role !== 'teacher') {
        return res.status(403).json({ error: 'User not authorized to add grades' });
    }
    else{
        const newGrade = await prisma.grade.create({
            data: { userId: req.body, subjectId: req.body, grade: req.body, weight: req.body, date: req.body }
        });
    }

})