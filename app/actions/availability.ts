"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { queryDocs, getDocById, createDoc, toDate, serializeDoc, getAllDocs } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

export async function getPlayerMatches(playerId: string) {
    const activeSeasons = await queryDocs(COLLECTIONS.SEASONS, 'isActive', '==', true);
    if (activeSeasons.length === 0) return { matches: [], allPlayers: [] };

    const seasonId = activeSeasons[0].id;
    const [matches, myAvailability, allAvailabilitySnap, allPlayers] = await Promise.all([
        queryDocs(COLLECTIONS.MATCHES, 'seasonId', '==', seasonId),
        queryDocs(COLLECTIONS.AVAILABILITY, 'playerId', '==', playerId),
        firestore.collection(COLLECTIONS.AVAILABILITY).get(),
        getAllDocs(COLLECTIONS.PLAYERS),
    ]);

    const allAvailability: any[] = allAvailabilitySnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const byMatch: Record<string, any[]> = {};
    for (const a of allAvailability) {
        if (!byMatch[a.matchId]) byMatch[a.matchId] = [];
        byMatch[a.matchId].push(a);
    }

    const enrichedMatches = matches
        .map((match: any) => ({
            ...match,
            myAvailability: myAvailability.find((a: any) => a.matchId === match.id) || null,
            matchAvailability: byMatch[match.id] || [],
        }))
        .sort((a: any, b: any) => {
            const dateA = toDate(a.date);
            const dateB = toDate(b.date);
            return dateA.getTime() - dateB.getTime();
        });

    return {
        matches: enrichedMatches.map(serializeDoc),
        allPlayers: allPlayers.map(serializeDoc),
    };
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
