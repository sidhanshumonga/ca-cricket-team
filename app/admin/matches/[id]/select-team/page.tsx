"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GripVertical, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Player {
  id: string;
  name: string;
  role: string;
  secondaryRole: string | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

interface Availability {
  id: string;
  status: string;
  player: Player;
}

interface Match {
  id: string;
  opponent: string;
  date: Date;
  location: string;
}

interface TeamSelectionPageProps {
  params: Promise<{ id: string }>;
}

function SortablePlayer({
  player,
  onRemove,
  isSubstitute,
}: {
  player: Player;
  onRemove: () => void;
  isSubstitute?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{player.name}</span>
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
          {isSubstitute && (
            <Badge variant="outline" className="text-xs">
              Sub
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {player.role}
          {player.secondaryRole && ` • ${player.secondaryRole}`}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-destructive hover:text-destructive"
      >
        Remove
      </Button>
    </div>
  );
}

export default function TeamSelectionPage({ params }: TeamSelectionPageProps) {
  const router = useRouter();
  const [matchId, setMatchId] = useState<string>("");
  const [match, setMatch] = useState<Match | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [substitutes, setSubstitutes] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    params.then(({ id }) => {
      setMatchId(id);
      loadMatchData(id);
    });
  }, [params]);

  const loadMatchData = async (id: string) => {
    try {
      const { getMatchForTeamSelection } = await import("@/app/actions/team");
      const result = await getMatchForTeamSelection(id);

      if (!result.success) {
        toast.error(result.error || "Failed to load match data");
        setLoading(false);
        return;
      }

      if (result.match) setMatch(result.match);
      if (result.allPlayers) setAllPlayers(result.allPlayers);
      if (result.availability) setAvailability(result.availability);

      // Load existing team selection
      if (result.currentTeam) {
        const playingXI = result.currentTeam.filter(
          (t: any) => !t.isSubstitute,
        );
        const subs = result.currentTeam.filter((t: any) => t.isSubstitute);

        setSelectedPlayers(playingXI.map((t: any) => t.player));
        setSubstitutes(subs.map((t: any) => t.player));
      }

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load match data");
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedPlayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addToTeam = (player: Player) => {
    if (selectedPlayers.length >= 11) {
      toast.error("Maximum 11 players can be selected");
      return;
    }
    setSelectedPlayers([...selectedPlayers, player]);
  };

  const removeFromTeam = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((p: any) => p.id !== playerId));
  };

  const addSubstitute = (player: Player) => {
    if (substitutes.length >= 4) {
      toast.error("Maximum 4 substitutes can be selected");
      return;
    }
    setSubstitutes([...substitutes, player]);
  };

  const removeSubstitute = (playerId: string) => {
    setSubstitutes(substitutes.filter((p: any) => p.id !== playerId));
  };

  const getAvailabilityStatus = (playerId: string) => {
    const avail = availability.find((a: any) => a.player.id === playerId);
    return avail?.status.toUpperCase() || "NOT_RESPONDED";
  };

  const getAvailabilityIndicator = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <div
            className="h-2 w-2 rounded-full bg-green-600"
            title="Available"
          />
        );
      case "BACKUP":
        return (
          <div className="h-2 w-2 rounded-full bg-blue-600" title="Backup" />
        );
      case "UNAVAILABLE":
        return (
          <div
            className="h-2 w-2 rounded-full bg-red-600"
            title="Unavailable"
          />
        );
      default:
        return (
          <div
            className="h-2 w-2 rounded-full bg-gray-300"
            title="Not Responded"
          />
        );
    }
  };

  const availablePlayers = allPlayers.filter(
    (p: any) => getAvailabilityStatus(p.id) === "AVAILABLE",
  );

  const canFinalize =
    availablePlayers.filter((p: any) =>
      selectedPlayers.some((sp: any) => sp.id === p.id),
    ).length >= 8;

  const handleFinalize = async () => {
    if (!canFinalize) {
      toast.error("You need at least 8 available players to finalize the team");
      return;
    }

    try {
      const { saveTeamSelection } = await import("@/app/actions/team");

      const selectedPlayersData = selectedPlayers.map(
        (player: any, index: number) => ({
          id: player.id,
          battingOrder: index + 1,
        }),
      );

      const substitutesData = substitutes.map((player: any) => ({
        id: player.id,
      }));

      const result = await saveTeamSelection(
        matchId,
        selectedPlayersData,
        substitutesData,
      );

      if (result.success) {
        toast.success("Team selection saved successfully");
        router.push(`/admin/matches/${matchId}`);
      } else {
        toast.error(result.error || "Failed to save team selection");
      }
    } catch (error) {
      toast.error("Failed to save team selection");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading match data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Link href={`/admin/matches/${matchId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">
            Select Team {match && `vs ${match.opponent}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder batting lineup • Minimum 8 available players
            required
          </p>
        </div>
      </div>

      {!canFinalize && selectedPlayers.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            Need 8 available players • Currently:{" "}
            {
              availablePlayers.filter((p: any) =>
                selectedPlayers.some((sp: any) => sp.id === p.id),
              ).length
            }{" "}
            available
          </p>
        </div>
      )}

      {/* Mobile Preview Button - Always visible, sticky at bottom */}
      {!showMobilePreview && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
          <Button
            onClick={() => setShowMobilePreview(true)}
            className="w-full"
            size="lg"
            disabled={selectedPlayers.length < 8}
          >
            {selectedPlayers.length < 8
              ? `Select ${8 - selectedPlayers.length} more player${8 - selectedPlayers.length === 1 ? "" : "s"} (${selectedPlayers.length}/8)`
              : `Preview Team (${selectedPlayers.length} selected)`}
          </Button>
        </div>
      )}

      {/* Mobile View - Squad Selection or Preview */}
      <div className="lg:hidden">
        {!showMobilePreview ? (
          // Squad Selection View
          <Card>
            <CardHeader>
              <CardTitle>Full Squad ({allPlayers.length})</CardTitle>
              <CardDescription>
                Select at least 8 players to preview your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 pb-20">
                {allPlayers.map((player: any) => {
                  const status = getAvailabilityStatus(player.id);
                  const isSelected = selectedPlayers.some(
                    (p: any) => p.id === player.id,
                  );
                  const isSubstitute = substitutes.some(
                    (p: any) => p.id === player.id,
                  );
                  const isUnavailable = status === "UNAVAILABLE";

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        isUnavailable ? "opacity-50 bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getAvailabilityIndicator(status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">
                              {player.name}
                            </span>
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
                          <p className="text-xs text-muted-foreground truncate">
                            {player.role}
                            {player.secondaryRole &&
                              ` • ${player.secondaryRole}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!isSelected && !isSubstitute && (
                          <>
                            <Button
                              size="sm"
                              variant={
                                selectedPlayers.length < 11
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => addToTeam(player)}
                              disabled={
                                selectedPlayers.length >= 11 || isUnavailable
                              }
                              className="text-xs px-2"
                            >
                              {selectedPlayers.length < 11 ? "Add" : "Full"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addSubstitute(player)}
                              disabled={
                                substitutes.length >= 4 || isUnavailable
                              }
                              className="text-xs px-2"
                            >
                              Sub
                            </Button>
                          </>
                        )}
                        {isSelected && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromTeam(player.id)}
                            className="text-xs px-2"
                          >
                            Remove
                          </Button>
                        )}
                        {isSubstitute && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSubstitute(player.id)}
                            className="text-xs px-2"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Preview View
          <div className="space-y-4 pb-20">
            <Card>
              <CardHeader>
                <CardTitle>Playing XI ({selectedPlayers.length}/11)</CardTitle>
                <CardDescription>
                  Drag to reorder batting lineup
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPlayers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No players selected yet</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedPlayers.map((p: any) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {selectedPlayers.map((player: any, index: number) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-2"
                          >
                            <span className="text-sm font-bold text-muted-foreground w-6">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <SortablePlayer
                                player={player}
                                onRemove={() => removeFromTeam(player.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>

            {substitutes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Substitutes ({substitutes.length}/4)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {substitutes.map((player: any) => (
                      <SortablePlayer
                        key={player.id}
                        player={player}
                        onRemove={() => removeSubstitute(player.id)}
                        isSubstitute
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMobilePreview(false)}
                  className="flex-1"
                >
                  Back to Squad
                </Button>
                <Button
                  onClick={handleFinalize}
                  disabled={!canFinalize}
                  className="flex-1"
                >
                  Finalize Team
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View - Side by Side */}
      <div className="hidden lg:grid gap-6 lg:grid-cols-2">
        {/* Selected Team */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Playing XI ({selectedPlayers.length}/11)</CardTitle>
              <CardDescription>Drag to reorder batting lineup</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No players selected yet</p>
                  <p className="text-xs">Select players from the squad below</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedPlayers.map((p: any) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedPlayers.map((player: any, index: number) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-2"
                        >
                          <span className="text-sm font-bold text-muted-foreground w-6">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <SortablePlayer
                              player={player}
                              onRemove={() => removeFromTeam(player.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {/* Substitutes */}
          <Card>
            <CardHeader>
              <CardTitle>Substitutes ({substitutes.length}/4)</CardTitle>
              <CardDescription>
                Select up to 4 substitute players
              </CardDescription>
            </CardHeader>
            <CardContent>
              {substitutes.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No substitutes selected
                </div>
              ) : (
                <div className="space-y-2">
                  {substitutes.map((player: any) => (
                    <SortablePlayer
                      key={player.id}
                      player={player}
                      onRemove={() => removeSubstitute(player.id)}
                      isSubstitute
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleFinalize}
              disabled={!canFinalize}
              className="flex-1"
            >
              Finalize Team
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/matches/${matchId}`)}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Full Squad */}
        <Card>
          <CardHeader>
            <CardTitle>Full Squad ({allPlayers.length})</CardTitle>
            <CardDescription>Select players to add to the team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allPlayers.map((player: any) => {
                const status = getAvailabilityStatus(player.id);
                const isSelected = selectedPlayers.some(
                  (p: any) => p.id === player.id,
                );
                const isSubstitute = substitutes.some(
                  (p: any) => p.id === player.id,
                );
                const isUnavailable = status === "UNAVAILABLE";

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      isUnavailable ? "opacity-50 bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getAvailabilityIndicator(status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{player.name}</span>
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
                        <p className="text-xs text-muted-foreground">
                          {player.role}
                          {player.secondaryRole && ` • ${player.secondaryRole}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-[240px] justify-end">
                      {!isSelected && !isSubstitute && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToTeam(player)}
                            disabled={
                              selectedPlayers.length >= 11 || isUnavailable
                            }
                            className="w-[100px]"
                          >
                            Add to XI
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addSubstitute(player)}
                            disabled={substitutes.length >= 4 || isUnavailable}
                            className="w-[110px]"
                          >
                            Add as Sub
                          </Button>
                        </>
                      )}
                      {isSelected && (
                        <span className="text-xs text-muted-foreground px-2 py-1 w-full text-center">
                          In Playing XI
                        </span>
                      )}
                      {isSubstitute && (
                        <span className="text-xs text-muted-foreground px-2 py-1 w-full text-center">
                          Substitute
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
