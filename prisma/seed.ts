import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: "file:./dev.db"
});

const prisma = new PrismaClient({ adapter });

async function main() {
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

    // Create Cary Avengers roster (skip if already exists)
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

    let createdCount = 0;
    for (const playerData of players) {
        const existing = await prisma.player.findFirst({
            where: { name: playerData.name }
        });

        if (!existing) {
            await prisma.player.create({
                data: playerData,
            });
            createdCount++;
        }
    }
    console.log(`Created ${createdCount} new players (${players.length - createdCount} already existed)`);

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

    console.log("Seeding completed for Mega Bash 2026!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
