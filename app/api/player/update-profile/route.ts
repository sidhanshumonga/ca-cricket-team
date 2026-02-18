import { NextRequest, NextResponse } from "next/server";
import { updatePlayerProfile } from "@/app/actions/update-player-profile";

export async function POST(request: NextRequest) {
  try {
    const { playerId, playerData } = await request.json();

    if (!playerId || !playerData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await updatePlayerProfile(playerId, playerData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
