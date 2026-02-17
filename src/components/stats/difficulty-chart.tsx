"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DifficultyDistribution } from "@/hooks/use-stats";

interface DifficultyChartProps {
  data: DifficultyDistribution[];
}

export function DifficultyChart({ data }: DifficultyChartProps) {
  if (data.every((d) => d.count === 0)) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        まだ復習カードがありません
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="range" fontSize={12} />
        <YAxis fontSize={12} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [`${value}問`, "問題数"]}
          contentStyle={{
            backgroundColor: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
