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

async function getScorecardData(match: any, matchId: string) {
  const scorecardResult = await getScorecard(matchId);

  if (!scorecardResult.success || !scorecardResult.scorecard) {
    return null;
  }

  return {
    matchDetails: {
      opponent: match.opponent,
      date: format(toDate(match.date), "MMMM d, yyyy"),
      location: match.location,
      result: scorecardResult.scorecard.result || "TBD",
      resultMargin: scorecardResult.scorecard.resultMargin || "",
    },
    ourInnings: {
      score: scorecardResult.scorecard.ourScore || 0,
      wickets: scorecardResult.scorecard.ourWickets || 0,
      overs: scorecardResult.scorecard.ourOvers || 0,
      batting: [
        {
          playerName: "John Smith",
          runs: 45,
          ballsFaced: 32,
          fours: 4,
          sixes: 2,
          strikeRate: 140.6,
          howOut: "caught",
          bowlerName: "M. Johnson",
          fielderName: "D. Warner",
        },
        {
          playerName: "Mike Davis",
          runs: 38,
          ballsFaced: 28,
          fours: 5,
          sixes: 1,
          strikeRate: 135.7,
          howOut: "bowled",
          bowlerName: "S. Smith",
        },
        {
          playerName: "Tom Wilson",
          runs: 52,
          ballsFaced: 35,
          fours: 6,
          sixes: 2,
          strikeRate: 148.6,
          howOut: "not out",
        },
        {
          playerName: "Chris Brown",
          runs: 28,
          ballsFaced: 22,
          fours: 3,
          sixes: 1,
          strikeRate: 127.3,
          howOut: "run out",
          fielderName: "A. Cook",
        },
        {
          playerName: "David Lee",
          runs: 15,
          ballsFaced: 12,
          fours: 2,
          sixes: 0,
          strikeRate: 125.0,
          howOut: "lbw",
          bowlerName: "J. Anderson",
        },
      ],
    },
    opponentInnings: {
      score: 182,
      wickets: 8,
      overs: 20,
      bowling: [
        {
          playerName: "Tom Wilson",
          overs: 4,
          maidens: 0,
          runs: 32,
          wickets: 2,
          economy: 8.0,
        },
        {
          playerName: "Chris Brown",
          overs: 4,
          maidens: 1,
          runs: 28,
          wickets: 3,
          economy: 7.0,
        },
        {
          playerName: "Mike Davis",
          overs: 4,
          maidens: 0,
          runs: 38,
          wickets: 1,
          economy: 9.5,
        },
        {
          playerName: "John Smith",
          overs: 4,
          maidens: 0,
          runs: 42,
          wickets: 1,
          economy: 10.5,
        },
        {
          playerName: "David Lee",
          overs: 4,
          maidens: 0,
          runs: 42,
          wickets: 1,
          economy: 10.5,
        },
      ],
    },
  };
}

export default async function TeamScorecardPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const match = await getDocById(COLLECTIONS.MATCHES, id);

  if (!match) {
    notFound();
  }

  const scorecardData = await getScorecardData(match, id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/team/matches">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Matches
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Match Scorecard</h1>
        </div>

        {!scorecardData ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scorecard Data</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Scorecard data hasn't been populated yet for this match.
              </p>
              <Link href="/team/matches">
                <Button>Back to Matches</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Scorecard
            matchDetails={scorecardData.matchDetails}
            ourInnings={scorecardData.ourInnings}
            opponentInnings={scorecardData.opponentInnings}
          />
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
