import { getDocById, queryDocs, toDate } from "@/lib/firestore-helpers";
import { COLLECTIONS } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

async function getCompletedMatches() {
  const activeSeasons = await queryDocs(
    COLLECTIONS.SEASONS,
    "isActive",
    "==",
    true,
  );
  
  if (activeSeasons.length === 0) return [];

  const matches = await queryDocs(
    COLLECTIONS.MATCHES,
    "seasonId",
    "==",
    activeSeasons[0].id,
  );

  const completedMatches = matches
    .filter((m: any) => m.status === "Completed")
    .sort((a: any, b: any) => {
      const dateA = toDate(a.date);
      const dateB = toDate(b.date);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

  return completedMatches;
}

export default async function TeamMatchesPage() {
  const matches = await getCompletedMatches();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Results</h1>
          <p className="text-muted-foreground text-lg mt-2">
            View scorecards and results from previous matches
          </p>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No completed matches yet. Check back after the season starts!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match: any) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">vs {match.opponent}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {match.type}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {format(toDate(match.date), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{match.location}</span>
                  </div>
                  <Link href={`/team/matches/${match.id}/scorecard`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Scorecard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-8">
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
