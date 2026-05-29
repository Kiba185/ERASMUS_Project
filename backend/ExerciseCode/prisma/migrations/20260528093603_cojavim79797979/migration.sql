/*
  Warnings:

  - You are about to drop the column `date` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Grade` table. All the data in the column will be lost.
  - Added the required column `gColumnId` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GradeColumn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subjectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "date" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Grade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gColumnId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "grade" INTEGER NOT NULL
);
INSERT INTO "new_Grade" ("grade", "id", "userId") SELECT "grade", "id", "userId" FROM "Grade";
DROP TABLE "Grade";
ALTER TABLE "new_Grade" RENAME TO "Grade";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
