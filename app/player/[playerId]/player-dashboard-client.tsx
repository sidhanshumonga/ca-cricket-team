"use client";

import { AvailabilityCard } from "@/components/availability-card";
import { SeasonAvailabilityCard } from "@/components/season-availability-card";
import { SquadAvailabilitySheet } from "@/components/squad-availability-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Trophy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Player } from "@/lib/types/models";

interface PlayerDashboardClientProps {
  player: Player;
  allMatches: any[];
  allPlayers: any[];
  activeSeason: any;
  seasonAvailability: any;
}

export function PlayerDashboardClient({
  player,
  allMatches,
  allPlayers,
  activeSeason,
  seasonAvailability,
}: PlayerDashboardClientProps) {
  // Separate upcoming and completed matches
  const upcomingMatches = allMatches.filter(
    (m: any) => m.status !== "Completed",
  );
  const completedMatches = allMatches
    .filter((m: any) => m.status === "Completed")
    .slice(0, 5);

  // Next match context banner
  const nextMatch = upcomingMatches[0] ?? null;
  const nextMatchAvailability = nextMatch?.myAvailability ?? null;
  const nextMatchDate = nextMatch ? new Date(nextMatch.date) : null;

  const ContextBanner = () => {
    if (!nextMatch) return null;
    const dateStr = format(nextMatchDate!, "EEEE, MMM d");
    const markedYes =
      nextMatchAvailability?.status === "AVAILABLE" ||
      nextMatchAvailability?.status === "BACKUP";
    if (!markedYes) {
      return (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-amber-800 dark:text-amber-300 leading-snug">
              Mark your availability for the next match
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5 truncate">
              vs {nextMatch.opponent} · {dateStr}
            </p>
          </div>
        </div>
      );
    }
    const isBackup = nextMatchAvailability.status === "BACKUP";
    return (
      <div
        className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${isBackup ? "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800" : "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800"}`}
      >
        <CheckCircle2
          className={`h-4 w-4 mt-0.5 shrink-0 ${isBackup ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400"}`}
        />
        <div className="min-w-0">
          <p
            className={`font-medium leading-snug ${isBackup ? "text-blue-800 dark:text-blue-300" : "text-green-800 dark:text-green-300"}`}
          >
            Upcoming match on {dateStr}
          </p>
          <p
            className={`mt-0.5 truncate ${isBackup ? "text-blue-700 dark:text-blue-400" : "text-green-700 dark:text-green-400"}`}
          >
            vs {nextMatch.opponent} · You're marked as{" "}
            <span className="font-medium">
              {isBackup ? "backup" : "available"}
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {player.name}
        </h1>
      </div>

      {activeSeason && (
        <SeasonAvailabilityCard
          playerId={player.id}
          season={activeSeason}
          initialAvailability={seasonAvailability}
        />
      )}

      <ContextBanner />

      {/* Upcoming Matches - Availability Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingMatches.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
              <p className="text-center text-muted-foreground">
                No upcoming matches found for active season.
              </p>
            </div>
          ) : (
            upcomingMatches.map((match: any) => (
              <div key={match.id} className="flex flex-col gap-2">
                <AvailabilityCard match={match} playerId={player.id} />
                <SquadAvailabilitySheet
                  availability={match.matchAvailability || []}
                  allPlayers={allPlayers}
                  match={{ opponent: match.opponent, date: match.date }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Matches Section */}
      {completedMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Matches</h2>
            <Link href="/team/matches">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {completedMatches.map((match: any) => (
              <Link key={match.id} href={`/team/matches/${match.id}/scorecard`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            vs {match.opponent}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {match.type}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(match.date), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{match.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
