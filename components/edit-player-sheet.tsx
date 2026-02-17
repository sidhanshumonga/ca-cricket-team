"use client";

import { updatePlayer } from "@/app/actions/player";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { FIELDING_POSITIONS } from "@/lib/types/fielding";

const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];
const BATTING_STYLES = ["Right-handed", "Left-handed"];
const BOWLING_STYLES = [
  "Right-arm fast",
  "Left-arm fast",
  "Right-arm medium",
  "Left-arm medium",
  "Right-arm spin",
  "Left-arm spin",
  "Leg-spin",
  "Off-spin",
];
const BATTING_POSITIONS = ["Top-order", "Middle-order", "Lower-order"];

interface EditPlayerSheetProps {
  player: {
    id: string;
    name: string;
    role: string;
    secondaryRole: string | null;
    battingStyle: string | null;
    bowlingStyle: string | null;
    battingPosition: string | null;
    defaultFieldingPosition: string | null;
    isCaptain: boolean;
    isViceCaptain: boolean;
    notes: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPlayerSheet({
  player,
  open,
  onOpenChange,
  onSuccess,
}: EditPlayerSheetProps) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updatePlayer(player.id, formData);
      if (result.success) {
        toast.success("Player updated successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error("Failed to update player");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Player</SheetTitle>
          <SheetDescription>
            Update player information for {player.name}.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. John Doe"
              defaultValue={player.name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Primary Role</Label>
            <Select name="role" required defaultValue={player.role}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="secondaryRole">Secondary Role (Optional)</Label>
            <Select
              name="secondaryRole"
              defaultValue={player.secondaryRole || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="battingStyle">Batting Style (Optional)</Label>
            <Select
              name="battingStyle"
              defaultValue={player.battingStyle || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batting style" />
              </SelectTrigger>
              <SelectContent>
                {BATTING_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bowlingStyle">Bowling Style (Optional)</Label>
            <Select
              name="bowlingStyle"
              defaultValue={player.bowlingStyle || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bowling style" />
              </SelectTrigger>
              <SelectContent>
                {BOWLING_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="battingPosition">Batting Position (Optional)</Label>
            <Select
              name="battingPosition"
              defaultValue={player.battingPosition || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {BATTING_POSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="defaultFieldingPosition">
              Default Fielding Position (Optional)
            </Label>
            <Select
              name="defaultFieldingPosition"
              defaultValue={player.defaultFieldingPosition || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fielding position" />
              </SelectTrigger>
              <SelectContent>
                {FIELDING_POSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special notes about the player..."
              defaultValue={player.notes || ""}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCaptain"
                name="isCaptain"
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked={player.isCaptain}
              />
              <Label htmlFor="isCaptain" className="font-normal cursor-pointer">
                Captain
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isViceCaptain"
                name="isViceCaptain"
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked={player.isViceCaptain}
              />
              <Label
                htmlFor="isViceCaptain"
                className="font-normal cursor-pointer"
              >
                Vice-Captain
              </Label>
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Player"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
