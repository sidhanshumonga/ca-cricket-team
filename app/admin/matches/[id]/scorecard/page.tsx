import { getDocById, toDate } from "@/lib/firestore-helpers";
import { COLLECTIONS } from "@/lib/db";
import { Scorecard } from "@/components/scorecard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getScorecard } from "@/app/actions/scorecard";

export default async function ScorecardPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const match = await getDocById(COLLECTIONS.MATCHES, id);

  if (!match) {
    notFound();
  }

  // Fetch real scorecard data from database
  const scorecardResult = await getScorecard(id);

  if (!scorecardResult.success || !scorecardResult.scorecard) {
    // No scorecard data yet
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/matches/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Match
            </Button>
          </Link>
          <h1 className="text-lg font-semibold md:text-2xl">Match Scorecard</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scorecard Data</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scorecard data hasn't been populated yet for this match.
            </p>
            <Link href={`/admin/matches/${id}`}>
              <Button>Go Back to Populate Scorecard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform database data to scorecard format
  const scorecardData = {
    matchDetails: {
      opponent: (scorecardResult.scorecard as any).opponent || match.opponent,
      date:
        (scorecardResult.scorecard as any).matchDate ||
        format(toDate(match.date), "MMMM d, yyyy"),
      location: (scorecardResult.scorecard as any).location || match.location,
      result: (scorecardResult.scorecard as any).result || "TBD",
      resultMargin: (scorecardResult.scorecard as any).resultMargin || "",
      manOfMatch: (scorecardResult.scorecard as any).manOfMatch || undefined,
    },
    ourInnings: {
      score: scorecardResult.scorecard.ourScore || 0,
      wickets: scorecardResult.scorecard.ourWickets || 0,
      overs: scorecardResult.scorecard.ourOvers || 0,
      batting:
        scorecardResult.batting?.map((perf: any) => ({
          playerName: perf.playerName || "Unknown Player",
          runs: perf.runs || 0,
          ballsFaced: perf.ballsFaced || 0,
          fours: perf.fours || 0,
          sixes: perf.sixes || 0,
          strikeRate: perf.strikeRate || 0,
          howOut: perf.howOut || "not out",
          bowlerName: perf.bowlerName,
          fielderName: perf.fielderName,
        })) || [],
    },
    opponentInnings: {
      score: scorecardResult.scorecard.opponentScore || 0,
      wickets: scorecardResult.scorecard.opponentWickets || 0,
      overs: scorecardResult.scorecard.opponentOvers || 0,
      batting:
        scorecardResult.opponentBatting?.map((perf: any) => ({
          playerName: perf.playerName || "Unknown Player",
          runs: perf.runs || 0,
          ballsFaced: perf.ballsFaced || 0,
          fours: perf.fours || 0,
          sixes: perf.sixes || 0,
          strikeRate: perf.strikeRate || 0,
          howOut: perf.howOut || "not out",
          bowlerName: perf.bowlerName,
          fielderName: perf.fielderName,
        })) || [],
      bowling:
        scorecardResult.opponentBowling?.map((perf: any) => ({
          playerName: perf.playerName || "Unknown Player",
          overs: perf.overs || 0,
          maidens: perf.maidens || 0,
          runs: perf.runs || 0,
          wickets: perf.wickets || 0,
          economy: perf.economy || 0,
        })) || [],
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/admin/matches/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Match
        </Button>
      </Link>
      <h1 className="text-lg font-semibold md:text-2xl">Match Scorecard</h1>

      <Scorecard
        matchDetails={scorecardData.matchDetails}
        ourInnings={scorecardData.ourInnings}
        opponentInnings={scorecardData.opponentInnings}
      />
    </div>
  );
}
