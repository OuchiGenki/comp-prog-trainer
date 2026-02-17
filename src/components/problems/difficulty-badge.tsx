"use client";

import { Badge } from "@/components/ui/badge";
import { getDifficultyColor } from "@/lib/utils/difficulty";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: number | undefined;
  showValue?: boolean;
}

export function DifficultyBadge({ difficulty, showValue = true }: DifficultyBadgeProps) {
  const color = getDifficultyColor(difficulty);

  return (
    <Badge variant="outline" className={cn("font-mono text-xs", color.bg, color.text)}>
      {showValue && difficulty !== undefined ? difficulty : color.label}
    </Badge>
  );
}
