"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { addCompletedTestMatch } from "@/app/actions/test-data";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddTestMatchButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddMatch = async () => {
    setLoading(true);
    try {
      const result = await addCompletedTestMatch();
      
      if (result.success) {
        toast.success(result.message || "Test match added successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add test match");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add test match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddMatch}
      disabled={loading}
      size="sm"
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Add Test Match
        </>
      )}
    </Button>
  );
}
