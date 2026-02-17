import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Trophy, Shield, CheckCircle2, Info } from "lucide-react";
import { getActiveSeason } from "./actions/season";
import { getCompletedMatches } from "./actions/match";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toDate } from "@/lib/firestore-helpers";

export default async function Home() {
  const activeSeason = await getActiveSeason();
  const completedMatches = await getCompletedMatches(5);

  // Get upcoming matches to determine what action to show
  const { getMatches } = await import("./actions/match");
  const allMatches = activeSeason ? await getMatches(activeSeason.id) : [];
  const upcomingMatches = allMatches.filter(
    (m: any) => toDate(m.date) > new Date() && m.status !== "Completed",
  );
  const nextMatch = upcomingMatches[0];

  const seasonStarted =
    activeSeason && new Date() >= toDate(activeSeason.startDate);

  // Determine what availability action to show
  const now = new Date();
  const daysUntilSeasonStart = activeSeason
    ? Math.ceil(
        (toDate(activeSeason.startDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const daysUntilNextMatch = nextMatch
    ? Math.ceil(
        (toDate(nextMatch.date).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : Infinity;

  const showSeasonAvailability = daysUntilSeasonStart > 10;
  const showMatchAvailability = daysUntilNextMatch <= 7;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-xl font-bold block">Cary Avengers</span>
              <span className="text-xs text-gray-600">Division 8</span>
            </div>
          </div>
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {activeSeason ? (
          <>
            <Card className="mb-6 border-2 border-primary/20">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {activeSeason.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {format(toDate(activeSeason.startDate), "MMM d, yyyy")} -{" "}
                      {format(toDate(activeSeason.endDate), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium self-start ${
                      seasonStarted
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {seasonStarted ? "In Progress" : "Upcoming"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  {showSeasonAvailability && !seasonStarted ? (
                    <>
                      <p className="text-sm font-medium mb-2">
                        Season starts in {daysUntilSeasonStart} days
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Players can now mark their availability for the season
                      </p>
                    </>
                  ) : showMatchAvailability && nextMatch ? (
                    <>
                      <p className="text-sm font-medium mb-2">
                        Next match in {daysUntilNextMatch} days
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">
                          vs {nextMatch.opponent}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {format(
                          toDate(nextMatch.date),
                          "EEEE, MMM d 'at' h:mm a",
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium mb-2">
                        Season in progress
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        View upcoming matches and mark your availability
                      </p>
                    </>
                  )}
                  <Link href="/player">
                    <Button className="w-full">Player Portal</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5" />
                  League Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">14</p>
                    <p className="text-xs text-gray-600">Teams</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-gray-600">League Games</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">Top 6</p>
                    <p className="text-xs text-gray-600">Playoffs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">4</p>
                    <p className="text-xs text-gray-600">Min. Games*</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">
                    Playoff Schedule
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">QF</Badge>
                        <span>Quarter Finals</span>
                      </div>
                      <span className="text-gray-600">Jun 27, 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">SF</Badge>
                        <span>Semi Finals</span>
                      </div>
                      <span className="text-gray-600">Jul 11, 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">F</Badge>
                        <span>Finals</span>
                      </div>
                      <span className="text-gray-600">Jul 18, 2026</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    * Players must play at least 4 league matches to be eligible
                    for playoffs
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Playoff matches have backup day (next day). League games
                    split points on washout.
                  </p>
                </div>
              </CardContent>
            </Card>

            {completedMatches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Recent Matches
                  </h2>
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
                              <p className="font-semibold text-lg">
                                vs {match.opponent}
                              </p>
                              <p className="text-sm text-gray-600">
                                {match.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {format(toDate(match.date), "MMM d")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {match.type}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-3">
                Cricket Season Coming Soon!
              </h1>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                The new season is just around the corner. Stay tuned for the
                schedule announcement and get ready to mark your availability!
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Admin can set up the season from the admin panel
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
