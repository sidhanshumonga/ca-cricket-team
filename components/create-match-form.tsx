"use client";

import { createMatch } from "@/app/actions/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateMatchForm({ seasonId }: { seasonId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        if (!formData.get("date")) {
            toast.error("Please select a date");
            return;
        }

        startTransition(async () => {
            const result = await createMatch(formData);
            if (result.success) {
                toast.success("Match scheduled successfully");
                router.push("/admin/matches");
            } else {
                toast.error("Failed to schedule match");
            }
        });
    }

    return (
        <form action={handleSubmit} className="grid gap-4">
            <input type="hidden" name="seasonId" value={seasonId} />

            <div className="grid gap-2">
                <Label htmlFor="opponent">Opponent Team</Label>
                <Input id="opponent" name="opponent" required placeholder="e.g. Royal Challengers" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="time">Reporting Time</Label>
                    <Input id="time" name="time" type="time" required />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="location">Ground / Location</Label>
                <Input id="location" name="location" required placeholder="e.g. Lords Cricket Ground" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="type">Match Type</Label>
                <Select name="type" required defaultValue="League">
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="League">League Match</SelectItem>
                        <SelectItem value="Friendly">Friendly Match</SelectItem>
                        <SelectItem value="Tournament">Tournament</SelectItem>
                        <SelectItem value="Practice">Practice Match</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Scheduling..." : "Schedule Match"}
            </Button>
        </form>
    );
}
