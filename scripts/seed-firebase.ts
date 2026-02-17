import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID || 'ca-team-manager',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
  }),
});

const db = getFirestore();

async function main() {
  console.log("🌱 Seeding Firebase Firestore...\n");

  // Create Season - Mega Bash 2026
  console.log("Creating season: Mega Bash 2026...");
  const seasonRef = await db.collection('seasons').add({
    name: "Mega Bash 2026",
    startDate: new Date("2026-03-14"),
    endDate: new Date("2026-07-18"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`✅ Created season: ${seasonRef.id}\n`);

  // Create Cary Avengers roster
  console.log("Creating Cary Avengers roster...");
  const players = [
    { name: "Akshay", role: "Batsman", secondaryRole: "Wicketkeeper", defaultFieldingPosition: "Wicketkeeper" },
    { name: "Akshesh", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Extra Cover" },
    { name: "Ankit", role: "Batsman", secondaryRole: "Bowler", isCaptain: true, defaultFieldingPosition: "Deep Square Leg" },
    { name: "Chirag", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Point" },
    { name: "Devang", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Mid Off" },
    { name: "Hardik", role: "All-rounder", secondaryRole: null, defaultFieldingPosition: "Long On" },
    { name: "Jalpen", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Short Cover" },
    { name: "Kartik", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Mid Wicket" },
    { name: "Lajju", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Fine Leg" },
    { name: "Meet", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Third Man" },
    { name: "Niranjan", role: "Batsman", secondaryRole: null, defaultFieldingPosition: "Slip" },
    { name: "Nitin", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Gully" },
    { name: "Parth", role: "Batsman", secondaryRole: null, defaultFieldingPosition: "Cover Point" },
    { name: "Rajat", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Deep Mid Wicket" },
    { name: "Ronak B", role: "Batsman", secondaryRole: null, defaultFieldingPosition: "Long Off" },
    { name: "Ronak", role: "All-rounder", secondaryRole: null, defaultFieldingPosition: "Deep Square Leg" },
    { name: "Saahil", role: "Bowler", secondaryRole: "Batsman", defaultFieldingPosition: "Short Fine Leg" },
    { name: "Shivam", role: "Batsman", secondaryRole: null, defaultFieldingPosition: "Deep Cover" },
    { name: "Sid", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Deep Mid Wicket" },
    { name: "Tarun", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Backward Point" },
    { name: "Vishal", role: "Batsman", secondaryRole: "Bowler", defaultFieldingPosition: "Short Third Man" },
  ];

  let createdCount = 0;
  for (const playerData of players) {
    await db.collection('players').add({
      name: playerData.name,
      role: playerData.role,
      secondaryRole: playerData.secondaryRole || null,
      defaultFieldingPosition: playerData.defaultFieldingPosition,
      battingStyle: null,
      bowlingStyle: null,
      battingPosition: null,
      isCaptain: (playerData as any).isCaptain || false,
      isViceCaptain: false,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCount++;
  }
  console.log(`✅ Created ${createdCount} players\n`);

  // Create playoff matches
  console.log("Creating playoff matches...");
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
    await db.collection('matches').add({
      date: matchData.date,
      opponent: matchData.opponent,
      location: matchData.location,
      type: matchData.type,
      reportingTime: matchData.reportingTime,
      seasonId: seasonRef.id,
      status: "Scheduled",
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("✅ Created playoff matches\n");

  console.log("🎉 Seeding completed for Mega Bash 2026!");
  console.log("\nYou can now:");
  console.log("1. Run: npm run dev");
  console.log("2. Visit: http://localhost:3000/admin");
  console.log("3. View your season, players, and matches\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  });
