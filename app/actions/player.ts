"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { createDoc, getAllDocs, updateDoc, deleteDoc, serializeDoc } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

export async function createPlayer(formData: FormData) {
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const secondaryRole = formData.get("secondaryRole") as string;
    const battingStyle = formData.get("battingStyle") as string;
    const bowlingStyle = formData.get("bowlingStyle") as string;
    const battingPosition = formData.get("battingPosition") as string;
    const defaultFieldingPosition = formData.get("defaultFieldingPosition") as string;
    const notes = formData.get("notes") as string;
    const isCaptain = formData.get("isCaptain") === "on";
    const isViceCaptain = formData.get("isViceCaptain") === "on";

    try {
        await createDoc(COLLECTIONS.PLAYERS, {
            name,
            role,
            secondaryRole: secondaryRole || null,
            battingStyle: battingStyle || null,
            bowlingStyle: bowlingStyle || null,
            battingPosition: battingPosition || null,
            defaultFieldingPosition: defaultFieldingPosition || null,
            isCaptain,
            isViceCaptain,
            notes: notes || null,
        });
        revalidatePath("/admin/players");
        return { success: true };
    } catch (error) {
        console.error("Failed to create player:", error);
        return { success: false, error: "Failed to create player" };
    }
}

export async function getPlayers() {
    try {
        const players = await getAllDocs(COLLECTIONS.PLAYERS);
        // Sort by name and serialize for client components
        const sorted = players.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
        return sorted.map(serializeDoc);
    } catch (error) {
        console.error("Failed to get players:", error);
        return [];
    }
}

export async function updatePlayer(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const secondaryRole = formData.get("secondaryRole") as string;
    const battingStyle = formData.get("battingStyle") as string;
    const bowlingStyle = formData.get("bowlingStyle") as string;
    const battingPosition = formData.get("battingPosition") as string;
    const defaultFieldingPosition = formData.get("defaultFieldingPosition") as string;
    const notes = formData.get("notes") as string;
    const isCaptain = formData.get("isCaptain") === "on";
    const isViceCaptain = formData.get("isViceCaptain") === "on";

    const updateData: Record<string, any> = {};
    if (name !== null) updateData.name = name;
    if (role !== null) updateData.role = role;
    if (secondaryRole !== null) updateData.secondaryRole = secondaryRole || null;
    if (battingStyle !== null) updateData.battingStyle = battingStyle || null;
    if (bowlingStyle !== null) updateData.bowlingStyle = bowlingStyle || null;
    if (battingPosition !== null) updateData.battingPosition = battingPosition || null;
    if (defaultFieldingPosition !== null) updateData.defaultFieldingPosition = defaultFieldingPosition || null;
    if (notes !== null) updateData.notes = notes || null;
    if (formData.get("isCaptain") !== null) updateData.isCaptain = isCaptain;
    if (formData.get("isViceCaptain") !== null) updateData.isViceCaptain = isViceCaptain;
    if (formData.has("jerseyNumber")) {
        const jerseyNumberRaw = formData.get("jerseyNumber") as string;
        updateData.jerseyNumber = jerseyNumberRaw === "" ? null : Number(jerseyNumberRaw);
    }

    try {
        await updateDoc(COLLECTIONS.PLAYERS, id, updateData);
        revalidatePath("/admin/players");
        return { success: true };
    } catch (error) {
        console.error("Failed to update player:", error);
        return { success: false, error: "Failed to update player" };
    }
}

export async function deletePlayer(id: string) {
    try {
        await deleteDoc(COLLECTIONS.PLAYERS, id);
        revalidatePath("/admin/players");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete player" };
    }
}
