"use client";

import { useState } from "react";
import { Chip } from "@/components/ui-new/chip";
import { Icons } from "@/components/ui-new/icons";
import { SwipeAvailability } from "./SwipeAvailability";
import { SquadStack } from "./SquadStack";

interface MatchCardProps {
  match: any;
  status?: string;
  note?: string;
  featured?: boolean;
  onStatus: (status: string) => void;
  onNote: (note: string) => void;
  onShowSquad: () => void;
}

export function MatchCard({
  match,
  status,
  note = "",
  featured = false,
  onStatus,
  onNote,
  onShowSquad,
}: MatchCardProps) {
  const [showNote, setShowNote] = useState(!!note);

  // Calculate response progress
  const total =
    match.available + match.backup + match.unavailable + match.pending;
  const respondedPct =
    ((match.available + match.backup + match.unavailable) / total) * 100;

  return (
    <div
      className="card slide-up"
      style={{
        padding: 0,
        overflow: "hidden",
        border: featured
          ? "1.5px solid var(--orange)"
          : "1px solid var(--line)",
        boxShadow: featured ? "0 12px 30px rgba(218,130,80,0.12)" : "none",
        position: "relative",
      }}
    >
      {featured && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "var(--orange)",
            color: "#fff",
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "4px 8px",
            borderRadius: 999,
            textTransform: "uppercase",
          }}
        >
          Next up
        </div>
      )}

      {/* Top section — match details */}
      <div style={{ padding: "18px 18px 14px" }}>
        <div className="row" style={{ gap: 14, alignItems: "flex-start" }}>
          {/* Date block */}
          <div
            className="col"
            style={{
              width: 56,
              alignItems: "center",
              gap: 0,
              padding: "8px 0",
              borderRadius: 12,
              background: featured ? "var(--orange-soft)" : "var(--line-2)",
            }}
          >
            <div
              className="eyebrow"
              style={{
                fontSize: 9,
                color: featured ? "var(--orange-deep)" : "var(--ink-3)",
              }}
            >
              {match.date.split(",")[0]}
            </div>
            <div
              className="serif"
              style={{
                fontSize: 26,
                lineHeight: 1,
                color: featured ? "var(--orange-deep)" : "var(--ink)",
              }}
            >
              {match.date.split(" ")[2]}
            </div>
            <div
              className="eyebrow"
              style={{
                fontSize: 9,
                color: featured ? "var(--orange-deep)" : "var(--ink-3)",
              }}
            >
              {match.date.split(" ")[1]}
            </div>
          </div>

          {/* Match info */}
          <div className="col" style={{ flex: 1, gap: 6 }}>
            <div className="row gap-6">
              <Chip tone={match.type === "League" ? "teal" : "gray"}>
                {match.type}
              </Chip>
              {match.weather && (
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  · {match.weather.icon} {match.weather.temp}°
                </span>
              )}
            </div>
            <div className="serif" style={{ fontSize: 22, lineHeight: 1.05 }}>
              vs {match.opponent}
            </div>
            <div className="row gap-12" style={{ flexWrap: "wrap" }}>
              <div
                className="row gap-4"
                style={{ fontSize: 12, color: "var(--ink-3)" }}
              >
                <span style={{ opacity: 0.6 }}>{Icons.clock}</span>
                {match.time} · report {match.report}
              </div>
            </div>
            <div
              className="row gap-4"
              style={{ fontSize: 12, color: "var(--ink-3)" }}
            >
              <span style={{ opacity: 0.6 }}>{Icons.pin}</span>
              {match.venue}, {match.city}
            </div>
          </div>
        </div>
      </div>

      <div className="hr" />

      {/* Swipe-to-mark availability */}
      <div style={{ padding: "14px 16px 12px" }}>
        <SwipeAvailability current={status} onChange={onStatus} match={match} />
      </div>

      {/* Squad strip + note toggle */}
      <div
        className="row"
        style={{
          padding: "0 16px 16px",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onShowSquad}
          className="pressable row gap-8"
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            background: "var(--line-2)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <SquadStack players={match.availablePlayers || []} />
          <span>{match.available} in</span>
          <span style={{ color: "var(--ink-4)" }}>
            · {match.pending} pending
          </span>
        </button>
        <button
          onClick={() => setShowNote((s) => !s)}
          className="pressable"
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            background: showNote ? "var(--ink)" : "transparent",
            color: showNote ? "#fff" : "var(--ink-3)",
            border: showNote ? "none" : "1px solid var(--line)",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {note ? "✎ Note" : "+ Add note"}
        </button>
      </div>

      {showNote && (
        <div style={{ padding: "0 16px 16px" }} className="fade-in">
          <textarea
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="e.g. Late by 30 mins, on the way…"
            rows={2}
            style={{
              width: "100%",
              resize: "none",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 10,
              fontSize: 13,
              outline: "none",
              background: "var(--bg)",
            }}
          />
        </div>
      )}

      {/* Response progress strip */}
      <div style={{ height: 3, background: "var(--line-2)" }}>
        <div
          style={{
            height: "100%",
            width: respondedPct + "%",
            background: featured ? "var(--orange)" : "var(--teal)",
            transition: "width .8s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </div>
    </div>
  );
}
