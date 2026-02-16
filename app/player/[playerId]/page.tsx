import { getPlayer, getPlayerMatches } from "@/app/actions/availability";
import { AvailabilityCard } from "@/components/availability-card";
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

    if (!player) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Player Portal</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome, {player.name}
                </h1>
                <p className="text-muted-foreground">
                    Please mark your availability for the upcoming matches.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matches.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
                        <p className="text-center text-muted-foreground">
                            No upcoming matches found for the active season.
                        </p>
                    </div>
                ) : (
                    matches.map((match: any) => (
                        // @ts-ignore - types mismatch between prisma return and component prop, safe for now
                        <AvailabilityCard key={match.id} match={match} playerId={playerId} />
                    ))
                )}
            </div>

            <div className="flex justify-center pt-8">
                <Link href="/">
                    <Button variant="link" className="text-muted-foreground">
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
