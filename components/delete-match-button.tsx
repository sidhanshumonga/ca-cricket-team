"use client";

import { deleteMatch } from "@/app/actions/match";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteMatchButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        if (!confirm("Are you sure you want to delete this match?")) return;

        startTransition(async () => {
            const result = await deleteMatch(id);
            if (result.success) {
                toast.success("Match deleted");
            } else {
                toast.error("Failed to delete match");
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
