"use client";

import { getPlayers } from "@/app/actions/player";
import {
  getActiveSeason,
  getAllSeasonAvailability,
} from "@/app/actions/season";
import { AddPlayerSheet } from "@/components/add-player-sheet";
import { EditPlayerSheet } from "@/components/edit-player-sheet";
import { DeletePlayerButton } from "@/components/delete-player-button";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [availability, setAvailability] = useState<Record<string, any>>({});
  const [activeSeason, setActiveSeason] = useState<any>(null);

  const loadPlayers = async () => {
    const playersData = await getPlayers();
    setPlayers(playersData);

    // Fetch active season and availability for all players in one query
    const season = await getActiveSeason();
    setActiveSeason(season);

    if (season) {
      const availabilityMap = await getAllSeasonAvailability(season.id);
      setAvailability(availabilityMap);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleEdit = (playerId: string) => {
    const player = players.find((p: any) => p.id === playerId);
    if (player) {
      setEditingPlayer(player);
      setEditSheetOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Players</h1>
        <AddPlayerSheet />
      </div>

      {/* Mobile View - Compact List */}
      <div className="md:hidden space-y-2">
        {players.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              No players found. Add your first player.
            </CardContent>
          </Card>
        ) : (
          players.map((player: any) => {
            const playerAvailability = availability[player.id];
            return (
              <Card key={player.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{player.name}</h3>
                      {player.isCaptain && (
                        <Badge variant="default" className="text-xs h-5">
                          C
                        </Badge>
                      )}
                      {player.isViceCaptain && (
                        <Badge variant="secondary" className="text-xs h-5">
                          VC
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs mb-1.5">
                      <Badge variant="outline" className="h-5">
                        {player.role}
                      </Badge>
                      {player.secondaryRole && (
                        <Badge variant="secondary" className="h-5">
                          {player.secondaryRole}
                        </Badge>
                      )}
                      {playerAvailability && (
                        <Badge
                          variant={
                            playerAvailability.status === "AVAILABLE"
                              ? "default"
                              : playerAvailability.status === "BACKUP"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            playerAvailability.status === "AVAILABLE"
                              ? "bg-green-600 h-5"
                              : playerAvailability.status === "BACKUP"
                                ? "bg-blue-600 text-white h-5"
                                : "h-5"
                          }
                        >
                          {playerAvailability.status === "AVAILABLE"
                            ? "Available"
                            : playerAvailability.status === "BACKUP"
                              ? "Backup"
                              : "Unavailable"}
                        </Badge>
                      )}
                    </div>
                    {(player.battingStyle || player.bowlingStyle) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {player.battingStyle && player.battingStyle}
                        {player.battingStyle && player.bowlingStyle && " • "}
                        {player.bowlingStyle && player.bowlingStyle}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(player.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DeletePlayerButton id={player.id} />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
          <CardDescription>
            Manage your team players and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Primary Role</TableHead>
                <TableHead>Secondary Role</TableHead>
                <TableHead>Season Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No players found. Add your first player.
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player: any) => {
                  const playerAvailability = availability[player.id];
                  return (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{player.name}</span>
                          {player.isCaptain && (
                            <Badge variant="default" className="text-xs">
                              C
                            </Badge>
                          )}
                          {player.isViceCaptain && (
                            <Badge variant="secondary" className="text-xs">
                              VC
                            </Badge>
                          )}
                        </div>
                        {(player.battingStyle || player.bowlingStyle) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {player.battingStyle && (
                              <span>{player.battingStyle}</span>
                            )}
                            {player.battingStyle && player.bowlingStyle && (
                              <span> • </span>
                            )}
                            {player.bowlingStyle && (
                              <span>{player.bowlingStyle}</span>
                            )}
                          </div>
                        )}
                        {player.notes && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">
                            {player.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.role}</Badge>
                        {player.battingPosition && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {player.battingPosition}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {player.secondaryRole ? (
                          <Badge variant="secondary">
                            {player.secondaryRole}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {playerAvailability ? (
                          <Badge
                            variant={
                              playerAvailability.status === "AVAILABLE"
                                ? "default"
                                : playerAvailability.status === "BACKUP"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              playerAvailability.status === "AVAILABLE"
                                ? "bg-green-600"
                                : playerAvailability.status === "BACKUP"
                                  ? "bg-blue-600 text-white"
                                  : ""
                            }
                          >
                            {playerAvailability.status === "AVAILABLE"
                              ? "Available"
                              : playerAvailability.status === "BACKUP"
                                ? "Backup"
                                : "Unavailable"}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Not marked
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEdit(player.id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <DeletePlayerButton id={player.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Player Sheet */}
      {editingPlayer && (
        <EditPlayerSheet
          player={editingPlayer}
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          onSuccess={loadPlayers}
        />
      )}
    </div>
  );
}
