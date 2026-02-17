import { getMatches } from "@/app/actions/match";
import { DeleteMatchButton } from "@/components/delete-match-button";
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
import { format } from "date-fns";
import { Plus, MapPin, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { firestore, COLLECTIONS } from "@/lib/db";
import { queryDocs, getDocById, toDate } from "@/lib/firestore-helpers";

async function getMatchesWithDetails() {
  const activeSeasons = await queryDocs(
    COLLECTIONS.SEASONS,
    "isActive",
    "==",
    true,
  );
  if (activeSeasons.length === 0) return [];

  const activeSeason = activeSeasons[0];
  const matches = await queryDocs(
    COLLECTIONS.MATCHES,
    "seasonId",
    "==",
    activeSeason.id,
  );

  // Enrich with team and availability data
  const enrichedMatches = await Promise.all(
    matches.map(async (match: any) => {
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

  return enrichedMatches.sort(
    (a: any, b: any) => toDate(a.date).getTime() - toDate(b.date).getTime(),
  );
}

export default async function MatchesPage() {
  const allMatches = await getMatchesWithDetails();

  // Separate upcoming and completed matches
  const now = new Date();
  const upcomingMatches = allMatches.filter(
    (m: any) => m.status !== "Completed" && toDate(m.date) >= now,
  );
  const completedMatches = allMatches.filter(
    (m: any) => m.status === "Completed",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Match Schedule</h1>
        <Link href="/admin/matches/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Match
          </Button>
        </Link>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4">
        {upcomingMatches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              No upcoming matches scheduled. Add your first match.
            </CardContent>
          </Card>
        ) : (
          upcomingMatches.map((match: any) => (
            <Card key={match.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      vs {match.opponent}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{match.type}</Badge>
                      <Badge
                        variant={
                          match.status === "Completed" ? "secondary" : "default"
                        }
                      >
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(toDate(match.date), "EEEE, MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{format(toDate(match.date), "h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{match.location}</span>
                  </div>
                </div>

                {/* Availability Stats */}
                <div className="grid grid-cols-3 gap-2 p-2 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
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
                    <div className="text-xl font-bold text-blue-600">
                      {
                        match.availability.filter(
                          (a: any) => a.status.toUpperCase() === "BACKUP",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Backup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
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
                {match.team.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      Team Selected ({match.team.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {match.team.slice(0, 5).map((selection: any) => (
                        <span
                          key={selection.id}
                          className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                        >
                          {selection.player.name}
                        </span>
                      ))}
                      {match.team.length > 5 && (
                        <span className="px-2 py-0.5 text-xs text-muted-foreground">
                          +{match.team.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Link href={`/admin/matches/${match.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/admin/matches/${match.id}`} className="flex-1">
                    <Button
                      variant={match.team.length > 0 ? "secondary" : "default"}
                      size="sm"
                      className="w-full"
                    >
                      {match.team.length > 0 ? "View Team" : "Select Team"}
                    </Button>
                  </Link>
                  <DeleteMatchButton id={match.id} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Upcoming Matches</CardTitle>
          <CardDescription>Manage your team's match schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingMatches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No upcoming matches scheduled. Add your first match.
                  </TableCell>
                </TableRow>
              ) : (
                upcomingMatches.map((match: any) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(toDate(match.date), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {format(toDate(match.date), "h:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {match.opponent}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {match.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{match.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          match.status === "Completed" ? "secondary" : "default"
                        }
                      >
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/matches/${match.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/admin/matches/${match.id}`}>
                          <Button
                            variant={
                              match.team.length > 0 ? "outline" : "default"
                            }
                            size="sm"
                            className="text-xs h-7 px-2.5"
                          >
                            {match.team.length > 0
                              ? "View Team"
                              : "Select Team"}
                          </Button>
                        </Link>
                        <DeleteMatchButton id={match.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Completed Matches Section */}
      {completedMatches.length > 0 && (
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Completed Matches</CardTitle>
            <CardDescription>
              View past match results and scorecards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedMatches.map((match: any) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(toDate(match.date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {match.opponent}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {match.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{match.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/matches/${match.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/admin/matches/${match.id}/scorecard`}>
                          <Button variant="outline" size="sm">
                            Scorecard
                          </Button>
                        </Link>
                        <DeleteMatchButton id={match.id} />
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
