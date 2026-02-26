"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Copy,
  Share2,
  Clock,
} from "lucide-react";
import { ScorecardActions } from "@/components/scorecard-actions";
import { EditMatchDialog } from "@/components/edit-match-dialog";
import { format } from "date-fns";
import { toast } from "sonner";

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function generateTeamText(match: any) {
  const playingXI = match.team.filter((t: any) => !t.isSubstitute);
  const subs = match.team.filter((t: any) => t.isSubstitute);

  let text = `🏏 *Team for ${match.opponent}*\n`;
  text += `📅 ${format(new Date(match.date), "EEEE, MMM d, yyyy 'at' h:mm a")}\n`;
  text += `📍 ${match.location}\n\n`;

  text += `*Playing XI:*\n`;
  playingXI.forEach((selection: any, index: number) => {
    text += `${index + 1}. ${selection.player.name}`;
    if (selection.player.isCaptain) text += " (C)";
    if (selection.player.isViceCaptain) text += " (VC)";
    text += `\n`;
  });

  if (subs.length > 0) {
    text += `\n*Substitutes:*\n`;
    subs.forEach((selection: any) => {
      text += `• ${selection.player.name}\n`;
    });
  }

  return text;
}

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [matchId, setMatchId] = useState<string>("");
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setMatchId(id);
      loadMatch(id);
    });
  }, [params]);

  const loadMatch = async (id: string) => {
    try {
      const { getMatchForTeamSelection } = await import("@/app/actions/team");
      const result = await getMatchForTeamSelection(id);

      if (!result.success || !result.match) {
        router.push("/admin/matches");
        return;
      }

      // Reconstruct match object with all needed data
      const matchData = {
        ...result.match,
        season: { name: result.match.date ? "Active Season" : "" },
        availability: result.availability || [],
        team: result.currentTeam || [],
      };

      setMatch(matchData);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load match details");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return null;
  }

  const availablePlayers = match.availability.filter(
    (a: any) => a.status.toUpperCase() === "AVAILABLE",
  );
  const unavailablePlayers = match.availability.filter(
    (a: any) => a.status.toUpperCase() === "UNAVAILABLE",
  );
  const backupPlayers = match.availability.filter(
    (a: any) => a.status.toUpperCase() === "BACKUP",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Link href="/admin/matches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">
            vs {match.opponent}
          </h1>
          <p className="text-sm text-muted-foreground">{match.season.name}</p>
        </div>
        <EditMatchDialog match={match} onUpdated={() => loadMatch(matchId)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(match.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{match.location}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Type:</span> {match.type}
            </div>
            {match.matchTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Match starts at {fmt12(match.matchTime)}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={
                  match.status?.toUpperCase() === "COMPLETED"
                    ? "text-green-600"
                    : "text-blue-600"
                }
              >
                {match.status}
              </span>
            </div>
            {match.status?.toUpperCase() === "COMPLETED" && (
              <div className="pt-4 mt-4 border-t">
                <ScorecardActions matchId={matchId} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability Summary</CardTitle>
            <CardDescription>
              {match.availability.length} players responded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Available</span>
              <span className="font-bold text-green-600">
                {availablePlayers.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Backup</span>
              <span className="font-bold text-blue-600">
                {backupPlayers.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Unavailable</span>
              <span className="font-bold text-red-600">
                {unavailablePlayers.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Players ({availablePlayers.length})</CardTitle>
          <CardDescription>
            Players who marked themselves available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availablePlayers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availablePlayers.map((availability: any) => (
                <div
                  key={availability.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-green-50 border-green-200"
                >
                  <span className="text-sm font-medium">
                    {availability.player.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {availability.player.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No players have marked themselves available yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Selected Team</CardTitle>
              <CardDescription>Playing XI for this match</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {match.team.length > 0 && (
                <>
                  <Link href={`/admin/matches/${match.id}/fielding`}>
                    <Button size="sm" variant="outline">
                      Fielding Positions
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const teamText = generateTeamText(match);
                      navigator.clipboard.writeText(teamText);
                      toast.success("Team copied to clipboard!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const teamText = generateTeamText(match);
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(teamText)}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Link href={`/admin/matches/${match.id}/select-team`}>
                <Button size="sm">
                  {match.team.length > 0 ? "Edit Team" : "Select Team"}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {match.team.length > 0 ? (
            <div className="space-y-2">
              {match.team.map((selection: any, index: number) => (
                <div
                  key={selection.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{selection.player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selection.player.role}
                        {selection.role && ` • ${selection.role}`}
                      </p>
                    </div>
                  </div>
                  {selection.isSubstitute && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Sub
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No team selected yet. Click "Select Team" above to choose your
                playing XI.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
