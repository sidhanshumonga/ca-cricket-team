import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import { firestore, COLLECTIONS } from "@/lib/db";
import { queryDocs, getDocById, toDate } from "@/lib/firestore-helpers";

async function getTeamsData() {
  const activeSeasons = await queryDocs(
    COLLECTIONS.SEASONS,
    "isActive",
    "==",
    true,
  );
  if (activeSeasons.length === 0) return { matches: [], activeSeason: null };

  const activeSeason = activeSeasons[0];
  const allMatches = await queryDocs(
    COLLECTIONS.MATCHES,
    "seasonId",
    "==",
    activeSeason.id,
  );

  const now = new Date();
  const upcomingMatches = allMatches.filter((m: any) => toDate(m.date) >= now);

  // Enrich with team and availability data
  const matches = await Promise.all(
    upcomingMatches.map(async (match: any) => {
      const teamSelections = await queryDocs(
        COLLECTIONS.TEAM_SELECTIONS,
        "matchId",
        "==",
        match.id,
      );
      const availability = await queryDocs(
        COLLECTIONS.AVAILABILITY,
        "matchId",
        "==",
        match.id,
      );

      const team = await Promise.all(
        teamSelections.map(async (sel: any) => {
          const player = await getDocById(COLLECTIONS.PLAYERS, sel.playerId);
          return { ...sel, player };
        }),
      );

      const enrichedAvailability = await Promise.all(
        availability.map(async (avail: any) => {
          const player = await getDocById(COLLECTIONS.PLAYERS, avail.playerId);
          return { ...avail, player };
        }),
      );

      return { ...match, team, availability: enrichedAvailability };
    }),
  );

  return {
    matches: matches.sort(
      (a: any, b: any) => toDate(a.date).getTime() - toDate(b.date).getTime(),
    ),
    activeSeason,
  };
}

export default async function TeamsPage() {
  const { matches, activeSeason } = await getTeamsData();

  if (!activeSeason) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold md:text-2xl">Team Selection</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Season</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please create a season first before selecting teams.
            </p>
            <Link href="/admin/settings">
              <Button>Go to Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Team Selection</h1>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Upcoming Matches</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule matches to start selecting your playing XI.
            </p>
            <Link href="/admin/matches/new">
              <Button>Schedule Match</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {matches.map((match: any) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="text-lg">vs {match.opponent}</CardTitle>
                <CardDescription>
                  {toDate(match.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  • {match.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Availability Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        match.availability.filter(
                          (a: any) => a.status.toUpperCase() === "AVAILABLE",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Available
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        match.availability.filter(
                          (a: any) => a.status.toUpperCase() === "BACKUP",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Backup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {
                        match.availability.filter(
                          (a: any) => a.status.toUpperCase() === "UNAVAILABLE",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Unavailable
                    </div>
                  </div>
                </div>

                {/* Selected Team */}
                {match.team.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Selected Players ({match.team.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {match.team.map((selection: any) => (
                        <span
                          key={selection.id}
                          className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                        >
                          {selection.player.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No team selected yet
                  </p>
                )}
                <Link
                  href={`/admin/matches/${match.id}`}
                  className="mt-4 inline-block"
                >
                  <Button variant="outline" size="sm">
                    Select Team
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
