import Link from "next/link";
import { User } from "lucide-react";

export default function PlayerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-white px-4 shadow-sm lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <User className="h-5 w-5" />
                    <span>Player Portal</span>
                </Link>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
