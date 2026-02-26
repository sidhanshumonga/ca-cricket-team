"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Trash2,
  Download,
  Share2,
  Maximize,
  Minimize,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
} from "@dnd-kit/core";
import { CricketGround } from "@/components/cricket-ground";

interface Player {
  id: string;
  name: string;
  role: string;
}

interface FieldingPosition {
  id: string;
  playerId: string;
  positionName: string;
  xCoordinate: number;
  yCoordinate: number;
  player: Player;
}

interface FieldingSetup {
  id: string;
  bowlerId: string | null;
  batsmanType: string;
  isPowerplay: boolean;
  name: string | null;
  positions: FieldingPosition[];
}

function DraggablePlayer({ position }: { position: FieldingPosition }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: position.id,
  });

  const style = transform
    ? {
        left: `${position.xCoordinate}%`,
        top: `${position.yCoordinate}%`,
        transform: `translate(-50%, -50%) translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {
        left: `${position.xCoordinate}%`,
        top: `${position.yCoordinate}%`,
        transform: "translate(-50%, -50%)",
      };

  return (
    <div
      ref={setNodeRef}
      className="absolute cursor-move group touch-none"
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className="relative flex flex-col items-center">
        <div
          className="w-3 h-3 border-2 rounded-full shadow-lg group-hover:scale-125 transition-transform"
          style={{ backgroundColor: "#3b82f6", borderColor: "#ffffff" }}
        />
        <div
          className="mt-1 px-1.5 py-0.5 rounded shadow-md"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
        >
          <p
            className="text-[9px] font-semibold whitespace-nowrap"
            style={{ color: "#111827" }}
          >
            {position.player.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FieldingViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [matchId, setMatchId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bowlers, setBowlers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<{
    bowlerId: string | null;
    batsmanType: string;
    isPowerplay: boolean;
  }>({
    bowlerId: null,
    batsmanType: "RHB",
    isPowerplay: false,
  });
  const selectedBowler = filter.bowlerId;
  const batsmanType = filter.batsmanType;
  const isPowerplay = filter.isPowerplay;
  const [currentSetup, setCurrentSetup] = useState<FieldingSetup | null>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [allSetups, setAllSetups] = useState<any[]>([]);
  const fieldRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const captureFieldingSetup = async () => {
    if (!fieldRef.current || !currentSetup) return null;

    try {
      // Create a new canvas
      const canvas = document.createElement("canvas");
      const size = 2000; // High resolution
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      // Draw background
      ctx.fillStyle = "#2d5016";
      ctx.fillRect(0, 0, size, size);

      // Get the SVG element
      const svgElement = fieldRef.current.querySelector("svg");
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            resolve(null);
          };
          img.onerror = reject;
          img.src = url;
        });
      }

      // Draw player positions
      currentSetup.positions.forEach((position: any) => {
        const x = (position.xCoordinate / 100) * size;
        const y = (position.yCoordinate / 100) * size;

        // Draw player dot
        ctx.fillStyle = "#3b82f6";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw player name
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 24px Arial";
        const textWidth = ctx.measureText(position.player.name).width;
        const padding = 8;
        ctx.fillRect(
          x - textWidth / 2 - padding,
          y + 25,
          textWidth + padding * 2,
          32,
        );

        ctx.fillStyle = "#111827";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(position.player.name, x, y + 30);
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Failed to capture:", error);
      return null;
    }
  };

  const handleDownload = async () => {
    const dataUrl = await captureFieldingSetup();
    if (!dataUrl) {
      toast.error("Failed to capture fielding setup");
      return;
    }

    const link = document.createElement("a");
    link.download = `fielding-setup-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Fielding setup downloaded!");
  };

  const handleShare = async () => {
    const dataUrl = await captureFieldingSetup();
    if (!dataUrl) {
      toast.error("Failed to capture fielding setup");
      return;
    }

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], "fielding-setup.png", { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Fielding Setup",
          text: "Check out this fielding setup!",
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback: copy image to clipboard or show WhatsApp option
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    params.then(({ id }) => {
      setMatchId(id);
      loadMatchData(id);
    });
  }, [params]);

  const loadAllSetups = async (id: string) => {
    try {
      const { getMatchFieldingSetups } = await import("@/app/actions/fielding");
      const result = await getMatchFieldingSetups(id);
      if (result.success) setAllSetups(result.setups ?? []);
    } catch {}
  };

  const loadMatchData = async (id: string) => {
    try {
      const { getMatchForTeamSelection } = await import("@/app/actions/team");
      const result = await getMatchForTeamSelection(id);

      if (!result.success || !result.match) {
        router.push("/admin/matches");
        return;
      }

      // Get bowlers from the team (primary or secondary role is Bowler/All-rounder)
      const bowlerRoles = ["Bowler", "All-rounder"];
      const teamBowlers =
        result.currentTeam
          ?.filter(
            (t: any) =>
              !t.isSubstitute &&
              (bowlerRoles.includes(t.player.role) ||
                bowlerRoles.includes(t.player.secondaryRole)),
          )
          .map((t: any) => t.player) || [];

      setBowlers(teamBowlers);
      // Set first bowler as default
      if (teamBowlers.length > 0) {
        setFilter((f) =>
          f.bowlerId ? f : { ...f, bowlerId: teamBowlers[0].id },
        );
      }
      setLoading(false);
      loadAllSetups(id);
    } catch (error) {
      toast.error("Failed to load match data");
      setLoading(false);
    }
  };

  const loadFieldingSetup = async (
    id?: string,
    bowler?: string | null,
    batType?: string,
    powerplay?: boolean,
  ) => {
    const mid = id ?? matchId;
    const bid = bowler !== undefined ? bowler : selectedBowler;
    const bt = batType !== undefined ? batType : batsmanType;
    const pp = powerplay !== undefined ? powerplay : isPowerplay;
    if (!mid) return;
    try {
      const { getFieldingSetup } = await import("@/app/actions/fielding");
      const result = await getFieldingSetup(mid, bid, bt, pp);

      if (result.success && result.setup) {
        setCurrentSetup(result.setup as any);
      } else {
        setCurrentSetup(null);
      }
    } catch (error) {
      toast.error("Failed to load fielding setup");
    }
  };

  const handleGenerate = async () => {
    if (!matchId) {
      toast.error("Match not loaded yet, please wait");
      return;
    }
    if (!selectedBowler) {
      toast.error("Please select a bowler");
      return;
    }

    try {
      const { generateFieldingSetup } = await import("@/app/actions/fielding");
      const result = await generateFieldingSetup(
        matchId,
        selectedBowler,
        batsmanType,
        isPowerplay,
        `${selectedBowler} - ${batsmanType} - ${isPowerplay ? "Powerplay" : "Regular"}`,
      );

      if (result.success) {
        toast.success("Fielding setup generated!");
        await Promise.all([
          loadFieldingSetup(matchId, selectedBowler, batsmanType, isPowerplay),
          loadAllSetups(matchId),
        ]);
      } else {
        toast.error(result.error || "Failed to generate setup");
      }
    } catch (error) {
      toast.error("Failed to generate fielding setup");
    }
  };

  const handleSavePositions = () => {
    if (!currentSetup) {
      toast.error("No setup to save");
      return;
    }

    const positionData = currentSetup.positions.map((p: any) => ({
      name: p.positionName,
      x: Math.round(p.xCoordinate * 10) / 10,
      y: Math.round(p.yCoordinate * 10) / 10,
    }));

    toast.success("Positions logged to console!");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;

    if (!currentSetup || !fieldRef.current) return;

    const position = currentSetup.positions.find(
      (p: any) => p.id === active.id,
    );
    if (!position) return;

    // Get field dimensions
    const fieldRect = fieldRef.current.getBoundingClientRect();
    const fieldWidth = fieldRect.width;
    const fieldHeight = fieldRect.height;

    // Calculate new coordinates (delta is in pixels, convert to percentage)
    const newX = Math.max(
      0,
      Math.min(100, position.xCoordinate + (delta.x / fieldWidth) * 100),
    );
    const newY = Math.max(
      0,
      Math.min(100, position.yCoordinate + (delta.y / fieldHeight) * 100),
    );

    try {
      const { updateFieldingPosition } = await import("@/app/actions/fielding");
      const result = await updateFieldingPosition(position.id, newX, newY);

      if (result.success) {
        // Update local state
        setCurrentSetup({
          ...currentSetup,
          positions: currentSetup.positions.map((p: any) =>
            p.id === position.id
              ? { ...p, xCoordinate: newX, yCoordinate: newY }
              : p,
          ),
        });
      } else {
        toast.error("Failed to update position");
      }
    } catch (error) {
      toast.error("Failed to update position");
    }
  };

  useEffect(() => {
    if (matchId) {
      loadFieldingSetup(
        matchId,
        filter.bowlerId,
        filter.batsmanType,
        filter.isPowerplay,
      );
    }
  }, [matchId, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground">Loading fielding view...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen overlay for mobile */}
      {isFullscreen && currentSetup && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
          {/* Fullscreen header */}
          <div className="flex items-center justify-between p-3 border-b bg-white">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFullscreen(false)}
              >
                <Minimize className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <Badge variant="outline">
                {currentSetup.positions.length} players
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSavePositions}
                className="p-2"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="p-2"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Fullscreen field */}
          <div className="flex-1 p-2 overflow-hidden flex items-center justify-center">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div
                className="relative w-full max-w-full"
                style={{ paddingBottom: "100%" }}
              >
                <div
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{ backgroundColor: "#2d5016" }}
                >
                  <div className="absolute inset-0">
                    <CricketGround className="w-full h-full" />
                  </div>
                  {currentSetup.positions.map((position: any) => (
                    <DraggablePlayer key={position.id} position={position} />
                  ))}
                </div>
              </div>
            </DndContext>
          </div>
        </div>
      )}

      {/* Normal view */}
      <div className="container mx-auto py-4 md:py-6 px-2 md:px-4 space-y-4 md:space-y-6 max-w-screen-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <Link href={`/admin/matches/${matchId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-3xl font-bold">
              Fielding Positions
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Set up fielding positions for different scenarios
            </p>
          </div>
        </div>

        {/* Setup Options */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-lg border bg-card px-4 py-3">
          <Select
            value={selectedBowler || undefined}
            onValueChange={(v) => setFilter((f) => ({ ...f, bowlerId: v }))}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Select bowler" />
            </SelectTrigger>
            <SelectContent>
              {bowlers.map((bowler: any) => (
                <SelectItem key={bowler.id} value={bowler.id}>
                  {bowler.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={batsmanType}
            onValueChange={(v) => setFilter((f) => ({ ...f, batsmanType: v }))}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RHB">Right-Hand Batsman</SelectItem>
              <SelectItem value="LHB">Left-Hand Batsman</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={isPowerplay ? "powerplay" : "regular"}
            onValueChange={(v) =>
              setFilter((f) => ({ ...f, isPowerplay: v === "powerplay" }))
            }
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="powerplay">Powerplay</SelectItem>
              <SelectItem value="regular">Regular Overs</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleGenerate}
            className="w-full sm:w-auto sm:ml-auto shrink-0"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>

        {/* Two-column layout: fielding ground + setups panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          <div className="lg:col-span-2">
            {/* Fielding Ground */}
            <Card>
              <CardHeader className="p-3 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg">
                      Field Positions
                    </CardTitle>
                    <CardDescription className="hidden md:block text-xs md:text-sm">
                      {currentSetup
                        ? "Drag players to adjust positions"
                        : "Generate a setup to start"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    {currentSetup && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSavePositions}
                          className="hidden md:flex"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Positions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDownload}
                          className="hidden md:flex"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleShare}
                          className="hidden md:flex"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        {/* Mobile: Icon only buttons */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSavePositions}
                          className="md:hidden p-2"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDownload}
                          className="md:hidden p-2"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleShare}
                          className="md:hidden p-2"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="md:hidden p-2"
                        >
                          {isFullscreen ? (
                            <Minimize className="h-4 w-4" />
                          ) : (
                            <Maximize className="h-4 w-4" />
                          )}
                        </Button>
                        <Badge
                          variant="outline"
                          className="hidden md:inline-flex"
                        >
                          {currentSetup.positions.length} players
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!currentSetup ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <p className="mb-4">No fielding setup generated yet</p>
                    <p className="text-sm">
                      Select options above and click Generate to create a
                      fielding chart
                    </p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div
                      ref={fieldRef}
                      className="relative w-full rounded-lg overflow-hidden"
                      style={{
                        paddingBottom: "100%",
                        backgroundColor: "#2d5016",
                      }}
                    >
                      {/* SVG Cricket ground - bowling end at bottom, batting at top */}
                      <div className="absolute inset-0">
                        <CricketGround className="w-full h-full" />
                      </div>

                      {/* Player positions */}
                      {currentSetup.positions.map((position: any) => (
                        <DraggablePlayer
                          key={position.id}
                          position={position}
                        />
                      ))}
                    </div>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </div>
          {/* end left column */}

          {/* Right panel: all generated setups */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Generated Setups</CardTitle>
                <CardDescription>
                  {allSetups.length} combo{allSetups.length !== 1 ? "s" : ""}{" "}
                  saved
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {allSetups.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 px-4">
                    No setups yet. Generate one above.
                  </p>
                ) : (
                  <Tabs defaultValue="powerplay" className="w-full">
                    <TabsList className="w-full rounded-none border-b">
                      <TabsTrigger value="powerplay" className="flex-1">
                        Powerplay (
                        {allSetups.filter((s: any) => s.isPowerplay).length})
                      </TabsTrigger>
                      <TabsTrigger value="regular" className="flex-1">
                        Regular (
                        {allSetups.filter((s: any) => !s.isPowerplay).length})
                      </TabsTrigger>
                    </TabsList>
                    {(["powerplay", "regular"] as const).map((tab) => {
                      const isPP = tab === "powerplay";
                      const filtered = allSetups
                        .filter((s: any) => s.isPowerplay === isPP)
                        .sort((a: any, b: any) => {
                          const aName =
                            bowlers.find((p) => p.id === a.bowlerId)?.name ??
                            "";
                          const bName =
                            bowlers.find((p) => p.id === b.bowlerId)?.name ??
                            "";
                          return aName.localeCompare(bName);
                        });
                      return (
                        <TabsContent key={tab} value={tab} className="mt-0">
                          {filtered.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6 px-4">
                              No {tab} setups yet.
                            </p>
                          ) : (
                            <div className="divide-y">
                              {filtered.map((setup: any) => {
                                const bowlerName =
                                  bowlers.find((b) => b.id === setup.bowlerId)
                                    ?.name ?? "Unknown";
                                const isActive =
                                  currentSetup &&
                                  setup.bowlerId === selectedBowler &&
                                  setup.batsmanType === batsmanType &&
                                  setup.isPowerplay === isPowerplay;
                                return (
                                  <button
                                    key={setup.id}
                                    type="button"
                                    onClick={() =>
                                      setFilter({
                                        bowlerId: setup.bowlerId,
                                        batsmanType: setup.batsmanType,
                                        isPowerplay: setup.isPowerplay,
                                      })
                                    }
                                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${isActive ? "bg-muted" : ""}`}
                                  >
                                    <p className="text-sm font-medium">
                                      {bowlerName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {setup.batsmanType === "RHB"
                                        ? "Right-hand"
                                        : "Left-hand"}{" "}
                                      · {setup.positions?.length ?? 0} positions
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
          {/* end right column */}
        </div>
        {/* end grid */}
      </div>
    </>
  );
}
