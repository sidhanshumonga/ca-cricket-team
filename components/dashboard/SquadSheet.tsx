"use client";

import { Avatar } from "@/components/ui-new/avatar";
import { Chip } from "@/components/ui-new/chip";

interface SquadSheetProps {
  open: boolean;
  onClose: () => void;
  match: any;
  availablePlayers: any[];
  backupPlayers: any[];
  unavailablePlayers: any[];
  pendingPlayers: any[];
}

export function SquadSheet({
  open,
  onClose,
  match,
  availablePlayers,
  backupPlayers,
  unavailablePlayers,
  pendingPlayers,
}: SquadSheetProps) {
  if (!open) return null;

  const sections = [
    {
      id: "available",
      label: "Available",
      tone: "green",
      items: availablePlayers,
    },
    { id: "backup", label: "Backup", tone: "blue", items: backupPlayers },
    { id: "unavailable", label: "Out", tone: "red", items: unavailablePlayers },
    {
      id: "pending",
      label: "Awaiting reply",
      tone: "gray",
      items: pendingPlayers,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "80vh",
          background: "var(--bg)",
          borderRadius: "24px 24px 0 0",
          zIndex: 1000,
          animation: "slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Handle */}
        <div
          style={{
            padding: "12px 0 8px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "var(--line)",
            }}
          />
        </div>

        {/* Header */}
        <div style={{ padding: "8px 22px 4px" }}>
          <div className="serif" style={{ fontSize: 24 }}>
            Squad Availability
          </div>
        </div>

        {/* Match info */}
        {match && (
          <div
            style={{
              fontSize: 13,
              color: "var(--ink-3)",
              padding: "0 26px 14px",
            }}
          >
            vs {match.opponent} · {match.date}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 22px 32px",
          }}
        >
          <div className="col gap-18">
            {sections.map((s) => (
              <div key={s.id}>
                <div
                  className="row"
                  style={{ justifyContent: "space-between", marginBottom: 8 }}
                >
                  <div className="row gap-8">
                    <div className={`chip chip-${s.tone}`}>{s.label}</div>
                    <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
                      {s.items.length}
                    </span>
                  </div>
                </div>
                <div className="col gap-8">
                  {s.items.map((p: any, idx: number) => (
                    <div
                      key={p.id}
                      className="row gap-12"
                      style={{ padding: "8px 4px" }}
                    >
                      <Avatar player={p} size={36} index={idx} />
                      <div className="col" style={{ flex: 1, gap: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                          {(p.jersey || p.jerseyNumber) &&
                            `#${p.jersey || p.jerseyNumber} · `}
                          {p.role || "Player"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {s.items.length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--ink-4)",
                        padding: "6px 4px",
                      }}
                    >
                      —
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
