"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { db } from "@/lib/db/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { ExternalLink, BookmarkCheck, Trash2 } from "lucide-react";
import type { Bookmark, Problem, ProblemModel } from "@/types";

interface BookmarkWithProblem extends Bookmark {
  problem?: Problem;
  model?: ProblemModel;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithProblem[]>([]);

  const load = useCallback(async () => {
    const bks = await db.bookmarks.orderBy("createdAt").reverse().toArray();
    const ids = bks.map((b) => b.problem_id);
    const [problems, models] = await Promise.all([
      db.problems.where("id").anyOf(ids).toArray(),
      db.problemModels.where("problem_id").anyOf(ids).toArray(),
    ]);
    const pMap = new Map(problems.map((p) => [p.id, p]));
    const mMap = new Map(models.map((m) => [m.problem_id, m]));

    setBookmarks(
      bks.map((b) => ({
        ...b,
        problem: pMap.get(b.problem_id),
        model: mMap.get(b.problem_id),
      }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeBookmark = async (problemId: string) => {
    await db.bookmarks.delete(problemId);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookmarkCheck className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">ブックマーク</h1>
          <p className="text-muted-foreground">後で解きたい問題 ({bookmarks.length}問)</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">ブックマークした問題はありません</p>
            <Link href="/problems">
              <Button variant="outline">問題一覧へ</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bk) => (
            <div
              key={bk.problem_id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <DifficultyBadge difficulty={bk.model?.difficulty} />
                <div>
                  <Link
                    href={`/problems/${bk.problem_id}`}
                    className="font-medium hover:underline"
                  >
                    {bk.problem?.title ?? bk.problem_id}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {bk.problem?.contest_id?.toUpperCase()} - {bk.problem?.problem_index}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`https://atcoder.jp/contests/${bk.problem?.contest_id}/tasks/${bk.problem_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeBookmark(bk.problem_id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
