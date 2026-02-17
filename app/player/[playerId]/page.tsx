import { getPlayer, getPlayerMatches } from "@/app/actions/availability";
import { getActiveSeason, getSeasonAvailability } from "@/app/actions/season";
import { AvailabilityCard } from "@/components/availability-card";
import { SeasonAvailabilityCard } from "@/components/season-availability-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { toDate } from "@/lib/firestore-helpers";

export default async function PlayerDashboard({
  params,
}: {
  params: { playerId: string };
}) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);
  const allMatches = await getPlayerMatches(playerId);
  const activeSeason = await getActiveSeason();
  const seasonAvailability = activeSeason
    ? await getSeasonAvailability(playerId, activeSeason.id)
    : null;

  if (!player) {
    notFound();
  }

  // Separate upcoming and completed matches
  const upcomingMatches = allMatches.filter(
    (m: any) => m.status !== "Completed",
  );
  const completedMatches = allMatches
    .filter((m: any) => m.status === "Completed")
    .slice(0, 5); // Show last 5 completed matches

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {player.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            Please mark your availability for the upcoming matches.
          </p>
        </div>

        {activeSeason && (
          <SeasonAvailabilityCard
            playerId={playerId}
            season={activeSeason}
            initialAvailability={seasonAvailability}
          />
        )}

        {/* Upcoming Matches - Availability Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-center text-muted-foreground">
                  No upcoming matches found for the active season.
                </p>
              </div>
            ) : (
              upcomingMatches.map((match: any) => (
                <AvailabilityCard
                  key={match.id}
                  match={match}
                  playerId={playerId}
                />
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
                <Link
                  key={match.id}
                  href={`/team/matches/${match.id}/scorecard`}
                >
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
                                {format(toDate(match.date), "MMM d, yyyy")}
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

        <div className="flex justify-center pt-8 pb-4">
          <Link href="/">
            <Button variant="link" className="text-muted-foreground">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
