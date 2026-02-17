import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin for server-side operations
if (!getApps().length) {
  // For local development without service account, use project ID only
  // For production, use full service account credentials
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
    // Local development - uses Application Default Credentials or emulator
    initializeApp({
      projectId: 'ca-team-manager',
    });
  }
}

export const db = getFirestore();

// Collection names
export const COLLECTIONS = {
  SEASONS: 'seasons',
  PLAYERS: 'players',
  MATCHES: 'matches',
  AVAILABILITY: 'availability',
  TEAM_SELECTIONS: 'teamSelections',
  SEASON_AVAILABILITY: 'seasonAvailability',
  FIELDING_SETUPS: 'fieldingSetups',
  FIELDING_POSITIONS: 'fieldingPositions',
} as const;
