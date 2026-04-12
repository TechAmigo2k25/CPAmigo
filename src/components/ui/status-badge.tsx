import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface StatusBadgeProps {
  solved: boolean;
  className?: string;
}

export function StatusBadge({ solved, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        solved ? "bg-success/20 text-success" : "bg-muted text-muted-foreground",
        className
      )}
    >
      {solved ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Solved
        </>
      ) : (
        <>
          <Circle className="h-3 w-3" />
          Unsolved
        </>
      )}
    </span>
  );
}
