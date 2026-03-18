"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Calendar, MapPin, Clock, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function UmpiringPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { getUmpiringMatches } = await import("@/app/actions/umpiring");
      const result = await getUmpiringMatches();
      if (result.success) {
        setMatches(result.matches);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load umpiring matches");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const { createUmpiringMatch } = await import("@/app/actions/umpiring");
    const result = await createUmpiringMatch(formData);

    if (result.success) {
      toast.success("Umpiring match created");
      setShowForm(false);
      e.currentTarget.reset();
      await loadMatches();
    } else {
      toast.error(result.error || "Failed to create match");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this umpiring match?")) return;

    const { deleteUmpiringMatch } = await import("@/app/actions/umpiring");
    const result = await deleteUmpiringMatch(id);

    if (result.success) {
      toast.success("Match deleted");
      await loadMatches();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Umpiring Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Manage umpiring slots for external matches
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/umpiring/assignments">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View All Assignments
            </Button>
          </Link>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Match
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Umpiring Match</CardTitle>
            <CardDescription>
              Add a new match that needs umpires from your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="matchName">Match Name</Label>
                <Input
                  id="matchName"
                  name="matchName"
                  placeholder="e.g. Team A vs Team B"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ground name"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Match"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Matches</CardTitle>
          <CardDescription>
            {matches.length} match{matches.length !== 1 ? "es" : ""} need{matches.length === 1 ? "s" : ""} umpires
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No upcoming umpiring matches. Add one above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Umpire 1</TableHead>
                  <TableHead>Umpire 2</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match: any) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.matchName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(match.date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {match.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {match.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      {match.slot1Player ? (
                        <Badge variant="secondary">{match.slot1Player.name}</Badge>
                      ) : (
                        <Badge variant="outline">Open</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {match.slot2Player ? (
                        <Badge variant="secondary">{match.slot2Player.name}</Badge>
                      ) : (
                        <Badge variant="outline">Open</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(match.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
