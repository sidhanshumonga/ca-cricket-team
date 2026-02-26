"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMatch } from "@/app/actions/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditMatchDialogProps {
  match: {
    id: string;
    date: string | Date;
    matchTime?: string | null;
    opponent: string;
    location: string;
    type: string;
  };
  onUpdated?: () => void;
}

export function EditMatchDialog({ match, onUpdated }: EditMatchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState(match.type);

  const matchDate = new Date(match.date);
  const defaultDate = format(matchDate, "yyyy-MM-dd");
  const defaultTime = match.matchTime || format(matchDate, "HH:mm");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);

    startTransition(async () => {
      const result = await updateMatch(match.id, formData);
      if (result.success) {
        toast.success("Match updated");
        setOpen(false);
        router.refresh();
        onUpdated?.();
      } else {
        toast.error("Failed to update match");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="opponent">Opponent Team</Label>
            <Input
              id="opponent"
              name="opponent"
              required
              defaultValue={match.opponent}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={defaultDate} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Match Time</Label>
              <Input id="time" name="time" type="time" required defaultValue={defaultTime} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Ground / Location</Label>
            <Input
              id="location"
              name="location"
              required
              defaultValue={match.location}
            />
          </div>

          <div className="grid gap-2">
            <Label>Match Type</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="League">League Match</SelectItem>
                <SelectItem value="Friendly">Friendly Match</SelectItem>
                <SelectItem value="Tournament">Tournament</SelectItem>
                <SelectItem value="Practice">Practice Match</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
