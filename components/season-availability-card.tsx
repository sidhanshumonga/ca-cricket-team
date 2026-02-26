"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, X, UserPlus, Edit2 } from "lucide-react";
import { markSeasonAvailability } from "@/app/actions/season";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SeasonAvailabilityCardProps {
  playerId: string;
  season: any;
  initialAvailability: any;
}

export function SeasonAvailabilityCard({
  playerId,
  season,
  initialAvailability,
}: SeasonAvailabilityCardProps) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [isEditing, setIsEditing] = useState(!initialAvailability);
  const [status, setStatus] = useState(initialAvailability?.status || "");
  const [notes, setNotes] = useState(initialAvailability?.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (newStatus: string) => {
    setLoading(true);
    try {
      await markSeasonAvailability(
        playerId,
        season.id,
        newStatus,
        undefined,
        notes,
      );
      setAvailability({ status: newStatus, notes });
      setStatus(newStatus);
      setIsEditing(false);
      toast.success("Season availability updated!");
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (currentStatus: string) => {
    const statusConfig = {
      AVAILABLE: {
        label: "Available",
        variant: "default" as const,
        className: "bg-green-600",
      },
      BACKUP: {
        label: "Backup",
        variant: "secondary" as const,
        className: "bg-blue-600 text-white",
      },
      UNAVAILABLE: {
        label: "Unavailable",
        variant: "destructive" as const,
        className: "",
      },
    };

    const config = statusConfig[currentStatus as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Season Availability — {season.name}
          </p>
          {availability && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setStatus(availability.status);
                setNotes(availability.notes || "");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={status === "AVAILABLE" ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1",
              status === "AVAILABLE" && "bg-green-600 hover:bg-green-700",
            )}
            onClick={() => handleSubmit("AVAILABLE")}
            disabled={loading}
          >
            <Check className="h-4 w-4" /> Available
          </Button>
          <Button
            variant={status === "BACKUP" ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1",
              status === "BACKUP" && "bg-blue-600 hover:bg-blue-700",
            )}
            onClick={() => handleSubmit("BACKUP")}
            disabled={loading}
          >
            <UserPlus className="h-4 w-4" /> Backup
          </Button>
          <Button
            variant={status === "UNAVAILABLE" ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1",
              status === "UNAVAILABLE" && "bg-red-600 hover:bg-red-700",
            )}
            onClick={() => handleSubmit("UNAVAILABLE")}
            disabled={loading}
          >
            <X className="h-4 w-4" /> Out
          </Button>
        </div>
        <Textarea
          placeholder="Add a note (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="text-sm resize-none"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-4 py-2.5 text-sm">
      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-1 min-w-0 items-center gap-2 flex-wrap">
        <span className="text-muted-foreground truncate">{season.name}:</span>
        {availability ? (
          getStatusBadge(availability.status)
        ) : (
          <Badge variant="outline">Not marked</Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="h-7 gap-1 text-xs shrink-0"
      >
        <Edit2 className="h-3 w-3" />
        {availability ? "Change" : "Mark"}
      </Button>
    </div>
  );
}
