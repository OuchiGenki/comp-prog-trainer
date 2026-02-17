"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, RotateCcw, Bookmark, BarChart3, ArrowRight } from "lucide-react";
import { useReview } from "@/hooks/use-review";
import { useSync } from "@/hooks/use-sync";
import { db } from "@/lib/db/database";

export default function DashboardPage() {
  const { dueCount, stats } = useReview();
  const { isSyncing, hasData } = useSync();
  const [problemCount, setProblemCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    Promise.all([db.problems.count(), db.bookmarks.count()]).then(
      ([p, b]) => {
        setProblemCount(p);
        setBookmarkCount(b);
      }
    );
  }, [hasData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">
          競技プログラミングの復習を効率的に管理
        </p>
      </div>

      {isSyncing && !hasData && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">データを同期中です...</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">総問題数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{problemCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">AtCoder過去問</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日の復習</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueCount}</div>
            <p className="text-xs text-muted-foreground">
              {dueCount > 0 ? "復習が待っています" : "全て完了！"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">復習カード</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              習得: {stats.mastered} / 学習中: {stats.learning + stats.reviewing}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ブックマーク</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookmarkCount}</div>
            <p className="text-xs text-muted-foreground">後で解く問題</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {dueCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">復習を始める</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {dueCount}問の復習が期限を迎えています。
              </p>
              <Link href="/review/session">
                <Button>
                  復習セッション開始 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">問題を探す</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              AtCoderの過去問を難易度やコンテスト別に検索できます。
            </p>
            <Link href="/problems">
              <Button variant="outline">
                問題一覧へ <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
