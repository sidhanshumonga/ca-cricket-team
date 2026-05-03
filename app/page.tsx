import Link from "next/link";
import { getActiveSeason } from "./actions/season";
import { getMatches } from "./actions/match";
import { getWeatherForMatch } from "./actions/weather";
import { format } from "date-fns";
import { toDate } from "@/lib/firestore-helpers";
import { Chip } from "@/components/ui-new/chip";
import { Icons } from "@/components/ui-new/icons";
import {
  generateEditorialHeadline,
  calculateSeasonWeek,
  daysUntil,
  getShortTeamName,
  getShortVenueName,
} from "@/lib/editorial";

const TEAM = {
  name: "Cary Avengers",
  division: "Division 8",
  season: "Spring 2026",
};

export default async function HomePage() {
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return <NoSeasonView />;
  }

  const allMatches = await getMatches(activeSeason.id);
  const now = new Date();

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

  let weather = null;
  if (nextMatch) {
    try {
      weather = await getWeatherForMatch(
        nextMatch.location,
        toDate(nextMatch.date),
      );
    } catch (error) {
      console.error("Failed to fetch weather, continuing without it:", error);
    }
  }

  const wins = pastMatches.filter((m: any) => m.result === "Won").length;
  const losses = pastMatches.filter((m: any) => m.result === "Lost").length;
  const ties = pastMatches.filter(
    (m: any) => m.result === "Tied" || m.result === "Drew",
  ).length;
  const gamesRemaining = upcomingMatches.length;

  const headline = generateEditorialHeadline({
    wins,
    losses,
    ties,
    gamesRemaining,
  });
  const { currentWeek, totalWeeks } = calculateSeasonWeek(
    toDate(activeSeason.startDate),
    toDate(activeSeason.endDate),
  );

  return (
    <div className="screen no-tab">
      <div className="screen-pad-top" />

      {/* Hero */}
      <div style={{ padding: "8px 18px 24px", position: "relative" }}>
        <div
          className="row"
          style={{ justifyContent: "space-between", marginBottom: 18 }}
        >
          <div className="row gap-10">
            {/* Team Mark Placeholder */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--orange-soft)",
                color: "var(--orange-deep)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              CA
            </div>
            <div className="col">
              <div
                style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.01 }}
              >
                {TEAM.name}
              </div>
              <div className="eyebrow" style={{ fontSize: 9 }}>
                {TEAM.division} · {TEAM.season}
              </div>
            </div>
          </div>
          <Link href="/admin/login">
            <button
              className="pressable"
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Admin
            </button>
          </Link>
        </div>

        {/* Big editorial headline */}
        <div style={{ marginTop: 10 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            <span className="live-dot" style={{ marginRight: 6 }} /> Season in
            progress · Week {currentWeek} of {totalWeeks}
          </div>
          <div
            className="serif"
            style={{
              fontSize: 46,
              lineHeight: 0.96,
              letterSpacing: "-0.025em",
            }}
          >
            {headline.line1}
            <br />
            <span className="serif-i" style={{ color: "var(--orange)" }}>
              {headline.line2}
            </span>
            <br />
            {headline.line3}
          </div>
        </div>
      </div>

      {/* Featured next match */}
      {nextMatch && (
        <div style={{ padding: "0 18px 18px" }}>
          <NextMatchHero match={nextMatch} weather={weather} />
        </div>
      )}

      {/* Player portal CTA */}
      <div style={{ padding: "0 18px 22px" }}>
        <Link href="/player">
          <button
            className="pressable"
            style={{
              width: "100%",
              borderRadius: 22,
              padding: 20,
              background: "var(--ink)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "none",
            }}
          >
            <div className="col" style={{ alignItems: "flex-start", gap: 4 }}>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.6,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                For squad members
              </div>
              <div className="serif" style={{ fontSize: 26 }}>
                Open Player Portal
              </div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "var(--orange)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Icons.arrow}
            </div>
          </button>
        </Link>
      </div>

      {/* Recent results */}
      {pastMatches.length > 0 && (
        <div style={{ padding: "0 18px 28px" }}>
          <div className="label-xs" style={{ marginBottom: 10 }}>
            Recent results
          </div>
          <div className="col gap-10">
            {pastMatches.map((m: any) => (
              <RecentResultCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NextMatchHero({
  match,
  weather,
}: {
  match: any;
  weather: { icon: string; temp: number; condition: string } | null;
}) {
  const matchDate = toDate(match.date);
  const daysAway = daysUntil(matchDate);
  const opponentShort = getShortTeamName(match.opponent);
  const venueShort = getShortVenueName(match.location);

  return (
    <div
      className="card pop"
      style={{
        background: "linear-gradient(135deg, #297278 0%, #1F5A5F 100%)",
        color: "#fff",
        border: "none",
        padding: 22,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* decorative crosshatch */}
      <svg
        style={{ position: "absolute", right: -20, top: -20, opacity: 0.1 }}
        width="180"
        height="180"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#fff"
          strokeWidth="0.5"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          stroke="#fff"
          strokeWidth="0.5"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="15"
          stroke="#fff"
          strokeWidth="0.5"
          fill="none"
        />
      </svg>

      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
          Next match · in {daysAway} {daysAway === 1 ? "day" : "days"}
        </div>
        <Chip tone="orange" dot>
          {match.type}
        </Chip>
      </div>

      <div
        className="row"
        style={{ marginTop: 16, gap: 14, alignItems: "center" }}
      >
        <div className="col" style={{ flex: 1 }}>
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
            Cary
          </div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>
            Avengers
          </div>
        </div>
        <div className="serif-i" style={{ fontSize: 18, opacity: 0.7 }}>
          vs
        </div>
        <div
          className="col"
          style={{ flex: 1, alignItems: "flex-end", textAlign: "right" }}
        >
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
            {match.opponent.split(" ").slice(0, -1).join(" ") || opponentShort}
          </div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>
            {match.opponent.split(" ").slice(-1)[0]}
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 18, gap: 16, opacity: 0.95 }}>
        <div className="row gap-6">
          <span style={{ opacity: 0.7 }}>{Icons.cal}</span>
          <span style={{ fontSize: 13 }}>{format(matchDate, "MMM d")}</span>
        </div>
        <div className="row gap-6">
          <span style={{ opacity: 0.7 }}>{Icons.clock}</span>
          <span style={{ fontSize: 13 }}>
            {match.matchTime || format(matchDate, "h:mm a")}
          </span>
        </div>
        <div className="row gap-6">
          <span style={{ opacity: 0.7 }}>{Icons.pin}</span>
          <span style={{ fontSize: 13 }}>{venueShort}</span>
        </div>
      </div>

      {weather && (
        <>
          <div
            className="hr"
            style={{ background: "rgba(255,255,255,0.18)", margin: "16px 0" }}
          />

          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <div className="row gap-8">
              <div style={{ fontSize: 13, opacity: 0.7 }}>Weather</div>
            </div>
            <div className="row gap-6" style={{ fontSize: 13, opacity: 0.85 }}>
              <span>{weather.icon}</span>
              <span>{weather.temp}°</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RecentResultCard({ match }: { match: any }) {
  const matchDate = toDate(match.date);
  const won = match.result === "Won";
  const tied = match.result === "Tied" || match.result === "Drew";
  const tone = won ? "green" : tied ? "amber" : "red";
  const colorVar = won ? "var(--green)" : tied ? "var(--amber)" : "var(--red)";

  return (
    <Link href={`/team/matches/${match.id}/scorecard`}>
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
          <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>
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
            <Chip tone={tone}>{match.result || "Played"}</Chip>
            <Chip tone="gray">{match.type}</Chip>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            vs {match.opponent}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            {match.resultSummary || match.location}
          </div>
        </div>
        <div style={{ color: "var(--ink-4)" }}>{Icons.arrow}</div>
      </div>
    </Link>
  );
}

function NoSeasonView() {
  return (
    <div
      className="screen"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div
          className="serif"
          style={{ fontSize: 36, color: "var(--ink-2)", marginBottom: 16 }}
        >
          Season Coming Soon
        </div>
        <p style={{ color: "var(--ink-3)", marginBottom: 24 }}>
          The new cricket season is just around the corner. Stay tuned for the
          schedule announcement!
        </p>
        <Link href="/admin/login">
          <button
            className="pressable"
            style={{
              padding: "12px 24px",
              borderRadius: 16,
              background: "var(--ink)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Admin Login
          </button>
        </Link>
      </div>
    </div>
  );
}
