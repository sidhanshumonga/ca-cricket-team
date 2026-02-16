"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPlayerMatches(playerId: string) {
    // Get active season
    const activeSeason = await prisma.season.findFirst({
        where: { isActive: true },
    });

    if (!activeSeason) return [];

    // Get matches for active season
    const matches = await prisma.match.findMany({
        where: { seasonId: activeSeason.id },
        include: {
            availability: {
                where: { playerId },
            },
        },
        orderBy: { date: "asc" },
    });

    return matches.map((match: any) => ({
        ...match,
        myAvailability: match.availability[0] || null,
    }));
}

export async function updateAvailability(
    playerId: string,
    matchId: string,
    status: string,
    note?: string
) {
    try {
        await prisma.availability.upsert({
            where: {
                playerId_matchId: {
                    playerId,
                    matchId,
                },
            },
            update: {
                status,
                note,
            },
            create: {
                playerId,
                matchId,
                status,
                note,
            },
        });
        revalidatePath(`/player/${playerId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update availability:", error);
        return { success: false, error: "Failed to update availability" };
    }
}

export async function getPlayer(id: string) {
    return await prisma.player.findUnique({
        where: { id },
    });
}
