import { getActiveSeason } from "@/app/actions/season";
import { CreateMatchForm } from "@/components/create-match-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewMatchPage() {
  const activeSeason = await getActiveSeason();

  if (!activeSeason) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">No Active Season Found</h2>
        <p className="text-muted-foreground">
          Please create a season first before adding matches.
        </p>
        <Link href="/admin/settings">
          <Button>Go to Settings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Link href="/admin/matches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Add New Match</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
          <CardDescription>
            Schedule a new match for {activeSeason.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateMatchForm seasonId={activeSeason.id} />
        </CardContent>
      </Card>
    </div>
  );
}
