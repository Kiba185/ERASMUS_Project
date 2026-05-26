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


router.get('/grades', async (req, res) =>
    {   
    const currentUserId = req.session.userId;
    const userGrades = await prisma.grade.findMany({
        select:{grade: true
            
        },
            where: {
                userId: currentUserId
                
            }
        

    

    })