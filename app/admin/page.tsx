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
import { prisma } from "@/lib/db";
import { format } from "date-fns";

async function getDashboardData() {
  const [
    playerCount,
    activeSeason,
    upcomingMatches,
    seasonAvailability,
    leagueMatchesLeft,
  ] = await Promise.all([
    prisma.player.count(),
    prisma.season.findFirst({ where: { isActive: true } }),
    prisma.match.findMany({
      where: {
        date: { gte: new Date() },
        status: "Scheduled",
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.season.findFirst({
      where: { isActive: true },
      include: {
        seasonAvailability: true,
        _count: {
          select: { seasonAvailability: true },
        },
      },
    }),
    prisma.match.count({
      where: {
        date: { gte: new Date() },
        status: "Scheduled",
        type: "League",
      },
    }),
  ]);

  return {
    playerCount,
    activeSeason,
    upcomingMatches,
    seasonAvailability,
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

  const nextMatch = upcomingMatches[0];

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
                  {format(new Date(nextMatch.date), "MMM d")}
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
                          {format(new Date(match.date), "MMM")}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {format(new Date(match.date), "d")}
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
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for team management.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link
              href="/admin/players"
              className="flex items-center gap-4 rounded-md border p-4 hover:bg-muted/50 transition-colors"
            >
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Manage Roster</p>
                <p className="text-xs text-muted-foreground">
                  Add or edit players
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/matches"
              className="flex items-center gap-4 rounded-md border p-4 hover:bg-muted/50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Manage Matches</p>
                <p className="text-xs text-muted-foreground">
                  Schedule & select teams
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
