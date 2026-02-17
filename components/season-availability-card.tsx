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

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Season Availability
          </CardTitle>
          {availability && !isEditing ? (
            <div className="flex items-center gap-2">
              {getStatusBadge(availability.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Change
              </Button>
            </div>
          ) : (
            <Badge variant="outline">Not Marked</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mark your availability for {season.name}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={status === "AVAILABLE" ? "default" : "outline"}
                className={cn(
                  "h-16 flex flex-col gap-1",
                  status === "AVAILABLE" && "bg-green-600 hover:bg-green-700",
                )}
                onClick={() => handleSubmit("AVAILABLE")}
                disabled={loading}
              >
                <Check className="h-5 w-5" />
                <span className="text-xs">Available</span>
              </Button>
              <Button
                variant={status === "BACKUP" ? "default" : "outline"}
                className={cn(
                  "h-16 flex flex-col gap-1",
                  status === "BACKUP" && "bg-blue-600 hover:bg-blue-700",
                )}
                onClick={() => handleSubmit("BACKUP")}
                disabled={loading}
              >
                <UserPlus className="h-5 w-5" />
                <span className="text-xs">Backup</span>
              </Button>
              <Button
                variant={status === "UNAVAILABLE" ? "default" : "outline"}
                className={cn(
                  "h-16 flex flex-col gap-1",
                  status === "UNAVAILABLE" && "bg-red-600 hover:bg-red-700",
                )}
                onClick={() => handleSubmit("UNAVAILABLE")}
                disabled={loading}
              >
                <X className="h-5 w-5" />
                <span className="text-xs">Unavailable</span>
              </Button>
            </div>
            <Textarea
              placeholder="Add a note (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
            {availability && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setStatus(availability.status);
                  setNotes(availability.notes || "");
                }}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium">Season:</span> {season.name}
            </p>
            {availability.notes && (
              <p className="text-muted-foreground">
                <span className="font-medium">Note:</span> {availability.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
