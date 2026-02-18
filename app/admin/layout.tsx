"use client";

import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, User, LogOut, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminViewingPlayer, setAdminViewingPlayer] = useState(false);

  useEffect(() => {
    // Clear adminViewingPlayer flag when navigating away from player pages
    if (!pathname.startsWith("/admin")) {
      setAdminViewingPlayer(false);
    }

    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsLoading(false);
      return;
    }

    // Check authentication and session validity
    const sessionData = localStorage.getItem("adminSession");

    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        const sessionAge = now - session.timestamp;

        // Check if session is still valid (within 7 days)
        if (session.authenticated && sessionAge < session.expiresIn) {
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          // Session expired
          localStorage.removeItem("adminSession");
          router.push("/admin/login");
        }
      } catch (error) {
        // Invalid session data
        localStorage.removeItem("adminSession");
        router.push("/admin/login");
      }
    } else {
      // No session found
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminViewingPlayer"); // Clean up flag
    router.push("/");
  };

  // Show loading or login page content without layout
  if (pathname === "/admin/login" || isLoading) {
    return <>{children}</>;
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6" />
              <span className="">Team Manager</span>
            </Link>
          </div>
          <div className="flex-1">
            <AdminNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
                  <span>Team Manager</span>
                </Link>
              </div>
              <nav className="flex-1 overflow-y-auto">
                <AdminNav onNavigate={() => setOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <span className="font-semibold text-lg">Admin Dashboard</span>
          </div>
          {(() => {
            const playerSession = localStorage.getItem("selectedPlayer");
            const playerData = playerSession ? JSON.parse(playerSession) : null;

            if (playerData) {
              return (
                <Link
                  href={`/player/${playerData.id}`}
                  onClick={() => {
                    // Check if admin is viewing player (bypass redirect)
                    const adminViewingPlayer =
                      localStorage.getItem("adminViewingPlayer") === "true";

                    // Allow admin to view player profiles if they have admin session
                    const isAdminSession =
                      !!localStorage.getItem("adminSession");
                    console.log("Setting adminViewingPlayer flag to true");

                    // Small delay to ensure flag is set before any redirect
                    setTimeout(() => {
                      console.log("Flag set, checking redirect logic...");
                    }, 100);
                  }}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">View as Player</span>
                  </Button>
                </Link>
              );
            } else {
              return (
                <Link href="/player">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">View as Player</span>
                  </Button>
                </Link>
              );
            }
          })()}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
