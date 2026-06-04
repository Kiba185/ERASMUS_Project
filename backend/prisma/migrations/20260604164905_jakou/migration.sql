/*
  Warnings:

  - You are about to drop the column `room` on the `TimeTable` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `TimeTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimeTable" DROP COLUMN "room",
ADD COLUMN     "roomId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupStudents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupStudents_B_index" ON "_GroupStudents"("B");

-- AddForeignKey
ALTER TABLE "TimeTable" ADD CONSTRAINT "TimeTable_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupStudents" ADD CONSTRAINT "_GroupStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupStudents" ADD CONSTRAINT "_GroupStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
