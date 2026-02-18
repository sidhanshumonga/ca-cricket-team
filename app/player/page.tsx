"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getPlayers } from "@/app/actions/player";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function PlayerLogin() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load selected player from localStorage on mount
    const savedPlayer = localStorage.getItem("selectedPlayer");
    if (savedPlayer) {
      setSelectedPlayer(savedPlayer);
    }

    getPlayers().then((data) => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPlayer) {
      // Find full player object
      const player = players.find((p) => p.id === selectedPlayer);

      if (player) {
        // Save full player object to localStorage
        localStorage.setItem("selectedPlayer", JSON.stringify(player));

        // Dispatch custom event to notify layout immediately
        (window as any).dispatchEvent(
          new CustomEvent("playerSelected", { detail: player }),
        );

        router.push(`/player/${selectedPlayer}`);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-40">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <p className="text-lg text-muted-foreground">
            Select your name to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-3">
            <Select
              value={selectedPlayer}
              onValueChange={setSelectedPlayer}
              disabled={loading}
            >
              <SelectTrigger className="h-12 min-h-12 max-h-12 w-full md:flex-1">
                <SelectValue
                  placeholder={
                    loading ? "Loading players..." : "Select your name"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {players.map((player: any) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} - {player.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="h-12 min-h-12 max-h-12 w-full md:w-auto"
              disabled={!selectedPlayer || loading}
              type="submit"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
