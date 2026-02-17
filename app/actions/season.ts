"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { createDoc, getAllDocs, deleteDoc, queryDocs, toDate, serializeDoc } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

export async function createSeason(formData: FormData) {
    const name = formData.get("name") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    await createDoc(COLLECTIONS.SEASONS, {
        name,
        startDate,
        endDate,
        isActive: true,
    });

    revalidatePath("/admin/settings");
}

export async function getSeasons() {
    const seasons = await getAllDocs(COLLECTIONS.SEASONS);
    // Sort by startDate descending and serialize
    const sorted = seasons.sort((a: any, b: any) => {
        const dateA = toDate(a.startDate);
        const dateB = toDate(b.startDate);
        return dateB.getTime() - dateA.getTime();
    });
    return sorted.map(serializeDoc);
}

export async function getActiveSeason() {
    const seasons = await queryDocs(COLLECTIONS.SEASONS, 'isActive', '==', true);
    return seasons.length > 0 ? serializeDoc(seasons[0]) : null;
}

export async function deleteSeason(id: string) {
    await deleteDoc(COLLECTIONS.SEASONS, id);
    revalidatePath("/admin/settings");
}

export async function markSeasonAvailability(
    playerId: string,
    seasonId: string,
    status: string,
    unavailableDates?: string,
    notes?: string
) {
    // Check if record exists
    const existing = await firestore
        .collection(COLLECTIONS.SEASON_AVAILABILITY)
        .where('playerId', '==', playerId)
        .where('seasonId', '==', seasonId)
        .get();

    const data = {
        playerId,
        seasonId,
        status,
        unavailableDates: unavailableDates || null,
        notes: notes || null,
    };

    if (!existing.empty) {
        // Update existing
        const docId = existing.docs[0].id;
        await firestore.collection(COLLECTIONS.SEASON_AVAILABILITY).doc(docId).update({
            ...data,
            updatedAt: new Date(),
        });
    } else {
        // Create new
        await createDoc(COLLECTIONS.SEASON_AVAILABILITY, data);
    }

    revalidatePath("/");
}

export async function getSeasonAvailability(playerId: string, seasonId: string) {
    const results = await firestore
        .collection(COLLECTIONS.SEASON_AVAILABILITY)
        .where('playerId', '==', playerId)
        .where('seasonId', '==', seasonId)
        .get();

    if (results.empty) return null;

    const doc = results.docs[0];
    return serializeDoc({ id: doc.id, ...doc.data() });
}

export async function getAllSeasonAvailability(seasonId: string) {
    const results = await firestore
        .collection(COLLECTIONS.SEASON_AVAILABILITY)
        .where('seasonId', '==', seasonId)
        .get();

    const availabilityMap: Record<string, any> = {};
    results.docs.forEach(doc => {
        const data: any = { id: doc.id, ...doc.data() };
        availabilityMap[data.playerId] = serializeDoc(data);
    });

    return availabilityMap;
}
