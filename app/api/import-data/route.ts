import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Force dynamic rendering - don't try to build this at compile time
export const dynamic = 'force-dynamic';

// This endpoint imports data from the exported JSON
// Should be protected and only run once to initialize production
export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Starting data import...");

    // Check if data already exists
    const existingPlayers = await prisma.player.count();
    if (existingPlayers > 0) {
      return NextResponse.json(
        { error: "Database already has data. Clear it first or use a different approach." },
        { status: 400 }
      );
    }

    // Import in correct order (respecting foreign keys)

    // 1. Seasons (no dependencies)
    console.log("Importing seasons...");
    for (const season of data.seasons) {
      await prisma.season.create({ data: season });
    }

    // 2. Players (no dependencies)
    console.log("Importing players...");
    for (const player of data.players) {
      await prisma.player.create({ data: player });
    }

    // 3. Matches (depends on seasons)
    console.log("Importing matches...");
    for (const match of data.matches) {
      await prisma.match.create({ data: match });
    }

    // 4. Availability (depends on players and matches)
    console.log("Importing availability...");
    for (const avail of data.availability) {
      await prisma.availability.create({ data: avail });
    }

    // 5. Team Selections (depends on players and matches)
    console.log("Importing team selections...");
    for (const selection of data.teamSelections) {
      await prisma.teamSelection.create({ data: selection });
    }

    // 6. Season Availability (depends on players and seasons)
    console.log("Importing season availability...");
    for (const seasonAvail of data.seasonAvailability) {
      await prisma.seasonAvailability.create({ data: seasonAvail });
    }

    // 7. Fielding Setups (depends on matches)
    console.log("Importing fielding setups...");
    for (const setup of data.fieldingSetups) {
      await prisma.fieldingSetup.create({ data: setup });
    }

    // 8. Fielding Positions (depends on setups and players)
    console.log("Importing fielding positions...");
    for (const position of data.fieldingPositions) {
      await prisma.fieldingPosition.create({ data: position });
    }

    return NextResponse.json({
      success: true,
      message: "Data imported successfully!",
      stats: {
        players: data.players.length,
        seasons: data.seasons.length,
        matches: data.matches.length,
        availability: data.availability.length,
        teamSelections: data.teamSelections.length,
        seasonAvailability: data.seasonAvailability.length,
        fieldingSetups: data.fieldingSetups.length,
        fieldingPositions: data.fieldingPositions.length,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import data", details: error },
      { status: 500 }
    );
  }
}
