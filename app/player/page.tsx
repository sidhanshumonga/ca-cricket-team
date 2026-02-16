"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { getPlayers } from "@/app/actions/player";
import { useRouter } from "next/navigation";

export default function PlayerLogin() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const router = useRouter();

  useEffect(() => {
    getPlayers().then(setPlayers);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPlayer) {
      router.push(`/player/${selectedPlayer}`);
    }
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[50vh]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Access Availability</CardTitle>
          <CardDescription>
            Select your name to manage your availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="player">Select Your Name</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your name" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player: any) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} - {player.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={!selectedPlayer}>
              Continue
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Select your name from the team roster.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
