"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

interface BattingPerformance {
  playerName: string;
  runs: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  howOut?: string;
  bowlerName?: string;
  fielderName?: string;
}

interface BowlingPerformance {
  playerName: string;
  overs: number;
  maidens?: number;
  runs: number;
  wickets: number;
  economy?: number;
  wides?: number;
  noBalls?: number;
}

interface ScorecardProps {
  matchDetails: {
    opponent: string;
    date: string;
    location: string;
    result?: string;
    resultMargin?: string;
    manOfMatch?: string;
  };
  ourInnings: {
    score: number;
    wickets: number;
    overs: number;
    batting: BattingPerformance[];
    bowling?: BowlingPerformance[];
  };
  opponentInnings: {
    score: number;
    wickets: number;
    overs: number;
    batting?: BattingPerformance[];
    bowling: BowlingPerformance[];
  };
}

export function Scorecard({
  matchDetails,
  ourInnings,
  opponentInnings,
}: ScorecardProps) {
  const getResultBadge = () => {
    if (!matchDetails.result) return null;

    const isWin = matchDetails.result === "Won";
    return (
      <Badge
        variant={isWin ? "default" : "destructive"}
        className={`text-sm ${isWin ? "bg-green-600" : ""}`}
      >
        {isWin ? <Trophy className="h-4 w-4 mr-1" /> : null}
        {matchDetails.result}
      </Badge>
    );
  };

  const formatDismissal = (perf: BattingPerformance) => {
    if (!perf.howOut || perf.howOut === "not out") {
      return "not out";
    }

    let dismissal = perf.howOut;
    if (perf.bowlerName) {
      dismissal += ` b ${perf.bowlerName}`;
    }
    if (perf.fielderName) {
      dismissal += ` c ${perf.fielderName}`;
    }
    return dismissal;
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-xl">
                vs {matchDetails.opponent}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {matchDetails.date} • {matchDetails.location}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              {getResultBadge()}
              {matchDetails.resultMargin && (
                <p className="text-sm text-muted-foreground">
                  {matchDetails.resultMargin}
                </p>
              )}
              {matchDetails.manOfMatch && (
                <div className="flex items-center gap-1 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-muted-foreground">MoM:</span>
                  <span className="font-medium">{matchDetails.manOfMatch}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Our Innings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Cary Avengers Innings</CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {ourInnings.score}/{ourInnings.wickets}
              </div>
              <div className="text-sm text-muted-foreground">
                ({ourInnings.overs} overs)
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Batting Table */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Batting</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Batsman</TableHead>
                      <TableHead className="text-right">R</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        B
                      </TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        4s
                      </TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        6s
                      </TableHead>
                      <TableHead className="text-right hidden md:table-cell">
                        SR
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ourInnings.batting.map((perf, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{perf.playerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDismissal(perf)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {perf.runs}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {perf.ballsFaced || "-"}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {perf.fours || 0}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {perf.sixes || 0}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          {perf.strikeRate ? perf.strikeRate.toFixed(1) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Bowling Table */}
            {opponentInnings.bowling && opponentInnings.bowling.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Bowling</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Bowler</TableHead>
                        <TableHead className="text-right">O</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">
                          M
                        </TableHead>
                        <TableHead className="text-right">R</TableHead>
                        <TableHead className="text-right">W</TableHead>
                        <TableHead className="text-right hidden md:table-cell">
                          Econ
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opponentInnings.bowling.map((perf, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {perf.playerName}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.overs}
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            {perf.maidens || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.runs}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {perf.wickets}
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell">
                            {perf.economy ? perf.economy.toFixed(2) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opponent Innings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {matchDetails.opponent} Innings
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {opponentInnings.score}/{opponentInnings.wickets}
              </div>
              <div className="text-sm text-muted-foreground">
                ({opponentInnings.overs} overs)
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Batting Table */}
            {opponentInnings.batting && opponentInnings.batting.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Batting</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Batsman</TableHead>
                        <TableHead className="text-right">R</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">
                          B
                        </TableHead>
                        <TableHead className="text-right hidden sm:table-cell">
                          4s
                        </TableHead>
                        <TableHead className="text-right hidden sm:table-cell">
                          6s
                        </TableHead>
                        <TableHead className="text-right hidden md:table-cell">
                          SR
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opponentInnings.batting.map((perf, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {perf.playerName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDismissal(perf)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {perf.runs}
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            {perf.ballsFaced || "-"}
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            {perf.fours || 0}
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            {perf.sixes || 0}
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell">
                            {perf.strikeRate ? perf.strikeRate.toFixed(1) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Bowling Table */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Bowling</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Bowler</TableHead>
                      <TableHead className="text-right">O</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        M
                      </TableHead>
                      <TableHead className="text-right">R</TableHead>
                      <TableHead className="text-right">W</TableHead>
                      <TableHead className="text-right hidden md:table-cell">
                        Econ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opponentInnings.bowling.map((perf, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {perf.playerName}
                        </TableCell>
                        <TableCell className="text-right">
                          {perf.overs}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {perf.maidens || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {perf.runs}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {perf.wickets}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          {perf.economy ? perf.economy.toFixed(2) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
