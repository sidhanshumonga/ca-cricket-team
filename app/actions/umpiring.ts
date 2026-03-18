"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { createDoc, getAllDocs, deleteDoc, getDocById, updateDoc, toDate, serializeDoc } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

export async function createUmpiringMatch(formData: FormData) {
    const matchName = formData.get("matchName") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const location = formData.get("location") as string;

    const dateTime = new Date(`${dateStr}T${timeStr}`);

    try {
        await createDoc(COLLECTIONS.UMPIRING_MATCHES, {
            matchName,
            date: dateTime,
            time: timeStr,
            location,
            slot1PlayerId: null,
            slot2PlayerId: null,
            createdAt: new Date(),
        });
        revalidatePath("/admin/umpiring");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Failed to create umpiring match:", error);
        return { success: false, error: "Failed to create umpiring match" };
    }
}

export async function getUmpiringMatches() {
    try {
        const matches = await getAllDocs(COLLECTIONS.UMPIRING_MATCHES);
        const now = new Date();

        // Only return upcoming matches, sorted by date
        const upcomingMatches = matches
            .filter((m: any) => toDate(m.date) >= now)
            .sort((a: any, b: any) => toDate(a.date).getTime() - toDate(b.date).getTime());

        // Enrich with player data
        const enriched = await Promise.all(
            upcomingMatches.map(async (match: any) => {
                const slot1Player = match.slot1PlayerId
                    ? await getDocById(COLLECTIONS.PLAYERS, match.slot1PlayerId)
                    : null;
                const slot2Player = match.slot2PlayerId
                    ? await getDocById(COLLECTIONS.PLAYERS, match.slot2PlayerId)
                    : null;

                return serializeDoc({
                    ...match,
                    slot1Player: slot1Player ? serializeDoc(slot1Player) : null,
                    slot2Player: slot2Player ? serializeDoc(slot2Player) : null,
                });
            })
        );

        return { success: true, matches: enriched };
    } catch (error) {
        console.error("Failed to get umpiring matches:", error);
        return { success: false, error: "Failed to get umpiring matches", matches: [] };
    }
}

export async function claimUmpiringSlot(matchId: string, playerId: string, slotNumber: 1 | 2) {
    try {
        const match = await getDocById(COLLECTIONS.UMPIRING_MATCHES, matchId);
        if (!match) {
            return { success: false, error: "Match not found" };
        }

        const slotField = slotNumber === 1 ? "slot1PlayerId" : "slot2PlayerId";

        // Check if slot is already taken
        if (match[slotField]) {
            return { success: false, error: "Slot already taken" };
        }

        // Check if player already has the other slot
        const otherSlotField = slotNumber === 1 ? "slot2PlayerId" : "slot1PlayerId";
        if (match[otherSlotField] === playerId) {
            return { success: false, error: "You already claimed the other slot for this match" };
        }

        await updateDoc(COLLECTIONS.UMPIRING_MATCHES, matchId, {
            [slotField]: playerId,
        });

        revalidatePath("/admin/umpiring");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Failed to claim slot:", error);
        return { success: false, error: "Failed to claim slot" };
    }
}

export async function releaseUmpiringSlot(matchId: string, playerId: string) {
    try {
        const match = await getDocById(COLLECTIONS.UMPIRING_MATCHES, matchId);
        if (!match) {
            return { success: false, error: "Match not found" };
        }

        const updates: any = {};
        if (match.slot1PlayerId === playerId) {
            updates.slot1PlayerId = null;
        }
        if (match.slot2PlayerId === playerId) {
            updates.slot2PlayerId = null;
        }

        if (Object.keys(updates).length === 0) {
            return { success: false, error: "You don't have any slot for this match" };
        }

        await updateDoc(COLLECTIONS.UMPIRING_MATCHES, matchId, updates);

        revalidatePath("/admin/umpiring");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Failed to release slot:", error);
        return { success: false, error: "Failed to release slot" };
    }
}

export async function deleteUmpiringMatch(id: string) {
    try {
        await deleteDoc(COLLECTIONS.UMPIRING_MATCHES, id);
        revalidatePath("/admin/umpiring");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete umpiring match" };
    }
}

export async function getPlayerUmpiringAssignments(playerId: string) {
    try {
        const matches = await getAllDocs(COLLECTIONS.UMPIRING_MATCHES);
        const now = new Date();

        const upcomingMatches = matches
            .filter((m: any) => toDate(m.date) >= now)
            .sort((a: any, b: any) => toDate(a.date).getTime() - toDate(b.date).getTime());

        const myAssignments = upcomingMatches.filter(
            (m: any) => m.slot1PlayerId === playerId || m.slot2PlayerId === playerId
        );

        const availableSlots = upcomingMatches.filter(
            (m: any) => !m.slot1PlayerId || !m.slot2PlayerId
        );

        return {
            success: true,
            myAssignments: myAssignments.map(serializeDoc),
            availableSlots: availableSlots.map(serializeDoc),
        };
    } catch (error) {
        console.error("Failed to get player umpiring assignments:", error);
        return { success: false, error: "Failed to get assignments", myAssignments: [], availableSlots: [] };
    }
}
