import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import session from 'express-session';


const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;

///GETTING GRADES, ONLY LOGGED IN USERS CAN SEE THEIR GRADES, CHECKING IF USER IS LOGGED IN OR NOT
app.get('/grades', async (req, res) =>
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
app.post('api/grades', async (req, res) =>{
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
            data: { userId: req.body, subjectId: req.body, grade: req.body(1,1.5,2,2.5,3,3.5,4,4.5,5), weight: req.body, date: req.body }
        });
    }
app.get('api/subjects', async (req, res) => {
      const subjects = await prisma.subject.findMany();
      if(subjects.length === 0) { return res.status(404).json({ error: 'No subjects found' });}
      res.json(subjects);
});

app.post("api/addsubject", async (req, res) => {
    });
})