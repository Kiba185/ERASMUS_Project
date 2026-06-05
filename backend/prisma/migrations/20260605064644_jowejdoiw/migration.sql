/*
  Warnings:

  - A unique constraint covering the columns `[date,studentId,subjectId,periodNumber]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classTeacherId]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[date,classId,subjectId,periodNumber]` on the table `LessonTopic` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Attendance_date_studentId_subjectId_key";

-- DropIndex
DROP INDEX "LessonTopic_date_classId_subjectId_key";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "absenceType" TEXT,
ADD COLUMN     "periodNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "classTeacherId" INTEGER;

-- AlterTable
ALTER TABLE "LessonTopic" ADD COLUMN     "periodNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "subject" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "TimeTable" ADD COLUMN     "exceptionDate" TEXT,
ADD COLUMN     "isPermanent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "templateId" INTEGER;

-- CreateTable
CREATE TABLE "Period" (
    "id" SERIAL NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Period_periodNumber_key" ON "Period"("periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_date_studentId_subjectId_periodNumber_key" ON "Attendance"("date", "studentId", "subjectId", "periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Class_classTeacherId_key" ON "Class"("classTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonTopic_date_classId_subjectId_periodNumber_key" ON "LessonTopic"("date", "classId", "subjectId", "periodNumber");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
