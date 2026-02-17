"use client";

import type { DailyReviewCount } from "@/hooks/use-stats";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityHeatmapProps {
  data: DailyReviewCount[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const dataMap = new Map(data.map((d) => [d.date, d.count]));

  // Generate last 365 days
  const today = new Date();
  const days: { date: string; count: number; dayOfWeek: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      count: dataMap.get(dateStr) ?? 0,
      dayOfWeek: d.getDay(),
    });
  }

  // Organize into weeks
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  for (const day of days) {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count <= 2) return "bg-green-200 dark:bg-green-900";
    if (count <= 5) return "bg-green-400 dark:bg-green-700";
    if (count <= 10) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-300";
  };

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        まだ復習データがありません
      </p>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-[700px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-3 w-3 rounded-sm ${getColor(day.count)}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {day.date}: {day.count}回
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
