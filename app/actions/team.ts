"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getMatchForTeamSelection(matchId: string) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                season: true,
                availability: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                                secondaryRole: true,
                                isCaptain: true,
                                isViceCaptain: true,
                            },
                        },
                    },
                },
                team: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                                secondaryRole: true,
                                isCaptain: true,
                                isViceCaptain: true,
                            },
                        },
                    },
                    orderBy: {
                        battingOrder: "asc",
                    },
                },
            },
        });

        if (!match) {
            return { success: false, error: "Match not found" };
        }

        // Get all players
        const allPlayers = await prisma.player.findMany({
            select: {
                id: true,
                name: true,
                role: true,
                secondaryRole: true,
                isCaptain: true,
                isViceCaptain: true,
            },
            orderBy: { name: "asc" },
        });

        return {
            success: true,
            match: {
                id: match.id,
                opponent: match.opponent,
                date: match.date,
                location: match.location,
            },
            allPlayers,
            availability: match.availability,
            currentTeam: match.team,
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
        await prisma.teamSelection.deleteMany({
            where: { matchId },
        });

        // Create new team selections
        const teamSelections = [
            ...selectedPlayers.map((player) => ({
                matchId,
                playerId: player.id,
                battingOrder: player.battingOrder,
                isSubstitute: false,
            })),
            ...substitutes.map((player, index) => ({
                matchId,
                playerId: player.id,
                battingOrder: selectedPlayers.length + index + 1,
                isSubstitute: true,
            })),
        ];

        await prisma.teamSelection.createMany({
            data: teamSelections,
        });

        revalidatePath(`/admin/matches/${matchId}`);
        revalidatePath("/admin/matches");

        return { success: true };
    } catch (error) {
        console.error("Failed to save team selection:", error);
        return { success: false, error: "Failed to save team selection" };
    }
}
