"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createMatch(formData: FormData) {
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string; // Reporting time
    const opponent = formData.get("opponent") as string;
    const location = formData.get("location") as string;
    const type = formData.get("type") as string;
    const seasonId = formData.get("seasonId") as string;

    // Combine date and time for the actual match datetime if needed, 
    // currently schema has `date DateTime` and no separate time field.
    // Let's assume `date` stores the full DateTime.
    const dateTime = new Date(`${dateStr}T${timeStr}`);

    try {
        await prisma.match.create({
            data: {
                date: dateTime,
                opponent,
                location,
                type,
                seasonId,
                status: "Scheduled",
            },
        });
        revalidatePath("/admin/matches");
        return { success: true };
    } catch (error) {
        console.error("Failed to create match:", error);
        return { success: false, error: "Failed to create match" };
    }
}

export async function getMatches(seasonId?: string) {
    if (!seasonId) {
        // If no season ID provided, get matches for the active season
        const activeSeason = await prisma.season.findFirst({
            where: { isActive: true },
        });
        if (!activeSeason) return [];
        seasonId = activeSeason.id;
    }

    return await prisma.match.findMany({
        where: { seasonId },
        orderBy: { date: "asc" },
    });
}

export async function deleteMatch(id: string) {
    try {
        await prisma.match.delete({
            where: { id },
        });
        revalidatePath("/admin/matches");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete match" };
    }
}

export async function getCompletedMatches(limit: number = 5) {
    const activeSeason = await prisma.season.findFirst({
        where: { isActive: true },
    });

    if (!activeSeason) return [];

    return await prisma.match.findMany({
        where: {
            seasonId: activeSeason.id,
            status: "Completed",
        },
        orderBy: { date: "desc" },
        take: limit,
    });
}
