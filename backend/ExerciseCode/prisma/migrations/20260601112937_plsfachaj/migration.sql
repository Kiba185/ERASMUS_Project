-- CreateTable
CREATE TABLE "Todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "urgency" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "birthday" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "parentId" INTEGER,
    CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "classroom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GradeColumn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subjectId" INTEGER NOT NULL,
    "TeacherId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gColumnId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "grade" DECIMAL NOT NULL
);

-- CreateTable
CREATE TABLE "Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TimeTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "room" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "TimeTable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimeTable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimeTable_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "allDay" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ClassToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ClassToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ClassToEvent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ClassToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ClassToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EventToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClassToUser_AB_unique" ON "_ClassToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassToUser_B_index" ON "_ClassToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassToEvent_AB_unique" ON "_ClassToEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassToEvent_B_index" ON "_ClassToEvent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToUser_AB_unique" ON "_EventToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToUser_B_index" ON "_EventToUser"("B");
