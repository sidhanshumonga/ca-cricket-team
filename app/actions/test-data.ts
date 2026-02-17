"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { queryDocs } from "@/lib/firestore-helpers";

export async function addCompletedTestMatch() {
  try {
    // Get active season
    const activeSeasons = await queryDocs(
      COLLECTIONS.SEASONS,
      "isActive",
      "==",
      true
    );

    if (activeSeasons.length === 0) {
      return {
        success: false,
        error: "No active season found. Please create a season first.",
      };
    }

    const seasonId = activeSeasons[0].id;

    // Create a completed match
    const matchData = {
      date: new Date("2026-02-10T14:00:00"), // Recent past date
      opponent: "The Naughtys",
      location: "Cary Community Park",
      type: "League",
      reportingTime: "1:30 PM",
      seasonId: seasonId,
      status: "Completed",
      isLocked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const matchRef = await firestore.collection(COLLECTIONS.MATCHES).add(matchData);

    return {
      success: true,
      matchId: matchRef.id,
      message: `Created completed match: vs ${matchData.opponent}`,
    };
  } catch (error: any) {
    console.error("Error adding completed match:", error);
    return {
      success: false,
      error: error.message || "Failed to add completed match",
    };
  }
}
