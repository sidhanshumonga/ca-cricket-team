"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2 } from "lucide-react";
import { Player } from "@/lib/types/models";
import { PlayerProfileEditSheet } from "@/components/player-profile-edit-sheet";

interface PlayerProfileCardProps {
  player: Player;
  onUpdate?: (updatedPlayer: Partial<Player>) => void;
}

export function PlayerProfileCard({ player }: PlayerProfileCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const Field = ({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {value ? (
        <Badge variant="secondary" className="font-normal">
          {value}
        </Badge>
      ) : (
        <p className="text-sm text-muted-foreground italic">Not set</p>
      )}
    </div>
  );

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </p>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Playing Preferences</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSheetOpen(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </div>

        {/* Roles */}
        <div>
          <SectionHeading>Roles</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Primary Role" value={player.role} />
            <Field label="Secondary Role" value={player.secondaryRole} />
          </div>
        </div>

        {/* Batting */}
        <div>
          <SectionHeading>Batting</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Style" value={player.battingStyle} />
            <Field label="Position" value={player.battingPosition} />
          </div>
        </div>

        {/* Bowling & Fielding */}
        <div>
          <SectionHeading>Bowling & Fielding</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Bowling Style" value={player.bowlingStyle} />
            <Field
              label="Fielding Position"
              value={player.defaultFieldingPosition}
            />
          </div>
        </div>

        {/* Notes */}
        {player.notes && (
          <div>
            <SectionHeading>Notes</SectionHeading>
            <p className="text-sm bg-muted/50 rounded-md p-3 leading-relaxed">
              {player.notes}
            </p>
          </div>
        )}
      </div>

      <PlayerProfileEditSheet
        player={player}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
