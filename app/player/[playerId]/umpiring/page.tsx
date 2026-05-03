"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui-new/icons";
import "@/app/player-design.css";

// Mock data - replace with actual data fetching
const MOCK_UMPIRING = [
  {
    id: "1",
    match: "Cary Avengers vs Emperors HT",
    date: "Sat, May 10",
    time: "2:00 PM",
    venue: "Cary High School",
    role: "Umpire 1",
    status: "confirmed",
  },
  {
    id: "2",
    match: "Cary Avengers vs Falcons",
    date: "Sun, May 18",
    time: "10:00 AM",
    venue: "Green Hope HS",
    role: "Umpire 2",
    status: "confirmed",
  },
  {
    id: "3",
    match: "Cary Avengers vs Mavericks HT",
    date: "Sat, May 24",
    time: "4:00 PM",
    venue: "Apex Friendship HS",
    role: "Umpire 1",
    status: "pending",
  },
];

function StatTile({ big, label }: { big: number; label: string }) {
  return (
    <div className="card" style={{ padding: 14, textAlign: "center" }}>
      <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>
        {big}
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function UmpiringCard({ u }: { u: any }) {
  const confirmed = u.status === "confirmed";
  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 8 }}
      >
        <div className={`chip chip-${confirmed ? "teal" : "amber"}`}>
          {confirmed ? "Confirmed" : "Pending"}
        </div>
        <div className="chip chip-gray">{u.role}</div>
      </div>
      <div
        className="serif"
        style={{ fontSize: 18, lineHeight: 1.15, marginBottom: 8 }}
      >
        {u.match}
      </div>
      <div className="row gap-14" style={{ flexWrap: "wrap" }}>
        <div
          className="row gap-4"
          style={{ fontSize: 12, color: "var(--ink-3)" }}
        >
          <span style={{ opacity: 0.6 }}>{Icons.cal}</span>
          {u.date}
        </div>
        <div
          className="row gap-4"
          style={{ fontSize: 12, color: "var(--ink-3)" }}
        >
          <span style={{ opacity: 0.6 }}>{Icons.clock}</span>
          {u.time}
        </div>
        <div
          className="row gap-4"
          style={{ fontSize: 12, color: "var(--ink-3)" }}
        >
          <span style={{ opacity: 0.6 }}>{Icons.pin}</span>
          {u.venue}
        </div>
      </div>
      {!confirmed && (
        <div className="row gap-8" style={{ marginTop: 14 }}>
          <button
            className="btn btn-teal pressable"
            style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 13 }}
          >
            Accept
          </button>
          <button
            className="btn btn-ghost pressable"
            style={{ flex: 1, padding: 12, borderRadius: 12, fontSize: 13 }}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

export default function UmpiringPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [umpiring] = useState<any[]>(MOCK_UMPIRING);

  useEffect(() => {
    params.then(({ playerId: id }) => {
      setPlayerId(id);
    });
  }, [params]);

  const confirmed = umpiring.filter((u) => u.status === "confirmed").length;
  const pending = umpiring.filter((u) => u.status === "pending").length;

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
        <div className="row gap-6">
          <span style={{ color: "var(--ink-3)" }}>{Icons.whistle}</span>
        </div>
      </div>

      <div style={{ padding: "20px 22px 6px" }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          Your assignments
        </div>
        <div className="serif" style={{ fontSize: 38, lineHeight: 1.02 }}>
          On the{" "}
          <span className="serif-i" style={{ color: "var(--teal)" }}>
            field
          </span>
          .
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "var(--ink-3)",
            lineHeight: 1.5,
          }}
        >
          {confirmed} confirmed, {pending} pending.
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ padding: "20px 18px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          <StatTile big={umpiring.length} label="This season" />
          <StatTile big={confirmed} label="Confirmed" />
          <StatTile big={pending} label="Pending" />
        </div>
      </div>

      {/* Assignment list */}
      <div style={{ padding: "24px 18px 0" }}>
        <div
          className="label-xs"
          style={{ marginBottom: 12, padding: "0 4px" }}
        >
          Upcoming duties
        </div>
        <div className="col gap-12">
          {umpiring.map((u) => (
            <UmpiringCard key={u.id} u={u} />
          ))}
        </div>
      </div>

      {/* Empty state */}
      <div style={{ padding: "24px 18px 0" }}>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏏</div>
          <div
            className="serif"
            style={{ fontSize: 20, lineHeight: 1.1, marginBottom: 4 }}
          >
            That's all for now
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
            New umpiring slots open weekly. Captain will tag you when one comes
            up.
          </div>
        </div>
      </div>

      <div style={{ height: 200 }} />
    </div>
  );
}
