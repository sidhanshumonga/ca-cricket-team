// Fielding position types and constants
// These are the EXACT position names used in fielding.ts mappings
// Used for generating fielding charts for different scenarios

export const FIELDING_POSITIONS = [
  "Wicketkeeper",
  "Bowler",
  "Point",
  "Short Cover",
  "Deep Cover",
  "Mid-off",
  "Mid-wicket",
  "Deep Mid-wicket",
  "Short Leg",
  "Deep Square Leg",
  "Short Third Man",
  "Third Man",
  "Silly Mid-off",
  "Long-on",
  "Short Mid-on",
  "Short Mid-wicket",
] as const;

export type FieldingPosition = typeof FIELDING_POSITIONS[number];

// Helper to check if a string is a valid fielding position
export function isValidFieldingPosition(position: string): position is FieldingPosition {
  return FIELDING_POSITIONS.includes(position as FieldingPosition);
}
