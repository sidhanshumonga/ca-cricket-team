// Firestore data models

export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  name: string;
  role: string; // Batsman, Bowler, All-rounder, Wicketkeeper
  secondaryRole?: string | null;
  battingStyle?: string | null;
  bowlingStyle?: string | null;
  battingPosition?: string | null;
  defaultFieldingPosition?: string | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  notes?: string | null;
  jerseyNumber?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  date: Date;
  opponent: string;
  location: string;
  type: string; // League, Friendly, Quarter Final, etc.
  reportingTime?: string | null;
  seasonId: string;
  status: string; // Scheduled, Completed, Cancelled
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  playerId: string;
  matchId: string;
  status: string; // AVAILABLE, UNAVAILABLE, BACKUP
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSelection {
  id: string;
  matchId: string;
  playerId: string;
  role?: string | null; // Captain, VC, WK, etc for this match
  battingOrder?: number | null;
  bowlingOrder?: number | null;
  isSubstitute: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonAvailability {
  id: string;
  playerId: string;
  seasonId: string;
  status: string; // AVAILABLE, UNAVAILABLE, PARTIAL
  unavailableDates?: string | null; // JSON array of date ranges
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldingSetup {
  id: string;
  matchId: string;
  bowlerId?: string | null;
  batsmanType: string; // RHB, LHB
  isPowerplay: boolean;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldingPosition {
  id: string;
  setupId: string;
  playerId: string;
  positionName: string;
  xCoordinate: number;
  yCoordinate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scorecard {
  id: string;
  matchId: string;
  teamBattingFirst: string; // "us" or "opponent"
  ourScore?: number | null;
  ourWickets?: number | null;
  ourOvers?: number | null;
  opponentScore?: number | null;
  opponentWickets?: number | null;
  opponentOvers?: number | null;
  result?: string | null; // "Won", "Lost", "Tied", "No Result"
  resultMargin?: string | null; // "by 5 wickets", "by 20 runs"
  createdAt: Date;
  updatedAt: Date;
}

export interface BattingPerformance {
  id: string;
  scorecardId: string;
  playerId: string;
  runs: number;
  ballsFaced?: number | null;
  fours?: number | null;
  sixes?: number | null;
  strikeRate?: number | null;
  howOut?: string | null; // "bowled", "caught", "lbw", "run out", "not out"
  bowlerName?: string | null; // bowler who got the wicket
  fielderName?: string | null; // fielder who caught/ran out
  battingPosition: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BowlingPerformance {
  id: string;
  scorecardId: string;
  playerId: string;
  overs: number;
  maidens?: number | null;
  runs: number;
  wickets: number;
  economy?: number | null;
  wides?: number | null;
  noBalls?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
