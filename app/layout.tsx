"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { metadata } from "./metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Parse player session from localStorage
const getPlayerFromSession = () => {
  const sessionData = localStorage.getItem("selectedPlayer");
  if (sessionData) {
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }
  return null;
};

// Note: Metadata export moved to separate file due to client component directive

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  // Check sessions and redirect appropriately
  useEffect(() => {
    const playerSession = localStorage.getItem("selectedPlayer");

    // Skip redirect checks for login pages
    if (pathname === "/admin/login" || pathname === "/player") {
      return;
    }

    // Player session logic (only if no admin session)
    if (playerSession) {
      // Check if admin is viewing player (bypass redirect)
      const adminViewingPlayer =
        localStorage.getItem("adminViewingPlayer") === "true";

      // If user has player session and is on home page, redirect to player profile
      if (pathname === "/") {
        const playerData = getPlayerFromSession();
        if (playerData && !adminViewingPlayer) {
          router.replace(`/player/${playerData.id}`);
          return;
        }
      }

      // If user has player session and is on player page, redirect to player profile
      if (pathname === "/player") {
        const playerData = getPlayerFromSession();
        if (playerData && !adminViewingPlayer) {
          router.replace(`/player/${playerData.id}`);
          return;
        }
      }
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
