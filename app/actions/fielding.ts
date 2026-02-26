"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { getDocById, queryDocs, createDoc, updateDoc, deleteDoc, getAllDocs, serializeDoc } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

// Fielding position presets - manually created by user for accurate positioning
// 4 combinations: Powerplay/Normal × RHB/LHB

const POWERPLAY_RHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Short Mid-on": { x: 66.3, y: 54.9 },
  "Long-on": { x: 68.7, y: 89.5 },
  "Deep Square Leg": { x: 93.5, y: 45.3 },
  "Mid-off": { x: 36.3, y: 66.6 },
  "Short Leg": { x: 65.5, y: 34.9 },
  "Wicketkeeper": { x: 50, y: 32 },
  "Short Cover": { x: 37.8, y: 49.8 },
  "Point": { x: 32.4, y: 37.9 },
  "Short Third Man": { x: 42.7, y: 27.9 },
  "Deep Cover": { x: 7.3, y: 47.9 },
  "Silly Mid-off": { x: 65, y: 32.3 },
};

const NORMAL_RHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Deep Mid-wicket": { x: 88.3, y: 67.8 },
  "Long-on": { x: 70.3, y: 86.5 },
  "Deep Square Leg": { x: 92.1, y: 42.2 },
  "Mid-off": { x: 35.3, y: 70.9 },
  "Short Leg": { x: 65.5, y: 34.9 },
  "Wicketkeeper": { x: 50, y: 32 },
  "Short Cover": { x: 37.8, y: 49.8 },
  "Point": { x: 32.4, y: 37.9 },
  "Third Man": { x: 43.2, y: 10.8 },
  "Deep Cover": { x: 7.7, y: 50.8 },
  "Silly Mid-off": { x: 65, y: 32.3 },
};

const POWERPLAY_LHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Short Cover": { x: 64.5, y: 50.9 },
  "Mid-off": { x: 64.6, y: 69.9 },
  "Deep Cover": { x: 90, y: 47.5 },
  "Mid-wicket": { x: 19, y: 80.1 },
  "Point": { x: 70.5, y: 38.9 },
  "Wicketkeeper": { x: 50, y: 32 },
  "Short Mid-wicket": { x: 33.5, y: 55.7 },
  "Short Leg": { x: 34.6, y: 33.5 },
  "Short Third Man": { x: 58.8, y: 28.5 },
  "Deep Square Leg": { x: 7, y: 45.3 },
  "Silly Mid-off": { x: 69.4, y: 36.9 },
};

const NORMAL_LHB_POSITIONS: Record<string, { x: number; y: number }> = {
  "Bowler": { x: 49.1, y: 74.2 },
  "Short Cover": { x: 69.7, y: 54.7 },
  "Mid-off": { x: 64.6, y: 69.9 },
  "Deep Cover": { x: 90, y: 47.5 },
  "Long-on": { x: 32.8, y: 86.7 },
  "Point": { x: 70.5, y: 38.9 },
  "Wicketkeeper": { x: 50, y: 32 },
  "Mid-wicket": { x: 9.2, y: 64.9 },
  "Short Leg": { x: 37.8, y: 31.4 },
  "Third Man": { x: 59, y: 10.2 },
  "Deep Square Leg": { x: 9.4, y: 34.3 },
  "Silly Mid-off": { x: 68.6, y: 37.2 },
};

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
    const setups = await firestore
      .collection(COLLECTIONS.FIELDING_SETUPS)
      .where('matchId', '==', matchId)
      .where('bowlerId', '==', bowlerId)
      .where('batsmanType', '==', batsmanType)
      .where('isPowerplay', '==', isPowerplay)
      .get();

    if (setups.empty) {
      return { success: true, setup: null };
    }

    const setupDoc = setups.docs[0];
    const setup = { id: setupDoc.id, ...setupDoc.data() };

    // Get positions for this setup
    const positions = await queryDocs(COLLECTIONS.FIELDING_POSITIONS, 'setupId', '==', setup.id);

    // Enrich with player data
    const enrichedPositions = await Promise.all(
      positions.map(async (pos: any) => {
        const player = await getDocById(COLLECTIONS.PLAYERS, pos.playerId);
        return { ...pos, player };
      })
    );

    const serializedSetup = serializeDoc({
      ...setup,
      positions: enrichedPositions.map((pos: any) => serializeDoc({
        ...pos,
        player: pos.player ? serializeDoc(pos.player) : null,
      })),
    });
    return { success: true, setup: serializedSetup };
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
    const match = await getDocById(COLLECTIONS.MATCHES, matchId);
    if (!match) {
      return { success: false, error: "Match not found" };
    }

    // Get team selections
    const allTeamSelections = await queryDocs(COLLECTIONS.TEAM_SELECTIONS, 'matchId', '==', matchId);
    const teamSelections = allTeamSelections
      .filter((s: any) => !s.isSubstitute)
      .sort((a: any, b: any) => (a.battingOrder || 999) - (b.battingOrder || 999));

    if (teamSelections.length === 0) {
      return { success: false, error: "No team selected for this match" };
    }

    // Enrich with player data
    const team = await Promise.all(
      teamSelections.map(async (selection: any) => {
        const player = await getDocById(COLLECTIONS.PLAYERS, selection.playerId);
        return { ...selection, player };
      })
    );

    // Delete existing setup if any
    const existingSetups = await firestore
      .collection(COLLECTIONS.FIELDING_SETUPS)
      .where('matchId', '==', matchId)
      .where('bowlerId', '==', bowlerId || null)
      .where('batsmanType', '==', batsmanType)
      .where('isPowerplay', '==', isPowerplay)
      .get();

    await Promise.all(
      existingSetups.docs.map(doc => doc.ref.delete())
    );

    // Create new setup
    const setup = await createDoc(COLLECTIONS.FIELDING_SETUPS, {
      matchId,
      bowlerId: bowlerId || null,
      batsmanType,
      isPowerplay,
      name: name || null,
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

    const fieldingPositions = getFieldingPositions(isPowerplay, batsmanType);

    // Step 1: Assign wicketkeeper
    const wicketkeeper = team.find(
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

    // Step 2: Assign bowler
    if (bowlerId && fieldingPositions["Bowler"]) {
      const bowlerSelection = team.find((s: any) => s.player.id === bowlerId);
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

    // Step 3: Assign remaining players
    for (const selection of team) {
      const player = selection.player;

      if (positions.find(p => p.playerId === player.id)) {
        continue;
      }

      let positionName: string;
      let coords = { x: 50, y: 50 };

      if (player.defaultFieldingPosition &&
        fieldingPositions[player.defaultFieldingPosition] &&
        !usedPositions.has(player.defaultFieldingPosition)) {
        positionName = player.defaultFieldingPosition;
        coords = fieldingPositions[positionName];
      } else {
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
    await Promise.all(
      positions.map(pos => createDoc(COLLECTIONS.FIELDING_POSITIONS, pos))
    );

    revalidatePath(`/admin/matches/${matchId}`);

    return { success: true, setupId: setup.id };
  } catch (error) {
    console.error("Failed to generate fielding setup:", error);
    return { success: false, error: "Failed to generate fielding setup" };
  }
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

  for (const pos of Object.keys(fieldingPositions)) {
    if (!usedPositions.has(pos)) {
      return pos;
    }
  }

  return "Point";
}

export async function updateFieldingPosition(
  positionId: string,
  xCoordinate: number,
  yCoordinate: number,
  positionName?: string
) {
  try {
    await updateDoc(COLLECTIONS.FIELDING_POSITIONS, positionId, {
      xCoordinate,
      yCoordinate,
      ...(positionName && { positionName }),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update fielding position:", error);
    return { success: false, error: "Failed to update position" };
  }
}

export async function deleteFieldingSetup(setupId: string) {
  try {
    // Delete all positions first
    const positions = await queryDocs(COLLECTIONS.FIELDING_POSITIONS, 'setupId', '==', setupId);
    await Promise.all(
      positions.map((pos: any) => deleteDoc(COLLECTIONS.FIELDING_POSITIONS, pos.id))
    );

    // Delete setup
    await deleteDoc(COLLECTIONS.FIELDING_SETUPS, setupId);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete fielding setup:", error);
    return { success: false, error: "Failed to delete setup" };
  }
}

export async function getMatchFieldingSetups(matchId: string) {
  try {
    const setups = await queryDocs(COLLECTIONS.FIELDING_SETUPS, 'matchId', '==', matchId);

    // Enrich with positions and player data
    const enrichedSetups = await Promise.all(
      setups.map(async (setup: any) => {
        const positions = await queryDocs(COLLECTIONS.FIELDING_POSITIONS, 'setupId', '==', setup.id);
        const enrichedPositions = await Promise.all(
          positions.map(async (pos: any) => {
            const player = await getDocById(COLLECTIONS.PLAYERS, pos.playerId);
            return { ...pos, player };
          })
        );
        return { ...setup, positions: enrichedPositions };
      })
    );

    return { success: true, setups: enrichedSetups };
  } catch (error) {
    console.error("Failed to get fielding setups:", error);
    return { success: false, error: "Failed to get setups" };
  }
}
