"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReview } from "@/hooks/use-review";
import { useEffect, useState } from "react";
import { db } from "@/lib/db/database";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Problem, ProblemModel } from "@/types";

export default function ReviewPage() {
  const { dueCards, reviewingCards, stats } = useReview();
  const [problemMap, setProblemMap] = useState<Map<string, Problem>>(new Map());
  const [modelMap, setModelMap] = useState<Map<string, ProblemModel>>(new Map());

  useEffect(() => {
    async function load() {
      const ids = [...new Set([...dueCards.map((c) => c.problem_id), ...reviewingCards.map((c) => c.problem_id)])];
      if (ids.length === 0) return;
      const [problems, models] = await Promise.all([
        db.problems.where("id").anyOf(ids).toArray(),
        db.problemModels.where("problem_id").anyOf(ids).toArray(),
      ]);
      setProblemMap(new Map(problems.map((p) => [p.id, p])));
      setModelMap(new Map(models.map((m) => [m.problem_id, m])));
    }
    load();
  }, [dueCards, reviewingCards]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">復習</h1>
          <p className="text-muted-foreground">SM-2アルゴリズムによる間隔反復学習</p>
        </div>
        {dueCards.length > 0 && (
          <Link href="/review/session">
            <Button>
              復習を開始 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.due}</div>
            <p className="text-xs text-muted-foreground">要復習</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.learning}</div>
            <p className="text-xs text-muted-foreground">学習中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{stats.reviewing}</div>
            <p className="text-xs text-muted-foreground">復習中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
            <p className="text-xs text-muted-foreground">習得済</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            今日の復習キュー ({dueCards.length}問)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dueCards.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">全て完了！</p>
              <p className="text-sm">
                復習する問題がありません。
                <Link href="/problems" className="text-primary underline ml-1">
                  問題一覧
                </Link>
                から問題を追加しましょう。
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {dueCards.map((card) => {
                const problem = problemMap.get(card.problem_id);
                const model = modelMap.get(card.problem_id);
                return (
                  <div
                    key={card.problem_id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <DifficultyBadge difficulty={model?.difficulty} />
                      <div>
                        <Link
                          href={`/problems/${card.problem_id}`}
                          className="font-medium hover:underline"
                        >
                          {problem?.title ?? card.problem_id}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {problem?.contest_id?.toUpperCase()} - {problem?.problem_index}
                          {" | "}
                          <Badge variant="outline" className="text-[10px]">
                            {{ learning: "学習中", reviewing: "復習中", mastered: "習得済" }[card.status]}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://atcoder.jp/contests/${problem?.contest_id}/tasks/${card.problem_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            復習中の問題 ({reviewingCards.length}問)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewingCards.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              復習中の問題はありません。
            </p>
          ) : (
            <div className="space-y-2">
              {reviewingCards.map((card) => {
                const problem = problemMap.get(card.problem_id);
                const model = modelMap.get(card.problem_id);
                return (
                  <div
                    key={card.problem_id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <DifficultyBadge difficulty={model?.difficulty} />
                      <div>
                        <Link
                          href={`/problems/${card.problem_id}`}
                          className="font-medium hover:underline"
                        >
                          {problem?.title ?? card.problem_id}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {problem?.contest_id?.toUpperCase()} - {problem?.problem_index}
                          {" | "}
                          次回: {card.nextReviewDate}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://atcoder.jp/contests/${problem?.contest_id}/tasks/${card.problem_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
