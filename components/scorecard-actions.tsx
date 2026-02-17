"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PopulateScorecardDialog } from "@/components/populate-scorecard-dialog";
import { getScorecard } from "@/app/actions/scorecard";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface ScorecardActionsProps {
  matchId: string;
}

export function ScorecardActions({ matchId }: ScorecardActionsProps) {
  const [hasScorecard, setHasScorecard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkScorecard() {
      try {
        const result = await getScorecard(matchId);
        setHasScorecard(result.success && !!result.scorecard);
      } catch (error) {
        console.error("Error checking scorecard:", error);
        setHasScorecard(false);
      } finally {
        setLoading(false);
      }
    }

    checkScorecard();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {hasScorecard && (
        <Link href={`/admin/matches/${matchId}/scorecard`} className="flex-1">
          <Button variant="default" className="w-full">
            View Scorecard
          </Button>
        </Link>
      )}
      <div className={hasScorecard ? "flex-1" : "w-full"}>
        <PopulateScorecardDialog matchId={matchId} />
      </div>
    </div>
  );
}
