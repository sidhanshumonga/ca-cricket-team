# Firebase Migration Guide

## Status: IN PROGRESS

We're migrating from Prisma (PostgreSQL/SQLite) to Firebase Firestore to solve database compatibility issues between local development and production.

## What's Been Done

✅ Removed Prisma dependencies
✅ Installed Firebase & Firebase Admin SDK
✅ Created Firebase configuration files
✅ Created TypeScript data models
✅ Created Firestore helper functions

## What You Need to Do

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "ca-cricket-team")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore

1. In your Firebase project, go to **Build → Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location (e.g., us-central)
5. Click "Enable"

### 3. Generate Service Account Key

1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click "Generate New Private Key"
3. Click "Generate Key" - a JSON file will download

### 4. Set Environment Variables

From the downloaded JSON file, extract these values and add to your `.env.local`:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account-email@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**Important:** For Vercel deployment, add these same variables in:
- Vercel Dashboard → Your Project → Settings → Environment Variables

### 5. Firestore Security Rules

In Firebase Console → Firestore Database → Rules, use these rules for now:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TEMPORARY - secure this later!
    }
  }
}
```

## What Needs to Be Done

The following files need to be migrated from Prisma to Firebase:

### Action Files (Server-side)
- [ ] `/app/actions/player.ts` - Player CRUD operations
- [ ] `/app/actions/season.ts` - Season operations
- [ ] `/app/actions/match.ts` - Match operations
- [ ] `/app/actions/availability.ts` - Availability tracking
- [ ] `/app/actions/team.ts` - Team selection
- [ ] `/app/actions/fielding.ts` - Fielding positions

### Page Files (Data fetching)
- [ ] `/app/admin/page.tsx` - Dashboard
- [ ] `/app/admin/matches/page.tsx` - Matches list
- [ ] `/app/admin/teams/page.tsx` - Teams view
- [ ] `/app/admin/settings/page.tsx` - Settings
- [ ] `/app/page.tsx` - Landing page
- [ ] `/app/player/[playerId]/page.tsx` - Player dashboard

### API Routes
- [ ] `/app/api/seed/route.ts` - Database seeding
- [ ] `/app/api/import-data/route.ts` - Data import

## Migration Pattern

### Before (Prisma):
```typescript
const players = await prisma.player.findMany();
```

### After (Firebase):
```typescript
import { firestore, COLLECTIONS } from '@/lib/db';

const snapshot = await firestore.collection(COLLECTIONS.PLAYERS).get();
const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

Or using helpers:
```typescript
import { getAllDocs } from '@/lib/firestore-helpers';
import { COLLECTIONS } from '@/lib/db';

const players = await getAllDocs(COLLECTIONS.PLAYERS);
```

## Next Steps

1. **You:** Set up Firebase project and get credentials
2. **Me:** Complete migration of all action files and pages
3. **Test:** Local development with Firebase
4. **Deploy:** Push to Vercel with Firebase credentials

## Files Created

- `/lib/firebase.ts` - Firebase initialization
- `/lib/types/models.ts` - TypeScript interfaces for all data models
- `/lib/firestore-helpers.ts` - Helper functions for common Firestore operations
- `/lib/db.ts` - Updated to export Firestore instead of Prisma

## Benefits of Firebase

✅ Works identically in local and production
✅ No build-time database connection needed
✅ Real-time capabilities (if needed later)
✅ Automatic scaling
✅ No migration scripts needed
✅ Simple authentication integration (if needed)
