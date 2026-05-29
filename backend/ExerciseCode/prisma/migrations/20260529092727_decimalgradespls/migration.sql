/*
  Warnings:

  - You are about to alter the column `grade` on the `Grade` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Grade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gColumnId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "grade" DECIMAL NOT NULL
);
INSERT INTO "new_Grade" ("gColumnId", "grade", "id", "userId") SELECT "gColumnId", "grade", "id", "userId" FROM "Grade";
DROP TABLE "Grade";
ALTER TABLE "new_Grade" RENAME TO "Grade";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
