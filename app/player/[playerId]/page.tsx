import { getPlayer, getPlayerMatches } from "@/app/actions/availability";
import { getActiveSeason, getSeasonAvailability } from "@/app/actions/season";
import { PlayerDashboardNew } from "./dashboard-new";
import { notFound } from "next/navigation";

export default async function PlayerDashboard({
  params,
}: {
  params: { playerId: string };
}) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);
  const { matches: allMatches, allPlayers } = await getPlayerMatches(playerId);
  const activeSeason = await getActiveSeason();
  const seasonAvailability = activeSeason
    ? await getSeasonAvailability(playerId, activeSeason.id)
    : null;

  if (!player) {
    notFound();
  }

  return (
    <PlayerDashboardNew
      player={player}
      allMatches={allMatches}
      allPlayers={allPlayers}
      activeSeason={activeSeason}
      seasonAvailability={seasonAvailability}
    />
  );
}
