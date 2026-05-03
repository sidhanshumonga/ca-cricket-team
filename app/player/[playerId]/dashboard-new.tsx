"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Icons } from "@/components/ui-new/icons";
import { Chip } from "@/components/ui-new/chip";
import { ContextBanner } from "@/components/dashboard/ContextBanner";
import { LegendDot } from "@/components/dashboard/LegendDot";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { SquadSheet } from "@/components/dashboard/SquadSheet";
import { Badge } from "@/components/ui/badge";
import { updateAvailability } from "@/app/actions/availability";
import "@/app/player-design.css";

// Helper to convert Firestore timestamp to Date
function toDate(timestamp: any): Date {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}

// Helper to calculate days until a date
function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const TEAM = {
  name: "Cary Avengers",
  season: "Spring 2026",
};

interface DashboardProps {
  player: any;
  allMatches: any[];
  allPlayers: any[];
  activeSeason: any;
  seasonAvailability: any;
}

export function PlayerDashboardNew({
  player,
  allMatches,
  allPlayers,
  activeSeason,
  seasonAvailability,
}: DashboardProps) {
  const now = new Date();

  // Separate upcoming and past matches
  const upcomingMatches = allMatches
    .filter((m: any) => toDate(m.date) >= now)
    .sort(
      (a: any, b: any) => toDate(a.date).getTime() - toDate(b.date).getTime(),
    );

  const pastMatches = allMatches
    .filter((m: any) => toDate(m.date) < now)
    .sort(
      (a: any, b: any) => toDate(b.date).getTime() - toDate(a.date).getTime(),
    );

  const nextMatch = upcomingMatches[0];

  // Initialize availability state from database
  const initialAvail: Record<string, string> = {};
  const initialNotes: Record<string, string> = {};
  allMatches.forEach((m: any) => {
    if (m.myAvailability) {
      // Convert to lowercase to match component expectations
      initialAvail[m.id] = m.myAvailability.status.toLowerCase();
      if (m.myAvailability.note) {
        initialNotes[m.id] = m.myAvailability.note;
      }
    }
  });

  // Per-match availability state
  const [avail, setAvail] = useState<Record<string, string>>(initialAvail);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [seasonStatus, setSeasonStatus] = useState("available");
  const [squadOpen, setSquadOpen] = useState<string | false>(false);

  const handleHome = () => {
    localStorage.removeItem("selectedPlayer");
    window.location.href = "/";
  };

  const handleLogout = () => {
    localStorage.removeItem("selectedPlayer");
    window.location.href = "/player";
  };

  const setMatchStatus = async (mid: string, status: string) => {
    setAvail((prev) => ({ ...prev, [mid]: status }));

    // Save to database using server action (convert to uppercase to match existing format)
    try {
      await updateAvailability(
        player.id,
        mid,
        status.toUpperCase(),
        notes[mid] || "",
      );
    } catch (error) {
      console.error("Error saving availability:", error);
    }
  };

  // Generate season pulse data based on actual matches
  const generateSeasonPulse = () => {
    const pulse = [];

    // Add past matches (in chronological order)
    const sortedPast = [...pastMatches].reverse(); // Reverse to get chronological order
    sortedPast.forEach((match) => {
      const isPlayoff = match.type?.toLowerCase().includes("playoff");
      const won = match.result === "Won";
      const tied = match.result === "Tied" || match.result === "Drew";

      if (isPlayoff) {
        pulse.push({
          state: won ? "playoff-win" : "playoff-loss",
          label: `Playoff vs ${match.opponent}`,
        });
      } else {
        pulse.push({
          state: won ? "past-win" : tied ? "upcoming" : "past-loss",
          label: `vs ${match.opponent}`,
        });
      }
    });

    // Add upcoming matches
    upcomingMatches.forEach((match, idx) => {
      const isPlayoff = match.type?.toLowerCase().includes("playoff");

      if (idx === 0) {
        pulse.push({
          state: isPlayoff ? "playoff" : "next",
          label: `vs ${match.opponent}`,
        });
      } else {
        pulse.push({
          state: isPlayoff ? "playoff" : "upcoming",
          label: `vs ${match.opponent}`,
        });
      }
    });

    // Add 3 hardcoded playoff matches
    pulse.push({ state: "playoff", label: "Playoff TBD" });
    pulse.push({ state: "playoff", label: "Playoff TBD" });
    pulse.push({ state: "playoff", label: "Playoff TBD" });

    return pulse;
  };

  const seasonPulse = generateSeasonPulse();

  return (
    <div className="screen">
      <div className="screen-pad-top" />

      {/* Top bar */}
      <div
        className="row"
        style={{ padding: "6px 18px 12px", justifyContent: "space-between" }}
      >
        <button
          onClick={handleHome}
          className="pressable"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M2.25 6.75L9 2.25L15.75 6.75V14.25C15.75 14.6478 15.592 15.0294 15.3107 15.3107C15.0294 15.592 14.6478 15.75 14.25 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V6.75Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.75 15.75V9H11.25V15.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="row gap-6">
          <div className="eyebrow">
            <span className="live-dot" style={{ marginRight: 5 }} />
            {TEAM.season}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="pressable"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M6.75 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12.75L15.75 9L12 5.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.75 9H6.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Greeting */}
      <div style={{ padding: "20px 22px 8px" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          Hey #{player.jersey || player.jerseyNumber || "00"}
        </div>
        <div
          className="serif"
          style={{ fontSize: 40, lineHeight: 1, letterSpacing: "-0.025em" }}
        >
          Welcome back,
          <br />
          <span className="serif-i" style={{ color: "var(--orange)" }}>
            {player.name.split(" ")[0]}.
          </span>
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: "var(--ink-3)",
            lineHeight: 1.5,
          }}
        >
          {upcomingMatches.length} matches this season.{" "}
          {nextMatch && (
            <>
              Match day in{" "}
              <strong style={{ color: "var(--ink)" }}>
                {daysUntil(toDate(nextMatch.date))} days.
              </strong>
            </>
          )}
        </div>
      </div>

      {/* Season pulse heatmap */}
      <div style={{ padding: "20px 18px 4px" }}>
        <div
          className="row"
          style={{
            justifyContent: "space-between",
            marginBottom: 10,
            padding: "0 4px",
          }}
        >
          <div className="label-xs">Season pulse</div>
          <div className="label-xs" style={{ color: "var(--ink-4)" }}>
            {seasonPulse.length} matches
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}
          >
            {seasonPulse.map((c, i) => {
              const styles: Record<string, any> = {
                "past-win": { background: "var(--teal)" },
                "past-loss": {
                  background: "var(--red-soft)",
                  border: "1px solid var(--red)",
                },
                next: {
                  background: "var(--orange)",
                  boxShadow:
                    "0 0 0 2px var(--orange-soft), 0 0 0 3px var(--orange)",
                },
                upcoming: { background: "var(--line-2)" },
                rest: {
                  background: "transparent",
                  border: "1px dashed var(--line)",
                },
                playoff: { background: "var(--ink)", color: "#fff" },
                "playoff-win": {
                  background: "var(--ink)",
                  border: "2px solid var(--teal)",
                },
                "playoff-loss": {
                  background: "var(--ink)",
                  border: "2px solid var(--red)",
                },
              };
              const isPast =
                c.state === "past-win" ||
                c.state === "past-loss" ||
                c.state === "playoff-win" ||
                c.state === "playoff-loss";
              return (
                <div
                  key={i}
                  style={{
                    ...styles[c.state],
                    width: isPast ? "28px" : undefined,
                    flex: isPast ? "0 0 28px" : "1 0 auto",
                    height: "28px",
                    borderRadius: "6px",
                  }}
                  title={c.label}
                />
              );
            })}
          </div>
          <div
            className="row"
            style={{ marginTop: 12, gap: 12, flexWrap: "wrap" }}
          >
            <LegendDot color="var(--teal)" label="Won" />
            <LegendDot
              color="var(--red-soft)"
              border="var(--red)"
              label="Lost"
            />
            <LegendDot color="var(--orange)" label="Next" />
            <LegendDot color="var(--line-2)" label="Upcoming" />
            <LegendDot color="var(--ink)" label="Playoffs" />
          </div>
        </div>
      </div>

      {/* Season availability */}
      <div style={{ padding: "20px 18px 0" }}>
        <div
          className="row"
          style={{
            justifyContent: "space-between",
            marginBottom: 10,
            padding: "0 4px",
          }}
        >
          <div className="label-xs">Season availability</div>
          <div className="label-xs" style={{ color: "var(--ink-4)" }}>
            Tap to change
          </div>
        </div>
        <div className="card" style={{ padding: 6 }}>
          <div className="row" style={{ gap: 4 }}>
            {[
              { id: "available", label: "All in", color: "var(--green)" },
              { id: "partial", label: "Partial", color: "var(--amber)" },
              { id: "unavailable", label: "Out", color: "var(--red)" },
            ].map((o) => {
              const active = seasonStatus === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setSeasonStatus(o.id)}
                  className="pressable"
                  style={{
                    flex: 1,
                    padding: "12px 10px",
                    borderRadius: 14,
                    background: active ? o.color : "transparent",
                    color: active ? "#fff" : "var(--ink-3)",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all .2s ease",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smart context banner */}
      {nextMatch && (
        <div style={{ padding: "14px 18px 0" }}>
          <ContextBanner
            status={avail[nextMatch.id]}
            match={{
              ...nextMatch,
              daysAway: daysUntil(toDate(nextMatch.date)),
            }}
          />
        </div>
      )}

      {/* Upcoming matches */}
      <div style={{ padding: "24px 18px 0" }}>
        <div
          className="row"
          style={{
            justifyContent: "space-between",
            marginBottom: 12,
            padding: "0 4px",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>
              Upcoming
            </div>
            <div className="serif" style={{ fontSize: 24 }}>
              {upcomingMatches.length} matches to call
            </div>
          </div>
        </div>

        <div className="col gap-14">
          {upcomingMatches.map((m: any, i: number) => {
            const matchDate = toDate(m.date);

            // Calculate counts from matchAvailability array
            const availabilityArray = m.matchAvailability || [];
            const availMap: Record<string, any> = {};
            availabilityArray.forEach((a: any) => {
              availMap[a.playerId] = a;
            });

            const availablePlayers = allPlayers.filter(
              (p: any) => availMap[p.id]?.status === "AVAILABLE",
            );
            const backupPlayers = allPlayers.filter(
              (p: any) => availMap[p.id]?.status === "BACKUP",
            );
            const unavailablePlayers = allPlayers.filter(
              (p: any) => availMap[p.id]?.status === "UNAVAILABLE",
            );
            const pending =
              allPlayers.length -
              availablePlayers.length -
              backupPlayers.length -
              unavailablePlayers.length;

            const formattedMatch = {
              id: m.id,
              date: format(matchDate, "EEE, MMM d"),
              opponent: m.opponent,
              type: m.type || "League",
              time: m.matchTime || format(matchDate, "h:mm a"),
              report: m.reportingTime || "TBD",
              venue: m.location,
              city: m.location.split(",")[1] || "",
              weather: null, // TODO: Add weather
              available: availablePlayers.length,
              backup: backupPlayers.length,
              unavailable: unavailablePlayers.length,
              pending,
              availablePlayers,
            };

            return (
              <MatchCard
                key={m.id}
                match={formattedMatch}
                status={avail[m.id]}
                note={notes[m.id] || ""}
                featured={i === 0}
                onStatus={(s) => setMatchStatus(m.id, s)}
                onNote={(v) => setNotes((p) => ({ ...p, [m.id]: v }))}
                onShowSquad={() => setSquadOpen(m.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Recent matches */}
      {pastMatches.length > 0 && (
        <div style={{ padding: "32px 18px 0" }}>
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              marginBottom: 12,
              padding: "0 4px",
            }}
          >
            <div className="label-xs">Recent results</div>
            <button
              style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}
            >
              View all →
            </button>
          </div>
          <div className="col gap-10">
            {pastMatches.map((m: any) => {
              const matchDate = toDate(m.date);
              const won = m.result === "Won";
              const tied = m.result === "Tied" || m.result === "Drew";
              const tone = won ? "green" : tied ? "amber" : "red";
              const colorVar = won
                ? "var(--green)"
                : tied
                  ? "var(--amber)"
                  : "var(--red)";

              return (
                <Link key={m.id} href={`/team/matches/${m.id}/scorecard`}>
                  <div
                    className="card pressable"
                    style={{
                      padding: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      borderLeft: `3px solid ${colorVar}`,
                    }}
                  >
                    <div
                      className="col"
                      style={{ width: 46, alignItems: "center", gap: 0 }}
                    >
                      <div className="eyebrow" style={{ fontSize: 9 }}>
                        {format(matchDate, "EEE")}
                      </div>
                      <div
                        className="serif"
                        style={{ fontSize: 22, lineHeight: 1 }}
                      >
                        {format(matchDate, "d")}
                      </div>
                      <div
                        className="eyebrow"
                        style={{ fontSize: 9, color: "var(--ink-3)" }}
                      >
                        {format(matchDate, "MMM")}
                      </div>
                    </div>
                    <div className="col" style={{ flex: 1, gap: 4 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <div className={`chip chip-${tone}`}>
                          {m.result || "Played"}
                        </div>
                        <div className="chip chip-gray">{m.type}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        vs {m.opponent}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        {m.resultSummary || m.location}
                      </div>
                    </div>
                    <div style={{ color: "var(--ink-4)" }}>{Icons.arrow}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: 200 }} />

      {/* Squad Availability Sheet */}
      {squadOpen &&
        (() => {
          const match = allMatches.find((m: any) => m.id === squadOpen);
          const availabilityArray = match?.matchAvailability || [];

          const availMap: Record<string, any> = {};
          availabilityArray.forEach((a: any) => {
            availMap[a.playerId] = a;
          });

          const available = allPlayers.filter(
            (p: any) => availMap[p.id]?.status === "AVAILABLE",
          );
          const backup = allPlayers.filter(
            (p: any) => availMap[p.id]?.status === "BACKUP",
          );
          const unavailable = allPlayers.filter(
            (p: any) => availMap[p.id]?.status === "UNAVAILABLE",
          );
          const pending = allPlayers.filter((p: any) => !availMap[p.id]);

          // Format match data for display
          const formattedMatch = match
            ? {
                opponent: match.opponent,
                date: format(toDate(match.date), "EEE, MMM d"),
              }
            : null;

          return (
            <SquadSheet
              open={true}
              onClose={() => setSquadOpen(false)}
              match={formattedMatch}
              availablePlayers={available}
              backupPlayers={backup}
              unavailablePlayers={unavailable}
              pendingPlayers={pending}
            />
          );
        })()}
    </div>
  );
}
