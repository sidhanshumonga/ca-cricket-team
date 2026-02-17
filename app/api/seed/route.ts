import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// This endpoint should be protected and only run once
export async function POST(request: Request) {
  try {
    // Check if seed has already been run by checking if players exist
    const existingPlayers = await prisma.player.count();

    if (existingPlayers > 0) {
      return NextResponse.json(
        { error: "Database already seeded. Players exist." },
        { status: 400 }
      );
    }

    console.log("Seeding database...");

    // Create Season - Mega Bash 2026
    const season = await prisma.season.create({
      data: {
        name: "Mega Bash 2026",
        startDate: new Date("2026-03-14"),
        endDate: new Date("2026-07-18"),
        isActive: true,
      },
    });
    console.log("Created season:", season.name);

    // Create Cary Avengers roster
    const players = [
      { name: "Akshay", role: "Batsman", secondaryRole: "Wicketkeeper", defaultFieldingPosition: "Wicketkeeper" },
      { name: "Akshesh", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Extra Cover" },
      { name: "Ankit", role: "Batsman", secondaryRole: "Bowler", isCaptain: true, defaultFieldingPosition: "Deep Square Leg" },
      { name: "Chirag", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Point" },
      { name: "Devang", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Mid Off" },
      { name: "Hardik", role: "All-rounder", defaultFieldingPosition: "Long On" },
      { name: "Jalpen", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Short Cover" },
      { name: "Kartik", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Mid Wicket" },
      { name: "Lajju", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Fine Leg" },
      { name: "Meet", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Third Man" },
      { name: "Niranjan", role: "Batsman", defaultFieldingPosition: "Slip" },
      { name: "Nitin", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Gully" },
      { name: "Parth", role: "Batsman", defaultFieldingPosition: "Cover Point" },
      { name: "Rajat", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Deep Mid Wicket" },
      { name: "Ronak B", role: "Batsman", defaultFieldingPosition: "Long Off" },
      { name: "Ronak", role: "All-rounder", defaultFieldingPosition: "Deep Square Leg" },
      { name: "Saahil", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Short Fine Leg" },
      { name: "Shivam", role: "Batsman", defaultFieldingPosition: "Deep Cover" },
      { name: "Sid", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Deep Mid Wicket" },
      { name: "Tarun", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Backward Point" },
      { name: "Vishal", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Short Third Man" },
    ];

    for (const playerData of players) {
      await prisma.player.create({
        data: playerData,
      });
    }
    console.log(`Created ${players.length} players`);

    // Create playoff matches (conditional)
    const playoffMatches = [
      {
        date: new Date("2026-06-27T10:00:00"),
        opponent: "TBD",
        location: "TBD",
        type: "Quarter Final",
        reportingTime: "9:00 AM",
      },
      {
        date: new Date("2026-07-11T10:00:00"),
        opponent: "TBD",
        location: "TBD",
        type: "Semi Final",
        reportingTime: "9:00 AM",
      },
      {
        date: new Date("2026-07-18T10:00:00"),
        opponent: "TBD",
        location: "TBD",
        type: "Final",
        reportingTime: "9:00 AM",
      },
    ];

    for (const matchData of playoffMatches) {
      await prisma.match.create({
        data: {
          ...matchData,
          seasonId: season.id,
          status: "Scheduled",
        },
      });
    }
    console.log("Created playoff matches");

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        season: season.name,
        playersCreated: players.length,
        matchesCreated: playoffMatches.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error },
      { status: 500 }
    );
  }
}
