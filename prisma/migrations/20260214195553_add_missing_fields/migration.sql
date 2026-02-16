/*
  Warnings:

  - You are about to drop the column `order` on the `TeamSelection` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SeasonAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "unavailableDates" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeasonAvailability_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeasonAvailability_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "opponent" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reportingTime" TEXT,
    "seasonId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("date", "id", "location", "opponent", "seasonId", "status", "type") SELECT "date", "id", "location", "opponent", "seasonId", "status", "type" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "secondaryRole" TEXT,
    "battingStyle" TEXT,
    "bowlingStyle" TEXT,
    "battingPosition" TEXT,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "isViceCaptain" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT
);
INSERT INTO "new_Player" ("battingStyle", "bowlingStyle", "email", "id", "name", "notes", "phone", "role", "secondaryRole") SELECT "battingStyle", "bowlingStyle", "email", "id", "name", "notes", "phone", "role", "secondaryRole" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_phone_key" ON "Player"("phone");
CREATE TABLE "new_TeamSelection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "role" TEXT,
    "battingOrder" INTEGER,
    "bowlingOrder" INTEGER,
    "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TeamSelection_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamSelection_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TeamSelection" ("id", "matchId", "playerId", "role") SELECT "id", "matchId", "playerId", "role" FROM "TeamSelection";
DROP TABLE "TeamSelection";
ALTER TABLE "new_TeamSelection" RENAME TO "TeamSelection";
CREATE UNIQUE INDEX "TeamSelection_matchId_playerId_key" ON "TeamSelection"("matchId", "playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SeasonAvailability_playerId_seasonId_key" ON "SeasonAvailability"("playerId", "seasonId");
