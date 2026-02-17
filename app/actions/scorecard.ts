"use server";

import * as cheerio from "cheerio";
import { firestore, COLLECTIONS } from "@/lib/db";
import { serializeDoc } from "@/lib/firestore-helpers";

interface ScrapedBattingData {
  playerName: string;
  runs: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  howOut?: string;
  bowlerName?: string;
  fielderName?: string;
}

interface ScrapedBowlingData {
  playerName: string;
  overs: number;
  maidens?: number;
  runs: number;
  wickets: number;
  economy?: number;
  wides?: number;
  noBalls?: number;
}

interface ScrapedScorecardData {
  ourScore?: number;
  ourWickets?: number;
  ourOvers?: number;
  opponentScore?: number;
  opponentWickets?: number;
  opponentOvers?: number;
  result?: string;
  resultMargin?: string;
  teamBattingFirst?: string;
  opponent?: string;
  matchDate?: string;
  location?: string;
  manOfMatch?: string;
  ourBatting: ScrapedBattingData[];
  ourBowling: ScrapedBowlingData[];
  opponentBatting: ScrapedBattingData[];
  opponentBowling: ScrapedBowlingData[];
}

export async function scrapeScorecard(url: string) {
  "use server";

  try {
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;

    // Fallback to local Python script if Railway URL not configured (for local development)
    if (!railwayUrl) {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);
      const path = await import("path");
      const scriptPath = path.join(process.cwd(), "scripts", "scrape_scorecard.py");
      const venvPython = path.join(process.cwd(), "venv", "bin", "python3");
      const { stdout } = await execAsync(`"${venvPython}" "${scriptPath}" "${url}"`);
      const result = JSON.parse(stdout);

      if (!result.success) {
        return { success: false, error: result.error || "Scraping failed" };
      }

      return {
        success: true,
        batting_data: result.batting_data || [],
        bowling_data: result.bowling_data || [],
        match_info: result.match_info || {},
        fullHtml: result.full_html,
        html: result.full_html?.substring(0, 5000),
        tableCount: result.table_count,
        message: result.message,
      };
    }

    // Call Railway API
    const response = await fetch(`${railwayUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Scraping failed",
      };
    }

    return {
      success: true,
      batting_data: result.batting_data || [],
      bowling_data: result.bowling_data || [],
      match_info: result.match_info || {},
      fullHtml: result.full_html,
      html: result.full_html?.substring(0, 5000),
      tableCount: result.table_count,
      message: result.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to scrape scorecard",
    };
  }
}

export async function saveScorecard(
  matchId: string,
  scorecardData: ScrapedScorecardData,
) {
  try {
    // Check if scorecard already exists for this match
    const existingScorecard = await firestore
      .collection(COLLECTIONS.SCORECARDS)
      .where("matchId", "==", matchId)
      .get();

    let scorecardId: string;

    if (!existingScorecard.empty) {
      // Update existing scorecard
      const existingScorecardDoc = existingScorecard.docs[0];
      scorecardId = existingScorecardDoc.id;

      // Update the scorecard document
      await firestore.collection(COLLECTIONS.SCORECARDS).doc(scorecardId).update({
        teamBattingFirst: scorecardData.teamBattingFirst || "us",
        ourScore: scorecardData.ourScore || null,
        ourWickets: scorecardData.ourWickets || null,
        ourOvers: scorecardData.ourOvers || null,
        opponentScore: scorecardData.opponentScore || null,
        opponentWickets: scorecardData.opponentWickets || null,
        opponentOvers: scorecardData.opponentOvers || null,
        result: scorecardData.result || null,
        resultMargin: scorecardData.resultMargin || null,
        opponent: scorecardData.opponent || null,
        matchDate: scorecardData.matchDate || null,
        location: scorecardData.location || null,
        manOfMatch: scorecardData.manOfMatch || null,
        updatedAt: new Date(),
      });

      // Delete existing batting performances
      const existingBatting = await firestore
        .collection(COLLECTIONS.BATTING_PERFORMANCES)
        .where("scorecardId", "==", scorecardId)
        .get();

      const deleteBattingPromises = existingBatting.docs.map(doc => doc.ref.delete());
      await Promise.all(deleteBattingPromises);

      // Delete existing bowling performances
      const existingBowling = await firestore
        .collection(COLLECTIONS.BOWLING_PERFORMANCES)
        .where("scorecardId", "==", scorecardId)
        .get();

      const deleteBowlingPromises = existingBowling.docs.map(doc => doc.ref.delete());
      await Promise.all(deleteBowlingPromises);
    } else {
      // Create new scorecard document
      const scorecardRef = await firestore.collection(COLLECTIONS.SCORECARDS).add({
        matchId,
        teamBattingFirst: scorecardData.teamBattingFirst || "us",
        ourScore: scorecardData.ourScore || null,
        ourWickets: scorecardData.ourWickets || null,
        ourOvers: scorecardData.ourOvers || null,
        opponentScore: scorecardData.opponentScore || null,
        opponentWickets: scorecardData.opponentWickets || null,
        opponentOvers: scorecardData.opponentOvers || null,
        result: scorecardData.result || null,
        resultMargin: scorecardData.resultMargin || null,
        opponent: scorecardData.opponent || null,
        matchDate: scorecardData.matchDate || null,
        location: scorecardData.location || null,
        manOfMatch: scorecardData.manOfMatch || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      scorecardId = scorecardRef.id;
    }

    // Save batting performances (our team and opponent)
    const ourBattingPromises = scorecardData.ourBatting.map((perf, idx) => {
      return firestore.collection(COLLECTIONS.BATTING_PERFORMANCES).add({
        scorecardId,
        playerId: null,
        playerName: perf.playerName || "Unknown Player",
        runs: perf.runs,
        ballsFaced: perf.ballsFaced || null,
        fours: perf.fours || null,
        sixes: perf.sixes || null,
        strikeRate: perf.strikeRate || null,
        howOut: perf.howOut || null,
        bowlerName: perf.bowlerName || null,
        fielderName: perf.fielderName || null,
        battingPosition: idx + 1,
        isOpponent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const opponentBattingPromises = scorecardData.opponentBatting.map((perf, idx) => {
      return firestore.collection(COLLECTIONS.BATTING_PERFORMANCES).add({
        scorecardId,
        playerId: null,
        playerName: perf.playerName || "Unknown Player",
        runs: perf.runs,
        ballsFaced: perf.ballsFaced || null,
        fours: perf.fours || null,
        sixes: perf.sixes || null,
        strikeRate: perf.strikeRate || null,
        howOut: perf.howOut || null,
        bowlerName: perf.bowlerName || null,
        fielderName: perf.fielderName || null,
        battingPosition: idx + 1,
        isOpponent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Save bowling performances (our team and opponent)
    const ourBowlingPromises = scorecardData.ourBowling.map((perf, idx) => {
      return firestore.collection(COLLECTIONS.BOWLING_PERFORMANCES).add({
        scorecardId,
        playerId: null,
        playerName: perf.playerName || "Unknown Player",
        overs: perf.overs,
        maidens: perf.maidens || null,
        runs: perf.runs,
        wickets: perf.wickets,
        economy: perf.economy || null,
        wides: perf.wides || null,
        noBalls: perf.noBalls || null,
        isOpponent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const opponentBowlingPromises = scorecardData.opponentBowling.map((perf, idx) => {
      return firestore.collection(COLLECTIONS.BOWLING_PERFORMANCES).add({
        scorecardId,
        playerId: null,
        playerName: perf.playerName || "Unknown Player",
        overs: perf.overs,
        maidens: perf.maidens || null,
        runs: perf.runs,
        wickets: perf.wickets,
        economy: perf.economy || null,
        wides: perf.wides || null,
        noBalls: perf.noBalls || null,
        isOpponent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const allPromises = [
      ...ourBattingPromises,
      ...opponentBattingPromises,
      ...ourBowlingPromises,
      ...opponentBowlingPromises,
    ];
    await Promise.all(allPromises);

    return {
      success: true,
      scorecardId,
      message: "Scorecard saved successfully!",
    };
  } catch (error: any) {
    console.error("Failed to save scorecard:", error);
    return {
      success: false,
      error: error.message || "Failed to save scorecard",
    };
  }
}

export async function getScorecard(matchId: string) {
  try {
    const scorecards = await firestore
      .collection(COLLECTIONS.SCORECARDS)
      .where("matchId", "==", matchId)
      .get();

    if (scorecards.empty) {
      return { success: true, scorecard: null };
    }

    const scorecardDoc = scorecards.docs[0];
    const scorecardData = serializeDoc({ id: scorecardDoc.id, ...scorecardDoc.data() });

    // Get batting performances
    const battingSnap = await firestore
      .collection(COLLECTIONS.BATTING_PERFORMANCES)
      .where("scorecardId", "==", scorecardDoc.id)
      .get();

    const allBatting = battingSnap.docs.map((doc) =>
      serializeDoc({ id: doc.id, ...doc.data() })
    );

    // Separate and sort our batting and opponent batting
    const ourBatting = allBatting
      .filter((b: any) => !b.isOpponent)
      .sort((a: any, b: any) => (a.battingPosition || 0) - (b.battingPosition || 0));

    const opponentBatting = allBatting
      .filter((b: any) => b.isOpponent)
      .sort((a: any, b: any) => (a.battingPosition || 0) - (b.battingPosition || 0));

    // Get bowling performances
    const bowlingSnap = await firestore
      .collection(COLLECTIONS.BOWLING_PERFORMANCES)
      .where("scorecardId", "==", scorecardDoc.id)
      .get();

    const allBowling = bowlingSnap.docs.map((doc) =>
      serializeDoc({ id: doc.id, ...doc.data() })
    );

    // Separate our bowling and opponent bowling
    const ourBowling = allBowling.filter((b: any) => !b.isOpponent);
    const opponentBowling = allBowling.filter((b: any) => b.isOpponent);

    return {
      success: true,
      scorecard: scorecardData,
      batting: ourBatting,
      bowling: opponentBowling, // Opponent bowled to us
      opponentBatting,
      opponentBowling: ourBowling, // We bowled to opponent
    };
  } catch (error: any) {
    console.error("Failed to get scorecard:", error);
    return {
      success: false,
      error: error.message || "Failed to get scorecard",
    };
  }
}
