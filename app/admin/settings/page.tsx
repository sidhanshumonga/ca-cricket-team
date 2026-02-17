import { getSeasons } from "@/app/actions/season";
import { CreateSeasonDialog } from "@/components/create-season-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toDate } from "@/lib/firestore-helpers";

export default async function SettingsPage() {
  const seasons = await getSeasons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Seasons</CardTitle>
              <CreateSeasonDialog />
            </div>
            <CardDescription>Manage your cricket seasons.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {seasons.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No seasons found. Create one to get started.
              </p>
            ) : (
              seasons.map((season: any) => (
                <div
                  key={season.id}
                  className="p-3 rounded-lg border space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{season.name}</h3>
                    {season.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Archived</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Start:</span>{" "}
                      {format(toDate(season.startDate), "MMM d, yyyy")}
                    </p>
                    <p>
                      <span className="font-medium">End:</span>{" "}
                      {format(toDate(season.endDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop View - Table Layout */}
      <Card className="hidden md:block">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Seasons</CardTitle>
            <CardDescription>Manage your cricket seasons.</CardDescription>
          </div>
          <CreateSeasonDialog />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No seasons found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                seasons.map((season: any) => (
                  <TableRow key={season.id}>
                    <TableCell className="font-medium">{season.name}</TableCell>
                    <TableCell>
                      {format(toDate(season.startDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(toDate(season.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {season.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Archived</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
