"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Share2 } from "lucide-react";
import { format } from "date-fns";

interface SquadAvailabilitySheetProps {
  availability: any[];
  allPlayers: any[];
  match?: { opponent: string; date: string | Date };
  triggerVariant?: "stats" | "button";
}

const statusConfig: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  BACKUP: {
    label: "Backup",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function SquadAvailabilitySheet({
  availability,
  allPlayers,
  match,
  triggerVariant = "stats",
}: SquadAvailabilitySheetProps) {
  // Build a map of playerId -> availability status
  const availMap: Record<string, any> = {};
  for (const a of availability) {
    availMap[a.playerId] = a;
  }

  const responded = allPlayers.filter((p) => availMap[p.id]);
  const notResponded = allPlayers.filter((p) => !availMap[p.id]);

  const available = responded.filter(
    (p) => availMap[p.id]?.status?.toUpperCase() === "AVAILABLE",
  );
  const backup = responded.filter(
    (p) => availMap[p.id]?.status?.toUpperCase() === "BACKUP",
  );
  const unavailable = responded.filter(
    (p) => availMap[p.id]?.status?.toUpperCase() === "UNAVAILABLE",
  );

  const responseRate =
    allPlayers.length > 0
      ? Math.round((responded.length / allPlayers.length) * 100)
      : 0;

  const shareOnWhatsApp = () => {
    const dateStr = match ? format(new Date(match.date), "EEE, MMM d") : "";
    const header = match
      ? `Availability — vs ${match.opponent}${dateStr ? ` on ${dateStr}` : ""}`
      : "Availability";
    const lines: string[] = [header, ""];
    if (available.length > 0)
      lines.push(
        `✅ Available (${available.length}): ${available.map((p) => p.name).join(", ")}`,
      );
    if (backup.length > 0)
      lines.push(
        `🔵 Backup (${backup.length}): ${backup.map((p) => p.name).join(", ")}`,
      );
    if (unavailable.length > 0)
      lines.push(
        `❌ Unavailable (${unavailable.length}): ${unavailable.map((p) => p.name).join(", ")}`,
      );
    if (notResponded.length > 0)
      lines.push(
        `⏳ No response (${notResponded.length}): ${notResponded.map((p) => p.name).join(", ")}`,
      );
    window.open(
      `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {triggerVariant === "button" ? (
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            Full Squad
          </Button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-green-700 font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                {available.length + backup.length} yes
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {responded.length}/{allPlayers.length} responded
              </span>
            </div>
            <span className="text-xs text-muted-foreground underline underline-offset-2">
              View all
            </span>
          </div>
        )}
      </SheetTrigger>
      <SheetContent className="w-full max-w-md overflow-y-auto px-2 pb-10">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Squad Availability</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {responded.length} of {allPlayers.length} responded · {responseRate}
            % response rate
          </p>
        </SheetHeader>

        <div className="space-y-5">
          {available.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2">
                Available ({available.length})
              </p>
              <div className="space-y-1.5">
                {available.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 border border-green-100"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {backup.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">
                Backup ({backup.length})
              </p>
              <div className="space-y-1.5">
                {backup.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unavailable.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-2">
                Unavailable ({unavailable.length})
              </p>
              <div className="space-y-1.5">
                {unavailable.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notResponded.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                No Response ({notResponded.length})
              </p>
              <div className="space-y-1.5">
                {notResponded.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-muted"
                  >
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {p.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
