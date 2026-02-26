"use client";

import Link from "next/link";
import {
  Shield,
  LogOut,
  Menu,
  User,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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

    setSelectedPlayer(getPlayerFromSession());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedPlayer") {
        setSelectedPlayer(getPlayerFromSession());
      }
    };

    const handlePlayerSelected = () => {
      setSelectedPlayer(getPlayerFromSession());
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
    router.push("/player");
  };

  if (pathname === "/player") {
    return <>{children}</>;
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="grid gap-2 p-4">
      {selectedPlayer && (
        <Link
          href={`/player/${selectedPlayer.id}`}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === `/player/${selectedPlayer.id}`
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      )}
      {selectedPlayer && (
        <Link
          href={`/player/${selectedPlayer.id}/profile`}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === `/player/${selectedPlayer.id}/profile`
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
          )}
        >
          <User className="h-4 w-4" />
          My Profile
        </Link>
      )}
    </nav>
  );

  return (
    <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6" />
              <span>Cary Avengers</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
          <div className="border-t p-4">
            <Link
              href="/admin/login"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            >
              <Shield className="h-4 w-4" />
              Switch to Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex min-h-0 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex items-center gap-2 px-6 py-4 border-b">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <Shield className="h-6 w-6" />
                  <span>Cary Avengers</span>
                </Link>
              </div>
              <nav className="flex-1 overflow-y-auto">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
              <div className="border-t p-4">
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                >
                  <Shield className="h-4 w-4" />
                  Switch to Admin
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            <span className="font-semibold text-lg">Player Dashboard</span>
          </div>

          {selectedPlayer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
