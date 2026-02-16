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
  const [selectedBowler, setSelectedBowler] = useState<string | null>(null);
  const [batsmanType, setBatsmanType] = useState<string>("RHB");
  const [isPowerplay, setIsPowerplay] = useState<boolean>(false);
  const [currentSetup, setCurrentSetup] = useState<FieldingSetup | null>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
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

  const loadMatchData = async (id: string) => {
    try {
      const { getMatchForTeamSelection } = await import("@/app/actions/team");
      const result = await getMatchForTeamSelection(id);

      if (!result.success || !result.match) {
        router.push("/admin/matches");
        return;
      }

      // Get bowlers from the team
      const teamBowlers =
        result.currentTeam
          ?.filter(
            (t: any) =>
              !t.isSubstitute &&
              (t.player.role === "Bowler" || t.player.role === "All-rounder"),
          )
          .map((t: any) => t.player) || [];

      setBowlers(teamBowlers);
      // Set first bowler as default
      if (teamBowlers.length > 0 && !selectedBowler) {
        setSelectedBowler(teamBowlers[0].id);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load match data");
      setLoading(false);
    }
  };

  const loadFieldingSetup = async () => {
    try {
      const { getFieldingSetup } = await import("@/app/actions/fielding");
      const result = await getFieldingSetup(
        matchId,
        selectedBowler,
        batsmanType,
        isPowerplay,
      );

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
    if (!selectedBowler) {
      toast.error("Please select a bowler");
      return;
    }

    try {
      console.log("Generate clicked", {
        matchId,
        selectedBowler,
        batsmanType,
        isPowerplay,
      });
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
        loadFieldingSetup();
      } else {
        toast.error(result.error || "Failed to generate setup");
      }
    } catch (error) {
      console.error("Generate error:", error);
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
      loadFieldingSetup();
    }
  }, [matchId, selectedBowler, batsmanType, isPowerplay]);

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
      <div className="container mx-auto py-4 md:py-6 px-2 md:px-4 space-y-4 md:space-y-6">
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
        <Card>
          <CardHeader>
            <CardTitle>Setup Options</CardTitle>
            <CardDescription>
              Generate fielding positions based on bowler, batsman type, and
              match situation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bowler *</label>
                <Select
                  value={selectedBowler || undefined}
                  onValueChange={setSelectedBowler}
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Batsman Type</label>
                <Select value={batsmanType} onValueChange={setBatsmanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RHB">Right-Hand Batsman</SelectItem>
                    <SelectItem value="LHB">Left-Hand Batsman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Match Situation</label>
                <Select
                  value={isPowerplay ? "powerplay" : "regular"}
                  onValueChange={(v) => setIsPowerplay(v === "powerplay")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="powerplay">Powerplay</SelectItem>
                    <SelectItem value="regular">Regular Overs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end col-span-2 md:col-span-1">
                <Button onClick={handleGenerate} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fielding Ground */}
        <Card className="md:max-w-2xl md:mx-auto">
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
                    <Badge variant="outline" className="hidden md:inline-flex">
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
                  Select options above and click Generate to create a fielding
                  chart
                </p>
              </div>
            ) : (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div
                  ref={fieldRef}
                  className="relative w-full rounded-lg overflow-hidden"
                  style={{ paddingBottom: "100%", backgroundColor: "#2d5016" }}
                >
                  {/* SVG Cricket ground - bowling end at bottom, batting at top */}
                  <div className="absolute inset-0">
                    <CricketGround className="w-full h-full" />
                  </div>

                  {/* Player positions */}
                  {currentSetup.positions.map((position: any) => (
                    <DraggablePlayer key={position.id} position={position} />
                  ))}
                </div>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Position List - Hidden on mobile */}
        {currentSetup && (
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {currentSetup.positions.map((position: any) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {position.player.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {position.positionName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {position.player.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
