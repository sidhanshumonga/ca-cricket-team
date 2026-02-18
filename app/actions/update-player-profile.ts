"use server";

import { updatePlayer } from "./player";
import { revalidatePath } from "next/cache";

export async function updatePlayerProfile(playerId: string, playerData: {
  role?: string;
  secondaryRole?: string | null;
  battingStyle?: string | null;
  bowlingStyle?: string | null;
  battingPosition?: string | null;
  defaultFieldingPosition?: string | null;
  notes?: string | null;
  jerseyNumber?: number | null;
}) {
  try {
    // Create FormData from the player data
    const formData = new FormData();

    if (playerData.role !== undefined) {
      formData.append("role", playerData.role);
    }
    if (playerData.secondaryRole !== undefined) {
      formData.append("secondaryRole", playerData.secondaryRole || "");
    }
    if (playerData.battingStyle !== undefined) {
      formData.append("battingStyle", playerData.battingStyle || "");
    }
    if (playerData.bowlingStyle !== undefined) {
      formData.append("bowlingStyle", playerData.bowlingStyle || "");
    }
    if (playerData.battingPosition !== undefined) {
      formData.append("battingPosition", playerData.battingPosition || "");
    }
    if (playerData.defaultFieldingPosition !== undefined) {
      formData.append("defaultFieldingPosition", playerData.defaultFieldingPosition || "");
    }
    if (playerData.notes !== undefined) {
      formData.append("notes", playerData.notes || "");
    }
    if (playerData.jerseyNumber !== undefined) {
      formData.append("jerseyNumber", playerData.jerseyNumber?.toString() || "");
    }

    const result = await updatePlayer(playerId, formData);

    if (result.success) {
      revalidatePath(`/player/${playerId}`);
    }

    return result;
  } catch (error) {
    console.error("Failed to update player profile:", error);
    return { success: false, error: "Failed to update player profile" };
  }
}
