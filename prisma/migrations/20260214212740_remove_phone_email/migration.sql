/*
  Warnings:

  - You are about to drop the column `email` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Player` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "secondaryRole" TEXT,
    "battingStyle" TEXT,
    "bowlingStyle" TEXT,
    "battingPosition" TEXT,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "isViceCaptain" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT
);
INSERT INTO "new_Player" ("battingPosition", "battingStyle", "bowlingStyle", "id", "isCaptain", "isViceCaptain", "name", "notes", "role", "secondaryRole") SELECT "battingPosition", "battingStyle", "bowlingStyle", "id", "isCaptain", "isViceCaptain", "name", "notes", "role", "secondaryRole" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
