import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const classes = await prisma.class.findMany();
  const teachers = await prisma.user.findMany({ where: { role: 'teacher' } });
  
  for (let i = 0; i < classes.length; i++) {
    await prisma.class.update({
      where: { id: classes[i].id },
      data: { classTeacherId: teachers[i % teachers.length].id }
    });
  }
  console.log('Fixed classTeacherId');
}

run().catch(console.error).finally(() => prisma.$disconnect());
