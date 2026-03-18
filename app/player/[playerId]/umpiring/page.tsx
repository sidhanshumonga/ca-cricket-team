"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PlayerUmpiringPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const [playerId, setPlayerId] = useState<string>("");
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ playerId: id }) => {
      setPlayerId(id);
      loadAssignments(id);
    });
  }, [params]);

  const loadAssignments = async (id: string) => {
    try {
      const { getPlayerUmpiringAssignments } =
        await import("@/app/actions/umpiring");
      const result = await getPlayerUmpiringAssignments(id);
      if (result.success) {
        setMyAssignments(result.myAssignments);
        setAvailableSlots(result.availableSlots);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load umpiring assignments");
      setLoading(false);
    }
  };

  const handleClaimSlot = async (matchId: string, slotNumber: 1 | 2) => {
    const { claimUmpiringSlot } = await import("@/app/actions/umpiring");
    const result = await claimUmpiringSlot(matchId, playerId, slotNumber);

    if (result.success) {
      toast.success("Slot claimed successfully!");
      await loadAssignments(playerId);
    } else {
      toast.error(result.error || "Failed to claim slot");
    }
  };

  const handleReleaseSlot = async (matchId: string) => {
    if (!confirm("Release this umpiring assignment?")) return;

    const { releaseUmpiringSlot } = await import("@/app/actions/umpiring");
    const result = await releaseUmpiringSlot(matchId, playerId);

    if (result.success) {
      toast.success("Slot released");
      await loadAssignments(playerId);
    } else {
      toast.error(result.error || "Failed to release slot");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Umpiring Assignments
        </h1>
        <p className="text-muted-foreground">
          Claim umpiring slots for upcoming matches
        </p>
      </div>

      {/* My Assignments */}
      {myAssignments.length > 0 && (
        <Card className="border-0">
          <CardHeader>
            <CardTitle>My Assignments</CardTitle>
            <CardDescription>
              {myAssignments.length} upcoming assignment
              {myAssignments.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile: Card layout */}
            <div className="md:hidden space-y-3">
              {myAssignments.map((match: any) => {
                const mySlot = match.slot1PlayerId === playerId ? 1 : 2;
                return (
                  <div
                    key={match.id}
                    className="p-4 rounded-lg border bg-green-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="font-medium truncate">
                          {match.matchName}
                        </span>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        Umpire {mySlot}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {format(new Date(match.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{match.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{match.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReleaseSlot(match.id)}
                      className="w-full"
                    >
                      Release Assignment
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>My Slot</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAssignments.map((match: any) => {
                    const mySlot = match.slot1PlayerId === playerId ? 1 : 2;
                    return (
                      <TableRow key={match.id} className="bg-green-50/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            {match.matchName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(match.date), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {match.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {match.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Umpire {mySlot}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReleaseSlot(match.id)}
                          >
                            Release
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Slots */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle>Available Slots</CardTitle>
          <CardDescription>
            {availableSlots.length > 0
              ? `${availableSlots.length} match${availableSlots.length !== 1 ? "es" : ""} with open slots`
              : "No available slots at the moment"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableSlots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No available umpiring slots at the moment.
            </div>
          ) : (
            <>
              {/* Mobile: Card layout */}
              <div className="md:hidden space-y-3">
                {availableSlots.map((match: any) => {
                  const slot1Available = !match.slot1PlayerId;
                  const slot2Available = !match.slot2PlayerId;
                  const alreadyClaimed =
                    match.slot1PlayerId === playerId ||
                    match.slot2PlayerId === playerId;

                  return (
                    <div
                      key={match.id}
                      className="p-4 rounded-lg border space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium flex-1">
                          {match.matchName}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          {slot1Available && (
                            <Badge variant="outline">Slot 1</Badge>
                          )}
                          {slot2Available && (
                            <Badge variant="outline">Slot 2</Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {format(new Date(match.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{match.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{match.location}</span>
                        </div>
                      </div>
                      {!alreadyClaimed && (
                        <div className="flex gap-2">
                          {slot1Available && (
                            <Button
                              size="sm"
                              onClick={() => handleClaimSlot(match.id, 1)}
                              className="flex-1"
                            >
                              Claim Slot 1
                            </Button>
                          )}
                          {slot2Available && (
                            <Button
                              size="sm"
                              onClick={() => handleClaimSlot(match.id, 2)}
                              className="flex-1"
                            >
                              Claim Slot 2
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Match</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Available Slots</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableSlots.map((match: any) => {
                      const slot1Available = !match.slot1PlayerId;
                      const slot2Available = !match.slot2PlayerId;
                      const alreadyClaimed =
                        match.slot1PlayerId === playerId ||
                        match.slot2PlayerId === playerId;

                      return (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">
                            {match.matchName}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(match.date), "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {match.time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {match.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {slot1Available && (
                                <Badge variant="outline">Slot 1</Badge>
                              )}
                              {slot2Available && (
                                <Badge variant="outline">Slot 2</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {!alreadyClaimed && (
                              <div className="flex gap-2 justify-end">
                                {slot1Available && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleClaimSlot(match.id, 1)}
                                  >
                                    Claim Slot 1
                                  </Button>
                                )}
                                {slot2Available && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleClaimSlot(match.id, 2)}
                                  >
                                    Claim Slot 2
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
