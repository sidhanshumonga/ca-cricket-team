"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPlayers } from "@/app/actions/player";
import { Icons } from "@/components/ui-new/icons";
import { Avatar } from "@/components/ui-new/avatar";

export default function PlayerSelect() {
  const [players, setPlayers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getPlayers().then((data) => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  const handleContinue = () => {
    if (picked) {
      const player = players.find((p) => p.id === picked);
      if (player) {
        localStorage.setItem("selectedPlayer", JSON.stringify(player));
        (window as any).dispatchEvent(
          new CustomEvent("playerSelected", { detail: player }),
        );
        router.push(`/player/${picked}`);
      }
    }
  };

  return (
    <div className="screen no-tab">
      <div className="screen-pad-top" />

      {/* Header */}
      <div style={{ padding: "16px 18px 24px" }}>
        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Link href="/">
            <button
              className="pressable"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 8H3M3 8L7 4M3 8L7 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
          <div className="eyebrow" style={{ fontSize: 10 }}>
            Step 1 of 1
          </div>
        </div>
      </div>

      <div style={{ padding: "6px 22px 18px" }}>
        <div className="serif" style={{ fontSize: 38, lineHeight: 1.02 }}>
          Who's{" "}
          <span className="serif-i" style={{ color: "var(--orange)" }}>
            playing?
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "var(--ink-3)",
            lineHeight: 1.45,
          }}
        >
          Pick your name to mark availability. No password — we trust the squad.
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "0 18px 14px" }}>
        <div
          className="row"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "12px 14px",
            gap: 10,
          }}
        >
          <span style={{ color: "var(--ink-4)" }}>{Icons.search}</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the squad…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              color: "var(--ink)",
            }}
          />
          {q && (
            <button onClick={() => setQ("")} style={{ color: "var(--ink-4)" }}>
              {Icons.x}
            </button>
          )}
        </div>
      </div>

      {/* Player List */}
      <div style={{ padding: "0 18px 130px" }}>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: 40, color: "var(--ink-3)" }}
          >
            Loading players...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: 40, color: "var(--ink-3)" }}
          >
            No players found
          </div>
        ) : (
          <div className="col gap-8">
            {filtered.map((p, index) => (
              <button
                key={p.id}
                onClick={() => setPicked(p.id)}
                className="pressable"
                style={{
                  width: "100%",
                  background:
                    picked === p.id ? "var(--orange-soft)" : "var(--paper)",
                  border:
                    "1px solid " +
                    (picked === p.id ? "var(--orange)" : "var(--line)"),
                  borderRadius: 18,
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  transition: "all .18s ease",
                }}
              >
                <Avatar player={p} size={42} index={index} />
                <div className="col" style={{ flex: 1, gap: 2 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {(p.jersey || p.jerseyNumber) &&
                      `#${p.jersey || p.jerseyNumber} · `}
                    {p.role || "Player"}
                    {p.isCaptain && " · Captain"}
                    {p.isViceCaptain && " · Vice Captain"}
                  </div>
                </div>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border:
                      "2px solid " +
                      (picked === p.id ? "var(--orange)" : "var(--line)"),
                    background:
                      picked === p.id ? "var(--orange)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  {picked === p.id && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating CTA */}
      {picked && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "12px 18px 24px",
            background: "var(--bg)",
            zIndex: 50,
            animation: "slideUp .3s ease both",
          }}
        >
          <button
            onClick={handleContinue}
            className="pressable"
            style={{
              width: "100%",
              padding: 18,
              borderRadius: 20,
              fontSize: 16,
              fontWeight: 600,
              background: "var(--orange)",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 12px 30px rgba(218,130,80,0.35)",
            }}
          >
            Continue as{" "}
            {players.find((p) => p.id === picked)?.name.split(" ")[0]}{" "}
            {Icons.arrow}
          </button>
        </div>
      )}
    </div>
  );
}
