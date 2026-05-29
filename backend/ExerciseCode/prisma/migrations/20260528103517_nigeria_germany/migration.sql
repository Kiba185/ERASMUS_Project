/*
  Warnings:

  - You are about to drop the column `userId` on the `GradeColumn` table. All the data in the column will be lost.
  - Added the required column `TeacherId` to the `GradeColumn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `GradeColumn` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GradeColumn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subjectId" INTEGER NOT NULL,
    "TeacherId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "date" DATETIME NOT NULL
);
INSERT INTO "new_GradeColumn" ("date", "id", "subjectId", "weight") SELECT "date", "id", "subjectId", "weight" FROM "GradeColumn";
DROP TABLE "GradeColumn";
ALTER TABLE "new_GradeColumn" RENAME TO "GradeColumn";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
