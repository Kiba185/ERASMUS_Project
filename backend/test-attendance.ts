import { prisma } from './src/prisma.js';

async function run() {
  try {
    const c = await prisma.class.findFirst();
    const s = await prisma.user.findFirst({ where: { role: 'student' } });
    const sub = await prisma.subject.findFirst();
    const record = await prisma.attendance.upsert({
      where: {
        date_studentId_subjectId_periodNumber: {
          date: new Date('2026-06-05T00:00:00.000Z'),
          studentId: s!.id,
          subjectId: sub!.id,
          periodNumber: 0
        }
      },
      update: { status: 'absent' },
      create: {
        date: new Date('2026-06-05T00:00:00.000Z'),
        studentId: s!.id,
        subjectId: sub!.id,
        classId: c!.id,
        periodNumber: 0,
        status: 'absent'
      }
    });
    console.log('Success:', record);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
