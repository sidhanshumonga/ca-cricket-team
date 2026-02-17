import Link from "next/link";
import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </Link>
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
