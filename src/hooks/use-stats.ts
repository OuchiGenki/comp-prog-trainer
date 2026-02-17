"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db/database";

export interface DailyReviewCount {
  date: string;
  count: number;
}

export interface DifficultyDistribution {
  range: string;
  count: number;
  color: string;
}

export function useStats() {
  const [heatmapData, setHeatmapData] = useState<DailyReviewCount[]>([]);
  const [difficultyDist, setDifficultyDist] = useState<DifficultyDistribution[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const refresh = useCallback(async () => {
    const logs = await db.reviewLogs.toArray();

    // Heatmap data: reviews per day for the last year
    const dailyCounts = new Map<string, number>();
    logs.forEach((log) => {
      const date = log.reviewedAt.split("T")[0];
      dailyCounts.set(date, (dailyCounts.get(date) ?? 0) + 1);
    });
    const heatmap = Array.from(dailyCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    setHeatmapData(heatmap);
    setTotalReviews(logs.length);

    // Streak: consecutive days with at least one review
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (dailyCounts.has(dateStr)) {
        currentStreak++;
      } else {
        if (i > 0) break; // Allow today to not have reviews yet
      }
    }
    setStreak(currentStreak);

    // Difficulty distribution of review cards
    const reviewCards = await db.reviewCards.toArray();
    const models = await db.problemModels.toArray();
    const modelMap = new Map(models.map((m) => [m.problem_id, m]));

    const ranges = [
      { range: "~399", min: 0, max: 399, color: "#808080" },
      { range: "400~799", min: 400, max: 799, color: "#804000" },
      { range: "800~1199", min: 800, max: 1199, color: "#008000" },
      { range: "1200~1599", min: 1200, max: 1599, color: "#00C0C0" },
      { range: "1600~1999", min: 1600, max: 1999, color: "#0000FF" },
      { range: "2000~2399", min: 2000, max: 2399, color: "#C0C000" },
      { range: "2400~2799", min: 2400, max: 2799, color: "#FF8000" },
      { range: "2800~", min: 2800, max: Infinity, color: "#FF0000" },
    ];

    const dist = ranges.map(({ range, min, max, color }) => {
      const count = reviewCards.filter((c) => {
        const model = modelMap.get(c.problem_id);
        const diff = model?.difficulty ?? -1;
        return diff >= min && diff <= max;
      }).length;
      return { range, count, color };
    });
    setDifficultyDist(dist);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { heatmapData, difficultyDist, streak, totalReviews, refresh };
}
