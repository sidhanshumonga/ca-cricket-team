import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    railwayUrl: process.env.RAILWAY_SCRAPER_URL || 'NOT SET',
    hasRailwayUrl: !!process.env.RAILWAY_SCRAPER_URL,
  });
}
