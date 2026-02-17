"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { getDocById, getAllDocs, queryDocs, createDoc, serializeDoc } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

export async function getMatchForTeamSelection(matchId: string) {
    try {
        const match = await getDocById(COLLECTIONS.MATCHES, matchId);
        if (!match) {
            return { success: false, error: "Match not found" };
        }

        // Get all players
        const allPlayers = await getAllDocs(COLLECTIONS.PLAYERS);
        const sortedPlayers = allPlayers.sort((a: any, b: any) => a.name.localeCompare(b.name));

        // Get availability for this match
        const availability = await queryDocs(COLLECTIONS.AVAILABILITY, 'matchId', '==', matchId);

        // Enrich availability with player data
        const enrichedAvailability = await Promise.all(
            availability.map(async (avail: any) => {
                const player = await getDocById(COLLECTIONS.PLAYERS, avail.playerId);
                return { ...avail, player };
            })
        );

        // Get current team selections
        const teamSelections = await queryDocs(COLLECTIONS.TEAM_SELECTIONS, 'matchId', '==', matchId);

        // Enrich team selections with player data and sort by batting order
        const enrichedTeam = await Promise.all(
            teamSelections.map(async (selection: any) => {
                const player = await getDocById(COLLECTIONS.PLAYERS, selection.playerId);
                return { ...selection, player };
            })
        );
        const sortedTeam = enrichedTeam.sort((a: any, b: any) =>
            (a.battingOrder || 999) - (b.battingOrder || 999)
        );

        return {
            success: true,
            match: serializeDoc({
                id: match.id,
                opponent: match.opponent,
                date: match.date,
                location: match.location,
            }),
            allPlayers: sortedPlayers.map(serializeDoc),
            availability: enrichedAvailability.map(serializeDoc),
            currentTeam: sortedTeam.map(serializeDoc),
        };
    } catch (error) {
        console.error("Failed to fetch match data:", error);
        return { success: false, error: "Failed to fetch match data" };
    }
}

export async function saveTeamSelection(
    matchId: string,
    selectedPlayers: Array<{ id: string; battingOrder: number }>,
    substitutes: Array<{ id: string }>
) {
    try {
        // Delete existing team selections
        const existing = await queryDocs(COLLECTIONS.TEAM_SELECTIONS, 'matchId', '==', matchId);
        await Promise.all(
            existing.map((doc: any) =>
                firestore.collection(COLLECTIONS.TEAM_SELECTIONS).doc(doc.id).delete()
            )
        );

        // Create new team selections
        const teamSelections = [
            ...selectedPlayers.map((player: any) => ({
                matchId,
                playerId: player.id,
                battingOrder: player.battingOrder,
                isSubstitute: false,
                role: null,
                bowlingOrder: null,
            })),
            ...substitutes.map((player: any, index: number) => ({
                matchId,
                playerId: player.id,
                battingOrder: selectedPlayers.length + index + 1,
                isSubstitute: true,
                role: null,
                bowlingOrder: null,
            })),
        ];

        await Promise.all(
            teamSelections.map(selection => createDoc(COLLECTIONS.TEAM_SELECTIONS, selection))
        );

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath("/admin/matches");

        return { success: true };
    } catch (error) {
        console.error("Failed to save team selection:", error);
        return { success: false, error: "Failed to save team selection" };
    }
}
