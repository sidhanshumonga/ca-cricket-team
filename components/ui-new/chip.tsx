import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  tone?: "orange" | "teal" | "green" | "red" | "amber" | "gray";
  dot?: boolean;
  className?: string;
}

export function Chip({ children, tone = "gray", dot = false, className }: ChipProps) {
  return (
    <span
      className={cn(
        "chip",
        `chip-${tone}`,
        className
      )}
    >
      {dot && <span className="live-dot" />}
      {children}
    </span>
  );
}
