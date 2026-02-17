import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const hasServiceAccount = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL;

  if (hasServiceAccount) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ca-team-manager',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    initializeApp({
      projectId: 'ca-team-manager',
    });
  }
}

const db = getFirestore();

async function addCompletedMatch() {
  try {
    console.log('Adding completed match...');

    // Get active season
    const seasonsSnap = await db
      .collection('seasons')
      .where('isActive', '==', true)
      .get();

    if (seasonsSnap.empty) {
      console.error('No active season found. Please create a season first.');
      return;
    }

    const activeSeason = seasonsSnap.docs[0];
    const seasonId = activeSeason.id;

    console.log(`Found active season: ${activeSeason.data().name}`);

    // Create a completed match
    const matchData = {
      date: new Date('2026-02-10T14:00:00'), // Recent past date
      opponent: 'Durham Daredevils',
      location: 'Cary Community Park',
      type: 'League',
      reportingTime: '1:30 PM',
      seasonId: seasonId,
      status: 'Completed',
      isLocked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const matchRef = await db.collection('matches').add(matchData);
    console.log(`✅ Created completed match with ID: ${matchRef.id}`);
    console.log(`   Opponent: ${matchData.opponent}`);
    console.log(`   Date: ${matchData.date.toDateString()}`);
    console.log(`   Status: ${matchData.status}`);
    console.log('\nYou can now test the scorecard UI with this match!');
    
    return matchRef.id;
  } catch (error) {
    console.error('Error adding completed match:', error);
    throw error;
  }
}

// Run the script
addCompletedMatch()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
