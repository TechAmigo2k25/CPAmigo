import { cn } from "@/lib/utils";
import { Difficulty } from "@/types";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-easy/20 text-easy border-easy/30",
  Medium: "bg-warning/20 text-warning border-warning/30",
  Hard: "bg-destructive/20 text-destructive border-destructive/30",
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        difficultyStyles[difficulty],
        className
      )}
    >
      {difficulty}
    </span>
  );
}
