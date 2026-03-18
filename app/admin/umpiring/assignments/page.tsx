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
import { ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function UmpiringAssignmentsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { getUmpiringMatches } = await import("@/app/actions/umpiring");
      const result = await getUmpiringMatches();
      if (result.success) {
        setMatches(result.matches);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load assignments");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const assignedMatches = matches.filter(
    (m) => m.slot1Player || m.slot2Player
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/umpiring">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">
            All Umpiring Assignments
          </h1>
          <p className="text-sm text-muted-foreground">
            View all upcoming matches with assigned umpires
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Matches</CardTitle>
          <CardDescription>
            {assignedMatches.length} match{assignedMatches.length !== 1 ? "es" : ""} with at least one umpire assigned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedMatches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No assignments yet. Players can claim slots from their umpiring page.
            </div>
          ) : (
            <div className="space-y-4">
              {assignedMatches.map((match: any) => (
                <div
                  key={match.id}
                  className="flex items-start justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{match.matchName}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(match.date), "EEE, MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {match.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        Umpire 1
                      </p>
                      {match.slot1Player ? (
                        <Badge variant="default">
                          {match.slot1Player.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Open</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        Umpire 2
                      </p>
                      {match.slot2Player ? (
                        <Badge variant="default">
                          {match.slot2Player.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Open</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {matches.length > assignedMatches.length && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Matches</CardTitle>
            <CardDescription>
              {matches.length - assignedMatches.length} match{matches.length - assignedMatches.length !== 1 ? "es" : ""} with no umpires yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches
                  .filter((m) => !m.slot1Player && !m.slot2Player)
                  .map((match: any) => (
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
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
