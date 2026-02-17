import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, Plus, ArrowRight, ChevronRight } from "lucide-react";
import { firestore, COLLECTIONS } from "@/lib/db";
import { countDocs, queryDocs, toDate } from "@/lib/firestore-helpers";
import { format } from "date-fns";

// Disable caching to always fetch fresh data
export const revalidate = 0;

async function getDashboardData() {
  const playerCount = await countDocs(COLLECTIONS.PLAYERS);
  const activeSeasons = await queryDocs(
    COLLECTIONS.SEASONS,
    "isActive",
    "==",
    true,
  );
  const activeSeason = activeSeasons.length > 0 ? activeSeasons[0] : null;

  const allMatches = await firestore.collection(COLLECTIONS.MATCHES).get();
  const matches = allMatches.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const now = new Date();
  const upcomingMatches = matches
    .filter((m: any) => toDate(m.date) >= now && m.status === "Scheduled")
    .sort(
      (a: any, b: any) => toDate(a.date).getTime() - toDate(b.date).getTime(),
    )
    .slice(0, 5);

  const leagueMatchesLeft = matches.filter(
    (m: any) =>
      toDate(m.date) >= now && m.status === "Scheduled" && m.type === "League",
  ).length;

  const seasonAvailabilityDocs = activeSeason
    ? await queryDocs(
        COLLECTIONS.SEASON_AVAILABILITY,
        "seasonId",
        "==",
        activeSeason.id,
      )
    : [];

  return {
    playerCount,
    activeSeason,
    upcomingMatches,
    seasonAvailability: activeSeason
      ? { _count: { seasonAvailability: seasonAvailabilityDocs.length } }
      : null,
    leagueMatchesLeft,
  };
}

export default async function AdminDashboard() {
  const {
    playerCount,
    activeSeason,
    upcomingMatches,
    seasonAvailability,
    leagueMatchesLeft,
  } = await getDashboardData();

  const availabilityRate =
    seasonAvailability && playerCount > 0
      ? Math.round(
          (seasonAvailability._count.seasonAvailability / playerCount) * 100,
        )
      : 0;

  const nextMatch = upcomingMatches[0] as any;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/admin/matches/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions - Mobile Only (Top) */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <Link
          href="/admin/players"
          className="flex items-center gap-2 rounded-md border p-3 hover:bg-muted/50 transition-colors"
        >
          <Users className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">Roster</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          href="/admin/matches"
          className="flex items-center gap-2 rounded-md border p-3 hover:bg-muted/50 transition-colors"
        >
          <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">Matches</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerCount}</div>
            <p className="text-xs text-muted-foreground">Active in squad</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Match
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextMatch ? (
              <>
                <div className="text-2xl font-bold">
                  {format(toDate(nextMatch.date), "MMM d")}
                </div>
                <p className="text-xs text-muted-foreground">
                  vs {nextMatch.opponent}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  No matches scheduled
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availabilityRate}%</div>
            <p className="text-xs text-muted-foreground">
              {seasonAvailability?._count.seasonAvailability || 0} of{" "}
              {playerCount} responded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches Left</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leagueMatchesLeft}</div>
            <p className="text-xs text-muted-foreground">League matches</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Your team's next few matches.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match: any) => (
                  <Link
                    key={match.id}
                    href={`/admin/matches/${match.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          {format(toDate(match.date), "MMM")}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {format(toDate(match.date), "d")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">vs {match.opponent}</p>
                        <p className="text-sm text-muted-foreground">
                          {match.location} • {match.type}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg border-dashed border">
                <Calendar className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No matches found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by adding your match schedule.
                </p>
                <Link href="/admin/matches/new">
                  <Button variant="outline">Schedule Match</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="hidden lg:block lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for team management.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/players"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-0.5">Manage Roster</p>
                <p className="text-xs text-muted-foreground">
                  Add or edit players
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
            <Link
              href="/admin/matches"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-0.5">Manage Matches</p>
                <p className="text-xs text-muted-foreground">
                  Schedule & select teams
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
