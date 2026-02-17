"use server";

import { firestore, COLLECTIONS } from "@/lib/db";
import { createDoc, queryDocs, deleteDoc, toDate, serializeDoc } from "@/lib/firestore-helpers";
import { revalidatePath } from "next/cache";

export async function createMatch(formData: FormData) {
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const opponent = formData.get("opponent") as string;
    const location = formData.get("location") as string;
    const type = formData.get("type") as string;
    const seasonId = formData.get("seasonId") as string;

    const dateTime = new Date(`${dateStr}T${timeStr}`);

    try {
        await createDoc(COLLECTIONS.MATCHES, {
            date: dateTime,
            opponent,
            location,
            type,
            seasonId,
            status: "Scheduled",
            isLocked: false,
            reportingTime: null,
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
        const activeSeasons = await queryDocs(COLLECTIONS.SEASONS, 'isActive', '==', true);
        if (activeSeasons.length === 0) return [];
        seasonId = activeSeasons[0].id;
    }

    const matches = await queryDocs(COLLECTIONS.MATCHES, 'seasonId', '==', seasonId);
    const sorted = matches.sort((a: any, b: any) => {
        const dateA = toDate(a.date);
        const dateB = toDate(b.date);
        return dateA.getTime() - dateB.getTime();
    });
    return sorted.map(serializeDoc);
}

export async function deleteMatch(id: string) {
    try {
        await deleteDoc(COLLECTIONS.MATCHES, id);
        revalidatePath("/admin/matches");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete match" };
    }
}

export async function getCompletedMatches(limit: number = 5) {
    const activeSeasons = await queryDocs(COLLECTIONS.SEASONS, 'isActive', '==', true);
    if (activeSeasons.length === 0) return [];

    const allMatches = await firestore
        .collection(COLLECTIONS.MATCHES)
        .where('seasonId', '==', activeSeasons[0].id)
        .where('status', '==', 'Completed')
        .get();

    const matches = allMatches.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const sorted = matches
        .sort((a: any, b: any) => {
            const dateA = toDate(a.date);
            const dateB = toDate(b.date);
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);

    return sorted.map(serializeDoc);
}
