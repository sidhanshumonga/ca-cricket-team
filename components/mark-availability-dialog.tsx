"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getPlayers } from "@/app/actions/player";
import { markSeasonAvailability } from "@/app/actions/season";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface MarkAvailabilityDialogProps {
  seasonId: string;
}

export function MarkAvailabilityDialog({
  seasonId,
}: MarkAvailabilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      getPlayers().then(setPlayers);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedPlayer) return;

    setLoading(true);
    try {
      await markSeasonAvailability(
        selectedPlayer,
        seasonId,
        status,
        undefined,
        notes,
      );
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setSelectedPlayer("");
        setStatus("AVAILABLE");
        setNotes("");
      }, 1500);
    } catch (error) {
      console.error("Failed to mark availability:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Mark My Availability</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Season Availability</DialogTitle>
          <DialogDescription>
            Select your name and mark your availability for the season
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-semibold text-green-700">
              Availability Marked!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player">Select Your Name</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger id="player">
                  <SelectValue placeholder="Choose your name" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} - {player.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Availability Status</Label>
              <RadioGroup value={status} onValueChange={setStatus}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AVAILABLE" id="available" />
                  <Label
                    htmlFor="available"
                    className="font-normal cursor-pointer"
                  >
                    ✅ Available for entire season
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="UNAVAILABLE" id="unavailable" />
                  <Label
                    htmlFor="unavailable"
                    className="font-normal cursor-pointer"
                  >
                    ❌ Not available
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BACKUP" id="backup" />
                  <Label
                    htmlFor="backup"
                    className="font-normal cursor-pointer"
                  >
                    👤 Available as backup
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedPlayer || loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Availability"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
