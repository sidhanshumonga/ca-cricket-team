import { getPlayer } from "@/app/actions/availability";
import { PlayerProfileCard } from "@/components/player-profile-card";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Trophy } from "lucide-react";

export default async function PlayerProfilePage({
  params,
}: {
  params: { playerId: string };
}) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    notFound();
  }

  return (
    <div className="px-2 md:px-10 space-y-6">
      {/* Hero */}
      <div className="relative">
        <div className="h-32 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 px-2 -mt-16">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-background bg-muted shadow-sm">
            <User className="h-14 w-14 text-muted-foreground" />
            {player.jerseyNumber != null && (
              <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
                {player.jerseyNumber}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{player.name}</h1>
              {player.isCaptain && (
                <Badge className="gap-1">
                  <Trophy className="h-3 w-3" />
                  Captain
                </Badge>
              )}
              {player.isViceCaptain && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Vice Captain
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {player.role && <Badge variant="outline">{player.role}</Badge>}
              {player.secondaryRole && (
                <Badge variant="outline" className="text-muted-foreground">
                  {player.secondaryRole}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: "Batting", value: player.battingStyle },
          { label: "Bowling", value: player.bowlingStyle },
          { label: "Bat Position", value: player.battingPosition },
          { label: "Fielding", value: player.defaultFieldingPosition },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold">{value || "—"}</p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Editable preferences */}
      <PlayerProfileCard player={player} />
    </div>
  );
}
