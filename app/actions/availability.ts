"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { queryDocs, getDocById, createDoc, toDate, serializeDoc } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

export async function getPlayerMatches(playerId: string) {
    const activeSeasons = await queryDocs(COLLECTIONS.SEASONS, 'isActive', '==', true);
    if (activeSeasons.length === 0) return [];

    const matches = await queryDocs(COLLECTIONS.MATCHES, 'seasonId', '==', activeSeasons[0].id);

    // Get availability for this player
    const availability = await queryDocs(COLLECTIONS.AVAILABILITY, 'playerId', '==', playerId);

    // Map availability to matches and serialize
    const enrichedMatches = matches
        .map((match: any) => ({
            ...match,
            myAvailability: availability.find((a: any) => a.matchId === match.id) || null,
        }))
        .sort((a: any, b: any) => {
            const dateA = toDate(a.date);
            const dateB = toDate(b.date);
            return dateA.getTime() - dateB.getTime();
        });

    return enrichedMatches.map(serializeDoc);
}

export async function updateAvailability(
    playerId: string,
    matchId: string,
    status: string,
    note?: string
) {
    try {
        // Check if record exists
        const existing = await firestore
            .collection(COLLECTIONS.AVAILABILITY)
            .where('playerId', '==', playerId)
            .where('matchId', '==', matchId)
            .get();

        const data = {
            playerId,
            matchId,
            status,
            note: note || null,
        };

        if (!existing.empty) {
            const docId = existing.docs[0].id;
            await firestore.collection(COLLECTIONS.AVAILABILITY).doc(docId).update({
                ...data,
                updatedAt: new Date(),
            });
        } else {
            await createDoc(COLLECTIONS.AVAILABILITY, data);
        }

        revalidatePath(`/player/${playerId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update availability:", error);
        return { success: false, error: "Failed to update availability" };
    }
}

export async function getPlayer(id: string) {
    const player = await getDocById(COLLECTIONS.PLAYERS, id);
    return player ? serializeDoc(player) : null;
}
