"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Player } from "@/lib/types/models";

const NONE = "__none__";

const roleOptions = ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];
const battingStyleOptions = ["Right-hand bat", "Left-hand bat"];
const bowlingStyleOptions = [
  "Right-arm fast",
  "Right-arm medium",
  "Right-arm off-spin",
  "Right-arm leg-spin",
  "Left-arm fast",
  "Left-arm medium",
  "Left-arm chinaman",
  "Left-arm orthodox",
];
const battingPositionOptions = [
  "Opening",
  "Top order (3-4)",
  "Middle order (5-6)",
  "Lower order (7-8)",
  "Tailender (9-11)",
];
const fieldingPositionOptions = [
  "Slip",
  "Gully",
  "Point",
  "Cover",
  "Mid-off",
  "Mid-on",
  "Square leg",
  "Fine leg",
  "Third man",
  "Long-off",
  "Long-on",
  "Mid-wicket",
  "Silly point",
  "Short leg",
  "Deep square leg",
  "Deep mid-wicket",
  "Deep cover",
  "Wicketkeeper",
];

interface PlayerProfileEditSheetProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayerProfileEditSheet({
  player,
  open,
  onOpenChange,
}: PlayerProfileEditSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Partial<Player>>({
    role: player.role || "",
    secondaryRole: player.secondaryRole || "",
    battingStyle: player.battingStyle || "",
    bowlingStyle: player.bowlingStyle || "",
    battingPosition: player.battingPosition || "",
    defaultFieldingPosition: player.defaultFieldingPosition || "",
    notes: player.notes || "",
    jerseyNumber: player.jerseyNumber ?? undefined,
  });

  const set = (key: keyof Player) => (v: string) =>
    setFormData((prev) => ({ ...prev, [key]: v === NONE ? "" : v }));

  const val = (key: keyof Player) => (formData[key] as string) || NONE;

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/player/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: player.id, playerData: formData }),
        });
        const result = await response.json();
        if (result.success) {
          onOpenChange(false);
          router.refresh();
        } else {
          console.error(result.error || "Failed to update profile");
        }
      } catch {
        console.error("Failed to update profile");
      }
    });
  };

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </p>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-md p-0"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Edit Profile</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Roles */}
          <div>
            <SectionHeading>Roles</SectionHeading>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Primary Role</Label>
                <Select value={val("role")} onValueChange={set("role")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {roleOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secondary Role</Label>
                <Select
                  value={val("secondaryRole")}
                  onValueChange={set("secondaryRole")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {roleOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Batting */}
          <div>
            <SectionHeading>Batting</SectionHeading>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Batting Style</Label>
                <Select
                  value={val("battingStyle")}
                  onValueChange={set("battingStyle")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {battingStyleOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batting Position</Label>
                <Select
                  value={val("battingPosition")}
                  onValueChange={set("battingPosition")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {battingPositionOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bowling & Fielding */}
          <div>
            <SectionHeading>Bowling & Fielding</SectionHeading>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Bowling Style</Label>
                <Select
                  value={val("bowlingStyle")}
                  onValueChange={set("bowlingStyle")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {bowlingStyleOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fielding Position</Label>
                <Select
                  value={val("defaultFieldingPosition")}
                  onValueChange={set("defaultFieldingPosition")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {fieldingPositionOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Jersey Number */}
          <div className="space-y-2">
            <SectionHeading>Jersey Number</SectionHeading>
            <Input
              type="number"
              min={0}
              max={99}
              placeholder="e.g. 7"
              value={formData.jerseyNumber ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  jerseyNumber:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <SectionHeading>Notes</SectionHeading>
            <Textarea
              placeholder="Add any notes about your playing preferences..."
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
            />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t flex flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
