"use client";

import { createPlayer } from "@/app/actions/player";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { Plus } from "lucide-react";
import { useTransition, useState } from "react";
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

export function AddPlayerSheet() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createPlayer(formData);
      if (result.success) {
        toast.success("Player added successfully");
        setOpen(false);
      } else {
        toast.error("Failed to add player");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Player</SheetTitle>
          <SheetDescription>
            Add a new player to your team roster.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required placeholder="e.g. John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Primary Role</Label>
            <Select name="role" required>
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
            <Select name="secondaryRole">
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
            <Select name="battingStyle">
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
            <Select name="bowlingStyle">
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
            <Select name="battingPosition">
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
            <Select name="defaultFieldingPosition">
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
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCaptain"
                name="isCaptain"
                className="h-4 w-4 rounded border-gray-300"
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
              {isPending ? "Saving..." : "Save Player"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
