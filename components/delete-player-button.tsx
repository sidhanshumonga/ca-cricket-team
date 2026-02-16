"use client";

import { deletePlayer } from "@/app/actions/player";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeletePlayerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this player? This action cannot be undone.",
      )
    )
      return;

    startTransition(async () => {
      const result = await deletePlayer(id);
      if (result.success) {
        toast.success("Player deleted");
      } else {
        toast.error("Failed to delete player");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 text-destructive hover:text-destructive/90"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
