-- AlterTable
ALTER TABLE "Player" ADD COLUMN "defaultFieldingPosition" TEXT;

-- CreateTable
CREATE TABLE "FieldingSetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "bowlerId" TEXT,
    "batsmanType" TEXT NOT NULL DEFAULT 'RHB',
    "isPowerplay" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FieldingSetup_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FieldingPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setupId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "positionName" TEXT NOT NULL,
    "xCoordinate" REAL NOT NULL,
    "yCoordinate" REAL NOT NULL,
    CONSTRAINT "FieldingPosition_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "FieldingSetup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FieldingPosition_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FieldingSetup_matchId_bowlerId_batsmanType_isPowerplay_key" ON "FieldingSetup"("matchId", "bowlerId", "batsmanType", "isPowerplay");

-- CreateIndex
CREATE UNIQUE INDEX "FieldingPosition_setupId_playerId_key" ON "FieldingPosition"("setupId", "playerId");
