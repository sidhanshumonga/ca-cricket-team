"use client";

import Link from "next/link";
import { Shield, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    // Check if player is selected on mount
    const savedPlayer = localStorage.getItem("selectedPlayer");
    if (savedPlayer) {
      setSelectedPlayer(savedPlayer);
    }

    // Listen for localStorage changes (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedPlayer") {
        setSelectedPlayer(e.newValue);
      }
    };

    // Listen for custom events (same-tab navigation)
    const handlePlayerSelected = (e: any) => {
      setSelectedPlayer(e.detail);
    };

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

    window.addEventListener("storage", handleStorageChange);
    (window as any).addEventListener("playerSelected", handlePlayerSelected);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      (window as any).removeEventListener(
        "playerSelected",
        handlePlayerSelected,
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("selectedPlayer");
    setSelectedPlayer(null);
    window.location.href = "/player";
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-xl font-bold block">Cary Avengers</span>
              <span className="text-xs text-gray-600">Division 8</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
            {selectedPlayer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
