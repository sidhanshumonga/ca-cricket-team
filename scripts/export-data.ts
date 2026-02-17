import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as fs from "fs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});

const prisma = new PrismaClient({ adapter });

async function exportData() {
  console.log("Exporting data from local database...");

  // Export all data
  const players = await prisma.player.findMany();
  const seasons = await prisma.season.findMany();
  const matches = await prisma.match.findMany();
  const availability = await prisma.availability.findMany();
  const teamSelections = await prisma.teamSelection.findMany();
  const seasonAvailability = await prisma.seasonAvailability.findMany();
  const fieldingSetups = await prisma.fieldingSetup.findMany();
  const fieldingPositions = await prisma.fieldingPosition.findMany();

  const data = {
    players,
    seasons,
    matches,
    availability,
    teamSelections,
    seasonAvailability,
    fieldingSetups,
    fieldingPositions,
    exportedAt: new Date().toISOString(),
  };

  // Write to JSON file
  fs.writeFileSync(
    "data-export.json",
    JSON.stringify(data, null, 2)
  );

  console.log("✅ Data exported successfully to data-export.json");
  console.log(`- ${players.length} players`);
  console.log(`- ${seasons.length} seasons`);
  console.log(`- ${matches.length} matches`);
  console.log(`- ${availability.length} availability records`);
  console.log(`- ${teamSelections.length} team selections`);
  console.log(`- ${seasonAvailability.length} season availability records`);
  console.log(`- ${fieldingSetups.length} fielding setups`);
  console.log(`- ${fieldingPositions.length} fielding positions`);

  await prisma.$disconnect();
}

exportData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
