/*
  Warnings:

  - Added the required column `week` to the `TimeTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimeTable" ADD COLUMN     "group" TEXT NOT NULL DEFAULT 'Whole Class',
ADD COLUMN     "week" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AbsenceNote" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "attendanceId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbsenceNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbsenceNote_attendanceId_key" ON "AbsenceNote"("attendanceId");

-- AddForeignKey
ALTER TABLE "AbsenceNote" ADD CONSTRAINT "AbsenceNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceNote" ADD CONSTRAINT "AbsenceNote_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
