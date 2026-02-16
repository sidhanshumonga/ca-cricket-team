"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSeason(formData: FormData) {
    const name = formData.get("name") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    await prisma.season.create({
        data: {
            name,
            startDate,
            endDate,
        },
    });

    revalidatePath("/admin/settings");
}

export async function getSeasons() {
    return await prisma.season.findMany({
        orderBy: { startDate: "desc" },
    });
}

export async function getActiveSeason() {
    return await prisma.season.findFirst({
        where: { isActive: true },
    });
}

export async function deleteSeason(id: string) {
    await prisma.season.delete({
        where: { id },
    });
    revalidatePath("/admin/settings");
}

export async function markSeasonAvailability(
    playerId: string,
    seasonId: string,
    status: string,
    unavailableDates?: string,
    notes?: string
) {
    await prisma.seasonAvailability.upsert({
        where: {
            playerId_seasonId: {
                playerId,
                seasonId,
            },
        },
        update: {
            status,
            unavailableDates: unavailableDates || null,
            notes: notes || null,
        },
        create: {
            playerId,
            seasonId,
            status,
            unavailableDates: unavailableDates || null,
            notes: notes || null,
        },
    });
    revalidatePath("/");
}

export async function getSeasonAvailability(playerId: string, seasonId: string) {
    return await prisma.seasonAvailability.findUnique({
        where: {
            playerId_seasonId: {
                playerId,
                seasonId,
            },
        },
    });
}
