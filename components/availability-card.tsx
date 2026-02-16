"use client";

import { updateAvailability } from "@/app/actions/availability";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Check, X, HelpCircle, MapPin, Clock } from "lucide-react";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Match {
    id: string;
    date: Date;
    opponent: string;
    location: string;
    type: string;
    myAvailability: {
        status: string;
        note: string | null;
    } | null;
}

export function AvailabilityCard({ match, playerId }: { match: Match; playerId: string }) {
    const [status, setStatus] = useState(match.myAvailability?.status || "PENDING");
    const [note, setNote] = useState(match.myAvailability?.note || "");
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (newStatus: string) => {
        setStatus(newStatus);
        startTransition(async () => {
            const result = await updateAvailability(playerId, match.id, newStatus, note);
            if (result.success) {
                toast.success(`Marked as ${newStatus}`);
            } else {
                toast.error("Failed to update");
            }
        });
    };

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNote(e.target.value);
    };

    const handleNoteBlur = () => {
        if (note !== match.myAvailability?.note) {
            startTransition(async () => {
                const result = await updateAvailability(playerId, match.id, status, note);
                if (result.success) {
                    toast.success("Note saved");
                }
            });
        }
    }

    return (
        <Card className={cn(
            "transition-all",
            status === "AVAILABLE" ? "border-green-200 bg-green-50/10" :
                status === "UNAVAILABLE" ? "border-red-200 bg-red-50/10" :
                    status === "MAYBE" ? "border-yellow-200 bg-yellow-50/10" : ""
        )}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm text-muted-foreground font-medium mb-1">
                            {format(match.date, "EEE, MMM d")}
                        </div>
                        <CardTitle className="text-lg">vs {match.opponent}</CardTitle>
                    </div>
                    <Badge variant="outline">{match.type}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(match.date, "h:mm a")} Reporting
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {match.location}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant={status === "AVAILABLE" ? "default" : "outline"}
                        className={cn(status === "AVAILABLE" && "bg-green-600 hover:bg-green-700")}
                        onClick={() => handleUpdate("AVAILABLE")}
                        disabled={isPending}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Yes
                    </Button>
                    <Button
                        variant={status === "UNAVAILABLE" ? "default" : "outline"}
                        className={cn(status === "UNAVAILABLE" && "bg-red-600 hover:bg-red-700")}
                        onClick={() => handleUpdate("UNAVAILABLE")}
                        disabled={isPending}
                    >
                        <X className="mr-2 h-4 w-4" />
                        No
                    </Button>
                    <Button
                        variant={status === "MAYBE" ? "default" : "outline"}
                        className={cn(status === "MAYBE" && "bg-yellow-600 hover:bg-yellow-700")}
                        onClick={() => handleUpdate("MAYBE")}
                        disabled={isPending}
                    >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Maybe
                    </Button>
                </div>

                <Textarea
                    placeholder="Add a note (e.g. late by 30 mins)..."
                    className="text-sm resize-none"
                    rows={2}
                    value={note}
                    onChange={handleNoteChange}
                    onBlur={handleNoteBlur}
                    disabled={isPending}
                />
            </CardContent>
        </Card>
    );
}
