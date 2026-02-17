"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Loader2,
  Save,
  CheckCircle,
  User,
  Target,
} from "lucide-react";
import { scrapeScorecard, saveScorecard } from "@/app/actions/scorecard";
import { toast } from "sonner";

interface PopulateScorecardDialogProps {
  matchId: string;
}

export function PopulateScorecardDialog({
  matchId,
}: PopulateScorecardDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);

  const handleScrape = async () => {
    if (!url) {
      toast.error("Please enter a scorecard URL");
      return;
    }

    setLoading(true);
    try {
      const result = await scrapeScorecard(url);

      if (result.success) {
        setScrapedData(result);
        toast.success(result.message || "Scorecard data fetched successfully!");
      } else {
        toast.error(result.error || "Failed to scrape scorecard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to scrape scorecard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (
      !scrapedData ||
      !scrapedData.batting_data ||
      !scrapedData.bowling_data
    ) {
      toast.error("No data to save");
      return;
    }

    setSaving(true);
    try {
      // Transform scraped data to match our database schema
      // Assuming first half is first innings, second half is second innings
      const halfBatting = Math.ceil(scrapedData.batting_data.length / 2);
      const halfBowling = Math.ceil(scrapedData.bowling_data.length / 2);

      const scorecardData = {
        ourBatting: scrapedData.batting_data
          .slice(0, halfBatting)
          .map((b: any) => ({
            playerName: b.name || "Unknown Player",
            runs: b.runs || 0,
            ballsFaced: b.balls || 0,
            fours: b.fours || 0,
            sixes: b.sixes || 0,
            strikeRate: b.strike_rate || 0,
            howOut: b.dismissal || "not out",
            bowlerName: null,
            fielderName: null,
          })),
        ourBowling: scrapedData.bowling_data
          .slice(halfBowling)
          .map((b: any) => ({
            playerName: b.name || "Unknown Player",
            overs: b.overs || 0,
            maidens: 0,
            runs: b.runs || 0,
            wickets: b.wickets || 0,
            economy: b.economy || 0,
            wides: 0,
            noBalls: 0,
          })),
        opponentBatting: scrapedData.batting_data
          .slice(halfBatting)
          .map((b: any) => ({
            playerName: b.name || "Unknown Player",
            runs: b.runs || 0,
            ballsFaced: b.balls || 0,
            fours: b.fours || 0,
            sixes: b.sixes || 0,
            strikeRate: b.strike_rate || 0,
            howOut: b.dismissal || "not out",
            bowlerName: null,
            fielderName: null,
          })),
        opponentBowling: scrapedData.bowling_data
          .slice(0, halfBowling)
          .map((b: any) => ({
            playerName: b.name || "Unknown Player",
            overs: b.overs || 0,
            maidens: 0,
            runs: b.runs || 0,
            wickets: b.wickets || 0,
            economy: b.economy || 0,
            wides: 0,
            noBalls: 0,
          })),
        ourScore: scrapedData.match_info?.first_innings_runs || 0,
        ourWickets: scrapedData.match_info?.first_innings_wickets || 0,
        ourOvers: 16, // TODO: Extract from HTML
        opponentScore: scrapedData.match_info?.second_innings_runs || 0,
        opponentWickets: scrapedData.match_info?.second_innings_wickets || 0,
        opponentOvers: 16, // TODO: Extract from HTML
        result:
          scrapedData.match_info?.result_detail ||
          scrapedData.match_info?.result ||
          "",
        resultMargin: "", // TODO: Parse from result text
        opponent:
          scrapedData.match_info?.team1 ||
          scrapedData.match_info?.team2 ||
          null,
        matchDate: scrapedData.match_info?.date || null,
        location: scrapedData.match_info?.location || null,
        manOfMatch: scrapedData.match_info?.man_of_match || null,
        teamBattingFirst: "us",
      };

      const result = await saveScorecard(matchId, scorecardData);

      if (result.success) {
        toast.success("Scorecard saved successfully!");
        setOpen(false);
        setScrapedData(null);
        setUrl("");
        // Small delay to ensure dialog closes before refresh
        setTimeout(() => {
          router.refresh();
          window.location.reload();
        }, 300);
      } else {
        toast.error(result.error || "Failed to save scorecard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save scorecard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full whitespace-normal h-auto py-2"
        >
          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="break-words">Populate Scorecard</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Populate Scorecard from URL</DialogTitle>
          <DialogDescription>
            Enter the URL of the scorecard page to automatically extract match
            data. This works with most cricket scorecard websites.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scorecard-url">Scorecard URL</Label>
            <Input
              id="scorecard-url"
              placeholder="https://example.com/scorecard/12345"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: CricClubber, CricHQ, and most HTML-based
              scorecards
            </p>
          </div>

          <div className="flex gap-2">
            {!scrapedData ? (
              <>
                <Button
                  onClick={handleScrape}
                  disabled={loading || !url}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Scorecard Data"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUrl("");
                    setScrapedData(null);
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save to Database
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setScrapedData(null);
                    setUrl("");
                  }}
                >
                  Fetch Again
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUrl("");
                    setScrapedData(null);
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>

          {scrapedData && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">
                    Data Extracted Successfully
                  </h4>
                </div>
                <p className="text-sm text-green-800">
                  Click "Save to Database" to store this scorecard data.
                </p>
              </div>

              {scrapedData.batting_data &&
                scrapedData.batting_data.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4" />
                      <h5 className="font-semibold">
                        Batting Entries ({scrapedData.batting_data.length})
                      </h5>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {scrapedData.batting_data.map(
                        (player: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs p-2 bg-background rounded border"
                          >
                            <div className="font-medium">
                              {player.name || `Player ${idx + 1}`}
                            </div>
                            <div className="text-muted-foreground">
                              {player.runs}({player.balls}) - {player.fours}x4,{" "}
                              {player.sixes}x6 - SR:{" "}
                              {player.strike_rate?.toFixed(2)}
                            </div>
                            <div className="text-muted-foreground italic">
                              {player.dismissal}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {scrapedData.bowling_data &&
                scrapedData.bowling_data.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4" />
                      <h5 className="font-semibold">
                        Bowling Entries ({scrapedData.bowling_data.length})
                      </h5>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {scrapedData.bowling_data.map(
                        (bowler: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs p-2 bg-background rounded border"
                          >
                            <div className="font-medium">
                              {bowler.name || `Bowler ${idx + 1}`}
                            </div>
                            <div className="text-muted-foreground">
                              {bowler.overs} overs - {bowler.runs}/
                              {bowler.wickets} - Econ:{" "}
                              {bowler.economy?.toFixed(2)}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
