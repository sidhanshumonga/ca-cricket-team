import { getPlayer, getPlayerMatches } from "@/app/actions/availability";
import { getActiveSeason, getSeasonAvailability } from "@/app/actions/season";
import { AvailabilityCard } from "@/components/availability-card";
import { SeasonAvailabilityCard } from "@/components/season-availability-card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlayerDashboard({
  params,
}: {
  params: { playerId: string };
}) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);
  const matches = await getPlayerMatches(playerId);
  const activeSeason = await getActiveSeason();
  const seasonAvailability = activeSeason
    ? await getSeasonAvailability(playerId, activeSeason.id)
    : null;

  if (!player) {
    notFound();
  }

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
              <p className="text-center text-muted-foreground">
                No upcoming matches found for the active season.
              </p>
            </div>
          ) : (
            matches.map((match: any) => (
              // @ts-ignore - types mismatch between prisma return and component prop, safe for now
              <AvailabilityCard
                key={match.id}
                match={match}
                playerId={playerId}
              />
            ))
          )}
        </div>

        <div className="flex justify-center pt-12 pb-4">
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
