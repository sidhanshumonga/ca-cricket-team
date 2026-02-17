"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Fielding position presets - manually created by user for accurate positioning
// 4 combinations: Powerplay/Normal × RHB/LHB

const POWERPLAY_RHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Short Mid-on": { x: 66.3, y: 54.9 },        // was Point
  "Long-on": { x: 68.7, y: 89.5 },             // was Mid-off
  "Deep Square Leg": { x: 93.5, y: 45.3 },     // was Cover
  "Mid-off": { x: 36.3, y: 66.6 },             // was Mid-wicket
  "Short Leg": { x: 65.5, y: 34.9 },           // was Mid-on
  "Wicketkeeper": { x: 50, y: 32 },
  "Short Cover": { x: 37.8, y: 49.8 },         // was Square Leg
  "Point": { x: 32.4, y: 37.9 },               // was Short Leg
  "Short Third Man": { x: 42.7, y: 27.9 },     // was Silly Point
  "Deep Cover": { x: 7.3, y: 47.9 },           // was Fine Leg
  "Silly Mid-off": { x: 65, y: 32.3 },
};

const NORMAL_RHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Deep Mid-wicket": { x: 88.3, y: 67.8 },     // was Point
  "Long-on": { x: 70.3, y: 86.5 },             // was Mid-off
  "Deep Square Leg": { x: 92.1, y: 42.2 },     // was Cover
  "Mid-off": { x: 35.3, y: 70.9 },             // was Mid-wicket
  "Short Leg": { x: 65.5, y: 34.9 },           // was Mid-on
  "Wicketkeeper": { x: 50, y: 32 },
  "Short Cover": { x: 37.8, y: 49.8 },         // was Square Leg
  "Point": { x: 32.4, y: 37.9 },               // was Short Leg
  "Third Man": { x: 43.2, y: 10.8 },           // was Silly Point
  "Deep Cover": { x: 7.7, y: 50.8 },           // was Fine Leg
  "Silly Mid-off": { x: 65, y: 32.3 },
};

const POWERPLAY_LHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Short Cover": { x: 64.5, y: 50.9 },         // was Point
  "Mid-off": { x: 64.6, y: 69.9 },
  "Deep Cover": { x: 90, y: 47.5 },            // was Cover
  "Mid-wicket": { x: 19, y: 80.1 },
  "Point": { x: 70.5, y: 38.9 },               // was Mid-on
  "Wicketkeeper": { x: 50, y: 32 },
  "Short Mid-wicket": { x: 33.5, y: 55.7 },    // was Square Leg
  "Short Leg": { x: 34.6, y: 33.5 },
  "Short Third Man": { x: 58.8, y: 28.5 },     // was Silly Point
  "Deep Square Leg": { x: 7, y: 45.3 },        // was Fine Leg
  "Silly Mid-off": { x: 69.4, y: 36.9 },
};

const NORMAL_LHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Short Cover": { x: 69.7, y: 54.7 },         // was Point
  "Mid-off": { x: 64.6, y: 69.9 },
  "Deep Cover": { x: 90, y: 47.5 },            // was Cover
  "Long-on": { x: 32.8, y: 86.7 },             // was Mid-wicket
  "Point": { x: 70.5, y: 38.9 },               // was Mid-on
  "Wicketkeeper": { x: 50, y: 32 },
  "Mid-wicket": { x: 9.2, y: 64.9 },           // was Square Leg
  "Short Leg": { x: 37.8, y: 31.4 },
  "Third Man": { x: 59, y: 10.2 },             // was Silly Point
  "Deep Square Leg": { x: 9.4, y: 34.3 },      // was Fine Leg
  "Silly Mid-off": { x: 68.6, y: 37.2 },
};

// Helper function to get positions based on powerplay and batsman type
function getFieldingPositions(isPowerplay: boolean, batsmanType: string) {
  if (isPowerplay && batsmanType === "RHB") return POWERPLAY_RHB_POSITIONS;
  if (isPowerplay && batsmanType === "LHB") return POWERPLAY_LHB_POSITIONS;
  if (!isPowerplay && batsmanType === "RHB") return NORMAL_RHB_POSITIONS;
  return NORMAL_LHB_POSITIONS;
}

export async function getFieldingSetup(
  matchId: string,
  bowlerId: string | null,
  batsmanType: string,
  isPowerplay: boolean
) {
  try {
    const setup = await prisma.fieldingSetup.findFirst({
      where: {
        matchId,
        bowlerId,
        batsmanType,
        isPowerplay,
      },
      include: {
        positions: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                role: true,
                defaultFieldingPosition: true,
              },
            },
          },
        },
      },
    });

    return { success: true, setup };
  } catch (error) {
    console.error("Failed to get fielding setup:", error);
    return { success: false, error: "Failed to get fielding setup" };
  }
}

export async function generateFieldingSetup(
  matchId: string,
  bowlerId: string | null,
  batsmanType: string,
  isPowerplay: boolean,
  name?: string
) {
  try {
    // Get the team for this match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        team: {
          where: { isSubstitute: false },
          include: {
            player: {
              select: {
                id: true,
                name: true,
                role: true,
                secondaryRole: true,
                defaultFieldingPosition: true,
              },
            },
          },
          orderBy: { battingOrder: "asc" },
        },
      },
    });

    if (!match || match.team.length === 0) {
      return { success: false, error: "No team selected for this match" };
    }

    // Delete existing setup if any
    await prisma.fieldingSetup.deleteMany({
      where: {
        matchId,
        bowlerId: bowlerId || null,
        batsmanType,
        isPowerplay,
      },
    });

    // Create new setup
    const setup = await prisma.fieldingSetup.create({
      data: {
        matchId,
        bowlerId,
        batsmanType,
        isPowerplay,
        name,
      },
    });

    // Assign positions to players
    const usedPositions = new Set<string>();
    const positions: Array<{
      setupId: string;
      playerId: string;
      positionName: string;
      xCoordinate: number;
      yCoordinate: number;
    }> = [];

    // Get appropriate positions based on powerplay and batsman type
    const fieldingPositions = getFieldingPositions(isPowerplay, batsmanType);

    // Step 1: Assign wicketkeeper role to wicketkeeper position
    const wicketkeeper = match.team.find(
      (s: any) => s.player.role === "Wicketkeeper" || s.player.secondaryRole === "Wicketkeeper"
    );
    if (wicketkeeper && fieldingPositions["Wicketkeeper"]) {
      const coords = fieldingPositions["Wicketkeeper"];
      positions.push({
        setupId: setup.id,
        playerId: wicketkeeper.player.id,
        positionName: "Wicketkeeper",
        xCoordinate: coords.x,
        yCoordinate: coords.y,
      });
      usedPositions.add("Wicketkeeper");
    }

    // Step 2: Assign selected bowler to bowler position
    if (bowlerId && fieldingPositions["Bowler"]) {
      const bowlerSelection = match.team.find((s: any) => s.player.id === bowlerId);
      if (bowlerSelection) {
        const coords = fieldingPositions["Bowler"];
        positions.push({
          setupId: setup.id,
          playerId: bowlerSelection.player.id,
          positionName: "Bowler",
          xCoordinate: coords.x,
          yCoordinate: coords.y,
        });
        usedPositions.add("Bowler");
      }
    }

    // Step 3: Assign remaining players by their fielding preferences
    for (const selection of match.team) {
      const player = selection.player;

      // Skip if already assigned
      if (positions.find(p => p.playerId === player.id)) {
        continue;
      }

      let positionName: string;
      let coords = { x: 50, y: 50 }; // Default center

      // Try to use player's preferred position if available
      if (player.defaultFieldingPosition &&
        fieldingPositions[player.defaultFieldingPosition] &&
        !usedPositions.has(player.defaultFieldingPosition)) {
        positionName = player.defaultFieldingPosition;
        coords = fieldingPositions[positionName];
      } else {
        // Assign based on role to available positions
        positionName = assignPositionByRole(player.role, usedPositions, isPowerplay, batsmanType);
        coords = fieldingPositions[positionName] || coords;
      }

      usedPositions.add(positionName);
      positions.push({
        setupId: setup.id,
        playerId: player.id,
        positionName,
        xCoordinate: coords.x,
        yCoordinate: coords.y,
      });
    }

    // Create all positions
    await prisma.fieldingPosition.createMany({
      data: positions,
    });

    revalidatePath(`/admin/matches/${matchId}`);

    return { success: true, setupId: setup.id };
  } catch (error) {
    console.error("Failed to generate fielding setup:", error);
    return { success: false, error: "Failed to generate fielding setup" };
  }
}

function findAlternativePosition(
  originalPosition: string,
  usedPositions: Set<string>,
  role: string,
  isPowerplay: boolean,
  batsmanType: string
): string {
  // Map of positions to their alternatives
  const alternatives: Record<string, string[]> = {
    "Point": ["Cover Point", "Backward Point"],
    "Cover": ["Cover Point", "Mid-off"],
    "Mid-off": ["Cover", "Mid-on"],
    "Mid-on": ["Mid-wicket", "Mid-off"],
    "Square Leg": ["Backward Square Leg", "Mid-wicket"],
    "Wicketkeeper": ["Short Leg", "Silly Point"],
  };

  const alts = alternatives[originalPosition] || [];
  for (const alt of alts) {
    if (!usedPositions.has(alt)) {
      return alt;
    }
  }

  // If no alternative found, assign based on role
  return assignPositionByRole(role, usedPositions, isPowerplay, batsmanType);
}

function assignPositionByRole(role: string, usedPositions: Set<string>, isPowerplay: boolean, batsmanType: string): string {
  const rolePositions: Record<string, string[]> = {
    "Wicketkeeper": ["Wicketkeeper"],
    "Bowler": ["Mid-off", "Mid-on", "Fine Leg"],
    "Batsman": ["Point", "Cover", "Mid-wicket", "Square Leg"],
    "All-rounder": ["Cover", "Mid-off", "Point", "Mid-wicket"],
  };

  const positions = rolePositions[role] || rolePositions["Batsman"];
  const fieldingPositions = getFieldingPositions(isPowerplay, batsmanType);

  for (const pos of positions) {
    if (!usedPositions.has(pos) && fieldingPositions[pos]) {
      return pos;
    }
  }

  // Fallback to any unused position
  for (const pos of Object.keys(fieldingPositions)) {
    if (!usedPositions.has(pos)) {
      return pos;
    }
  }

  return "Point"; // Ultimate fallback
}

export async function updateFieldingPosition(
  positionId: string,
  xCoordinate: number,
  yCoordinate: number,
  positionName?: string
) {
  try {
    await prisma.fieldingPosition.update({
      where: { id: positionId },
      data: {
        xCoordinate,
        yCoordinate,
        ...(positionName && { positionName }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update fielding position:", error);
    return { success: false, error: "Failed to update position" };
  }
}

export async function deleteFieldingSetup(setupId: string) {
  try {
    await prisma.fieldingSetup.delete({
      where: { id: setupId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete fielding setup:", error);
    return { success: false, error: "Failed to delete setup" };
  }
}

export async function getMatchFieldingSetups(matchId: string) {
  try {
    const setups = await prisma.fieldingSetup.findMany({
      where: { matchId },
      include: {
        positions: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, setups };
  } catch (error) {
    console.error("Failed to get fielding setups:", error);
    return { success: false, error: "Failed to get setups" };
  }
}
