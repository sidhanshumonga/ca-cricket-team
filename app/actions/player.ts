"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPlayer(formData: FormData) {
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const secondaryRole = formData.get("secondaryRole") as string;
    const battingStyle = formData.get("battingStyle") as string;
    const bowlingStyle = formData.get("bowlingStyle") as string;
    const battingPosition = formData.get("battingPosition") as string;
    const notes = formData.get("notes") as string;
    const isCaptain = formData.get("isCaptain") === "on";
    const isViceCaptain = formData.get("isViceCaptain") === "on";

    try {
        await prisma.player.create({
            data: {
                name,
                role,
                secondaryRole: secondaryRole || null,
                battingStyle: battingStyle || null,
                bowlingStyle: bowlingStyle || null,
                battingPosition: battingPosition || null,
                isCaptain,
                isViceCaptain,
                notes: notes || null,
            },
        });
        revalidatePath("/admin/players");
        return { success: true };
    } catch (error) {
        console.error("Failed to create player:", error);
        return { success: false, error: "Failed to create player" };
    }
}

export async function getPlayers() {
    return await prisma.player.findMany({
        select: {
            id: true,
            name: true,
            role: true,
            secondaryRole: true,
            battingStyle: true,
            bowlingStyle: true,
            battingPosition: true,
            isCaptain: true,
            isViceCaptain: true,
            notes: true,
        },
        orderBy: { name: "asc" },
    });
}

export async function updatePlayer(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const secondaryRole = formData.get("secondaryRole") as string;
    const battingStyle = formData.get("battingStyle") as string;
    const bowlingStyle = formData.get("bowlingStyle") as string;
    const battingPosition = formData.get("battingPosition") as string;
    const notes = formData.get("notes") as string;
    const isCaptain = formData.get("isCaptain") === "on";
    const isViceCaptain = formData.get("isViceCaptain") === "on";

    try {
        await prisma.player.update({
            where: { id },
            data: {
                name,
                role,
                secondaryRole: secondaryRole || null,
                battingStyle: battingStyle || null,
                bowlingStyle: bowlingStyle || null,
                battingPosition: battingPosition || null,
                isCaptain,
                isViceCaptain,
                notes: notes || null,
            },
        });
        revalidatePath("/admin/players");
        return { success: true };
    } catch (error) {
        console.error("Failed to update player:", error);
        return { success: false, error: "Failed to update player" };
    }
}

export async function deletePlayer(id: string) {
    try {
        await prisma.player.delete({
            where: { id },
        });
        revalidatePath("/admin/players");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete player" };
    }
}
