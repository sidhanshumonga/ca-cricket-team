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
import { prisma } from "@/lib/db";

async function getTeamsData() {
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
  });

  if (!activeSeason) return { matches: [], activeSeason: null };

  const matches = await prisma.match.findMany({
    where: {
      seasonId: activeSeason.id,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    include: {
      team: {
        include: {
          player: true,
        },
      },
      availability: {
        include: {
          player: true,
        },
      },
    },
  });

  return { matches, activeSeason };
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
                  {new Date(match.date).toLocaleDateString("en-US", {
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
                    <div className="text-2xl font-bold text-yellow-600">
                      {
                        match.availability.filter(
                          (a: any) => a.status.toUpperCase() === "MAYBE",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Maybe</div>
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
