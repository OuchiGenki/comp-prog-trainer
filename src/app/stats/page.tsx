"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/hooks/use-stats";
import { useReview } from "@/hooks/use-review";
import { Flame, BarChart3, Calendar, TrendingUp } from "lucide-react";
import { ActivityHeatmap } from "@/components/stats/activity-heatmap";
import { DifficultyChart } from "@/components/stats/difficulty-chart";

export default function StatsPage() {
  const { heatmapData, difficultyDist, streak, totalReviews } = useStats();
  const { stats } = useReview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">統計</h1>
        <p className="text-muted-foreground">復習の進捗を確認</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ストリーク</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak}日</div>
            <p className="text-xs text-muted-foreground">連続復習日数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">総復習回数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">これまでの復習</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">習得率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0
                ? Math.round((stats.mastered / stats.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.mastered} / {stats.total} 問
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日の復習</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapData.find((d) => d.date === new Date().toISOString().split("T")[0])?.count ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">本日の復習回数</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">復習アクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={heatmapData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">難易度別分布（復習カード）</CardTitle>
        </CardHeader>
        <CardContent>
          <DifficultyChart data={difficultyDist} />
        </CardContent>
      </Card>
    </div>
  );
}
