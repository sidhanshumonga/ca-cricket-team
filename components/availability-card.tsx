"use client";

import { updateAvailability } from "@/app/actions/availability";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Check, X, UserPlus, MapPin, Clock } from "lucide-react";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  date: Date;
  opponent: string;
  location: string;
  type: string;
  reportingTime?: string | null;
  matchTime?: string | null;
  myAvailability: {
    status: string;
    note: string | null;
  } | null;
}

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function AvailabilityCard({
  match,
  playerId,
}: {
  match: Match;
  playerId: string;
}) {
  const [status, setStatus] = useState(
    match.myAvailability?.status || "PENDING",
  );
  const [note, setNote] = useState(match.myAvailability?.note || "");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updateAvailability(
        playerId,
        match.id,
        newStatus,
        note,
      );
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
        const result = await updateAvailability(
          playerId,
          match.id,
          status,
          note,
        );
        if (result.success) {
          toast.success("Note saved");
        }
      });
    }
  };

  return (
    <Card
      className={cn(
        "transition-all",
        status === "AVAILABLE"
          ? "border-green-200 bg-green-50/10"
          : status === "UNAVAILABLE"
            ? "border-red-200 bg-red-50/10"
            : status === "BACKUP"
              ? "border-blue-200 bg-blue-50/10"
              : "",
      )}
    >
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
            <span>
              {match.matchTime ? (
                <>
                  Match starts at {fmt12(match.matchTime)}
                  {match.reportingTime && (
                    <span className="ml-2">
                      · Report by {fmt12(match.reportingTime)}
                    </span>
                  )}
                </>
              ) : match.reportingTime ? (
                <>Report by {fmt12(match.reportingTime)}</>
              ) : (
                "Time TBD"
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {match.location}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={status === "AVAILABLE" ? "default" : "outline"}
            className={cn(
              "h-12",
              status === "AVAILABLE" && "bg-green-600 hover:bg-green-700",
            )}
            onClick={() => handleUpdate("AVAILABLE")}
            disabled={isPending}
            size="lg"
          >
            <Check className="h-5 w-5" />
          </Button>
          <Button
            variant={status === "UNAVAILABLE" ? "default" : "outline"}
            className={cn(
              "h-12",
              status === "UNAVAILABLE" && "bg-red-600 hover:bg-red-700",
            )}
            onClick={() => handleUpdate("UNAVAILABLE")}
            disabled={isPending}
            size="lg"
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant={status === "BACKUP" ? "default" : "outline"}
            className={cn(
              "h-12",
              status === "BACKUP" && "bg-blue-600 hover:bg-blue-700",
            )}
            onClick={() => handleUpdate("BACKUP")}
            disabled={isPending}
            size="lg"
          >
            <UserPlus className="h-5 w-5" />
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
