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

    // Clear existing players
    await prisma.player.deleteMany({});
    console.log("Cleared existing players");

    // Create Cary Avengers roster
    const players = [
        { name: "Akshay", role: "Batsman", secondaryRole: "Wicketkeeper" },
        { name: "Akshesh", role: "Bowler", secondaryRole: "Batsman" },
        { name: "Ankit", role: "Batsman", secondaryRole: "Bowler", isCaptain: true },
        { name: "Chirag", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Devang", role: "Bowler", secondaryRole: "Batsman" },
        { name: "Hardik", role: "All-rounder" },
        { name: "Jalpen", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Kartik", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Lajju", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Meet", role: "Bowler", secondaryRole: "Batsman" },
        { name: "Niranjan", role: "Batsman" },
        { name: "Nitin", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Parth", role: "Batsman" },
        { name: "Rajat", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Ronak old", role: "Batsman" },
        { name: "Ronak new", role: "All-rounder" },
        { name: "Saahil", role: "Bowler", secondaryRole: "Batsman" },
        { name: "Shivam", role: "Batsman" },
        { name: "Sid", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Tarun", role: "Batsman", secondaryRole: "Bowler" },
        { name: "Vishal", role: "Batsman", secondaryRole: "Bowler" },
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
