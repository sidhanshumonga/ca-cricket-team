"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui-new/icons";
import "@/app/player-design.css";

function StatTile({ big, label }: { big: number | string; label: string }) {
  return (
    <div className="card" style={{ padding: 14, textAlign: "center" }}>
      <div
        className="serif"
        style={{ fontSize: 30, lineHeight: 1, color: "var(--ink)" }}
      >
        {big}
      </div>
      <div className="eyebrow" style={{ marginTop: 6, fontSize: 9 }}>
        {label}
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  editable,
}: {
  label: string;
  value: string;
  editable: boolean;
}) {
  return (
    <div
      className="row"
      style={{ padding: "14px 16px", justifyContent: "space-between" }}
    >
      <div className="eyebrow" style={{ fontSize: 10 }}>
        {label}
      </div>
      <div className="row gap-8" style={{ fontSize: 14, fontWeight: 500 }}>
        <span>{value}</span>
        {editable && (
          <span style={{ color: "var(--ink-4)" }}>{Icons.menu}</span>
        )}
      </div>
    </div>
  );
}

function ActionRow({
  label,
  sub,
  icon,
  danger,
  onClick,
}: {
  label: string;
  sub: string;
  icon: any;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="pressable row"
      style={{
        padding: "12px 14px",
        width: "100%",
        gap: 12,
        textAlign: "left",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: danger ? "var(--red-soft)" : "var(--line-2)",
          color: danger ? "var(--red)" : "var(--ink-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div className="col" style={{ flex: 1, gap: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: danger ? "var(--red)" : "var(--ink)",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</div>
      </div>
      <span style={{ color: "var(--ink-4)" }}>{Icons.arrow}</span>
    </button>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [player, setPlayer] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const allRoles = [
    "Batter",
    "Bowler",
    "All-rounder",
    "Wicketkeeper",
    "Captain",
  ];

  useEffect(() => {
    params.then(async ({ playerId: id }) => {
      setPlayerId(id);
      // Fetch player data
      const { getPlayer } = await import("@/app/actions/availability");
      const playerData = await getPlayer(id);
      setPlayer(playerData);
      if (playerData?.role) {
        setRoles([playerData.role]);
      }
    });
  }, [params]);

  if (!player) {
    return (
      <div className="screen">
        <div className="screen-pad-top" />
        <div style={{ padding: "24px 22px", textAlign: "center" }}>
          Loading...
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("selectedPlayer");
    router.push("/player");
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    setEditing(false);
  };

  const tone = player.jerseyNumber % 2 === 0 ? "teal" : "orange";
  const initials = player.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="screen">
      <div className="screen-pad-top" />

      <div
        className="row"
        style={{ padding: "6px 18px 0", justifyContent: "space-between" }}
      >
        <button
          className="pressable"
          onClick={() => router.push(`/player/${playerId}`)}
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
          {Icons.arrow}
        </button>
        <button
          onClick={() => setEditing((e) => !e)}
          className="pressable"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: editing ? "var(--ink)" : "var(--paper)",
            color: editing ? "#fff" : "var(--ink)",
            border: editing ? "none" : "1px solid var(--line)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Hero — profile card */}
      <div style={{ padding: "24px 22px 0" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 6,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 999,
              background:
                tone === "teal" ? "var(--teal-soft)" : "var(--orange-soft)",
              color:
                tone === "teal" ? "var(--teal-deep)" : "var(--orange-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              position: "relative",
              border: `3px solid ${tone === "teal" ? "var(--teal)" : "var(--orange)"}`,
              marginBottom: 18,
            }}
          >
            {initials}
            <div
              style={{
                position: "absolute",
                bottom: -4,
                right: -4,
                background: "var(--ink)",
                color: "#fff",
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 9px",
                borderRadius: 999,
                border: "2px solid var(--bg)",
              }}
            >
              #{player.jerseyNumber || player.jersey || "00"}
            </div>
          </div>
          <div
            className="serif"
            style={{
              fontSize: 28,
              lineHeight: 1.15,
              marginBottom: 4,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {player.name}
          </div>
          {(player.isCaptain || player.isViceCaptain) && (
            <div
              style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}
            >
              {player.isCaptain ? "Captain" : "Vice Captain"}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            {roles.map((r) => (
              <div key={r} className="chip chip-orange">
                {r}
              </div>
            ))}
            {player.secondaryRole && (
              <div className="chip chip-gray">{player.secondaryRole}</div>
            )}
          </div>
        </div>
      </div>

      {/* Playing info */}
      <div style={{ padding: "24px 18px 0" }}>
        <div
          className="label-xs"
          style={{ marginBottom: 10, padding: "0 4px" }}
        >
          Playing style
        </div>
        <div className="card">
          {player.battingStyle && (
            <>
              <ProfileRow
                label="Batting"
                value={player.battingStyle}
                editable={editing}
              />
              <div className="hr" style={{ margin: "0 16px", width: "auto" }} />
            </>
          )}
          {player.bowlingStyle && (
            <>
              <ProfileRow
                label="Bowling"
                value={player.bowlingStyle}
                editable={editing}
              />
              <div className="hr" style={{ margin: "0 16px", width: "auto" }} />
            </>
          )}
          {player.battingPosition && (
            <>
              <ProfileRow
                label="Bat Position"
                value={player.battingPosition}
                editable={editing}
              />
              <div className="hr" style={{ margin: "0 16px", width: "auto" }} />
            </>
          )}
          {player.defaultFieldingPosition && (
            <ProfileRow
              label="Fielding"
              value={player.defaultFieldingPosition}
              editable={editing}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "24px 18px 0" }}>
        <div className="card" style={{ padding: 4 }}>
          <ActionRow
            label="Switch to admin"
            sub="Match scoring, season setup"
            icon={Icons.menu}
            onClick={() => router.push("/admin")}
          />
          <div className="hr" style={{ margin: "0 16px", width: "auto" }} />
          <ActionRow
            label="Sign out"
            sub="Clear session"
            icon={Icons.x}
            danger
            onClick={handleLogout}
          />
        </div>
      </div>

      <div style={{ height: 200 }} />

      {/* Edit Sheet */}
      {editing && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setEditing(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
          />

          {/* Sheet */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "85vh",
              background: "var(--bg)",
              borderRadius: "24px 24px 0 0",
              zIndex: 1000,
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
            <div style={{ padding: "8px 22px 16px" }}>
              <div className="serif" style={{ fontSize: 24 }}>
                Edit Profile
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 22px 32px",
              }}
            >
              <div className="col gap-16">
                {/* Name */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Full Name
                  </div>
                  <input
                    type="text"
                    defaultValue={player.name}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  />
                </div>

                {/* Primary Role */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Primary Role
                  </div>
                  <select
                    defaultValue={player.role}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>

                {/* Secondary Role */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Secondary Role
                  </div>
                  <select
                    defaultValue={player.secondaryRole || ""}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">None</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>

                {/* Batting Style */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Batting Style
                  </div>
                  <select
                    defaultValue={player.battingStyle || ""}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">None</option>
                    <option value="Right-hand bat">Right-hand bat</option>
                    <option value="Left-hand bat">Left-hand bat</option>
                  </select>
                </div>

                {/* Bowling Style */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Bowling Style
                  </div>
                  <select
                    defaultValue={player.bowlingStyle || ""}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">None</option>
                    <option value="Right-arm fast">Right-arm fast</option>
                    <option value="Left-arm fast">Left-arm fast</option>
                    <option value="Right-arm medium">Right-arm medium</option>
                    <option value="Left-arm medium">Left-arm medium</option>
                    <option value="Right-arm spin">Right-arm spin</option>
                    <option value="Left-arm spin">Left-arm spin</option>
                    <option value="Leg-spin">Leg-spin</option>
                    <option value="Off-spin">Off-spin</option>
                  </select>
                </div>

                {/* Batting Position */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Batting Position
                  </div>
                  <select
                    defaultValue={player.battingPosition || ""}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">None</option>
                    <option value="Opener (1-2)">Opener (1-2)</option>
                    <option value="Top order (3-4)">Top order (3-4)</option>
                    <option value="Middle order (5-6)">
                      Middle order (5-6)
                    </option>
                    <option value="Lower order (7-8)">Lower order (7-8)</option>
                    <option value="Tail (9-11)">Tail (9-11)</option>
                  </select>
                </div>

                {/* Fielding Position */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Fielding Position
                  </div>
                  <select
                    defaultValue={player.defaultFieldingPosition || ""}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">None</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                    <option value="Slip">Slip</option>
                    <option value="Gully">Gully</option>
                    <option value="Point">Point</option>
                    <option value="Cover">Cover</option>
                    <option value="Extra Cover">Extra Cover</option>
                    <option value="Mid Off">Mid Off</option>
                    <option value="Mid On">Mid On</option>
                    <option value="Mid Wicket">Mid Wicket</option>
                    <option value="Square Leg">Square Leg</option>
                    <option value="Fine Leg">Fine Leg</option>
                    <option value="Third Man">Third Man</option>
                    <option value="Long-on">Long-on</option>
                    <option value="Long-off">Long-off</option>
                    <option value="Deep Square Leg">Deep Square Leg</option>
                    <option value="Deep Mid Wicket">Deep Mid Wicket</option>
                  </select>
                </div>

                {/* Jersey Number */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Jersey Number
                  </div>
                  <input
                    type="number"
                    defaultValue={player.jerseyNumber || player.jersey || ""}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 8, fontSize: 10 }}
                  >
                    Notes
                  </div>
                  <textarea
                    defaultValue={player.notes || ""}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--line)",
                      fontSize: 14,
                      fontWeight: 500,
                      resize: "vertical",
                    }}
                    placeholder="Any special notes about the player..."
                  />
                </div>

                {/* Captain/Vice Captain */}
                <div>
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 12, fontSize: 10 }}
                  >
                    Leadership
                  </div>
                  <div className="row gap-16">
                    <label className="row gap-8" style={{ cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        defaultChecked={player.isCaptain}
                        style={{ width: 18, height: 18 }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        Captain
                      </span>
                    </label>
                    <label className="row gap-8" style={{ cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        defaultChecked={player.isViceCaptain}
                        style={{ width: 18, height: 18 }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        Vice Captain
                      </span>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="btn btn-orange pressable"
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
