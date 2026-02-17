"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import { useReview } from "@/hooks/use-review";
import { db } from "@/lib/db/database";
import { ExternalLink, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Problem, ProblemModel, ProblemNote, ReviewQuality, ReviewCard } from "@/types";

export default function ReviewSessionPage() {
  const { dueCards, reviewCard: doReview, refresh } = useReview();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [model, setModel] = useState<ProblemModel | null>(null);
  const [note, setNote] = useState<ProblemNote | null>(null);
  const [sessionCards, setSessionCards] = useState<ReviewCard[]>([]);
  const [completed, setCompleted] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Capture due cards at session start
  useEffect(() => {
    if (dueCards.length > 0 && sessionCards.length === 0) {
      setSessionCards([...dueCards]);
    }
  }, [dueCards, sessionCards.length]);

  const currentCard = sessionCards[currentIndex];

  const loadProblemData = useCallback(async (problemId: string) => {
    const [p, m, n] = await Promise.all([
      db.problems.get(problemId),
      db.problemModels.get(problemId),
      db.problemNotes.get(problemId),
    ]);
    setProblem(p ?? null);
    setModel(m ?? null);
    setNote(n ?? null);
    setShowNote(false);
  }, []);

  useEffect(() => {
    if (currentCard) {
      loadProblemData(currentCard.problem_id);
    }
  }, [currentCard, loadProblemData]);

  const handleRating = async (quality: ReviewQuality) => {
    if (!currentCard) return;
    await doReview(currentCard.problem_id, quality);
    setCompleted((c) => c + 1);

    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (sessionCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-bold">復習する問題がありません</h2>
        <p className="text-muted-foreground">問題一覧から復習に追加してください</p>
        <Link href="/problems">
          <Button>問題一覧へ</Button>
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-bold">復習完了！</h2>
        <p className="text-muted-foreground">{completed}問を復習しました</p>
        <div className="flex gap-3">
          <Link href="/review">
            <Button variant="outline">復習ダッシュボードへ</Button>
          </Link>
          <Link href="/">
            <Button>ホームへ</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = (completed / sessionCards.length) * 100;

  const ratingButtons: { quality: ReviewQuality; label: string; desc: string; color: string }[] = [
    { quality: 1, label: "忘れた", desc: "全く思い出せない", color: "bg-red-500 hover:bg-red-600 text-white" },
    { quality: 3, label: "難しい", desc: "かなり考えた", color: "bg-amber-500 hover:bg-amber-600 text-white" },
    { quality: 4, label: "良い", desc: "少し考えて解けた", color: "bg-blue-500 hover:bg-blue-600 text-white" },
    { quality: 5, label: "簡単", desc: "すぐに解法が浮かんだ", color: "bg-green-500 hover:bg-green-600 text-white" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/review">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> 戻る
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">
          {completed + 1} / {sessionCards.length}
        </span>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {problem && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{problem.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {problem.contest_id.toUpperCase()} - {problem.problem_index}
                </p>
              </div>
              <DifficultyBadge difficulty={model?.difficulty} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href={`https://atcoder.jp/contests/${problem.contest_id}/tasks/${problem.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" /> AtCoderで問題を確認
              </Button>
            </a>

            {note && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNote(!showNote)}
                  className="mb-2"
                >
                  {showNote ? (
                    <EyeOff className="mr-1 h-4 w-4" />
                  ) : (
                    <Eye className="mr-1 h-4 w-4" />
                  )}
                  {showNote ? "メモを隠す" : "メモを表示"}
                </Button>
                {showNote && (
                  <div className="rounded-lg border p-4 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                この問題の解法を思い出せましたか？
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ratingButtons.map(({ quality, label, desc, color }) => (
                  <button
                    key={quality}
                    onClick={() => handleRating(quality)}
                    className={`rounded-lg p-3 text-center transition-transform hover:scale-105 ${color}`}
                  >
                    <div className="font-bold text-sm">{label}</div>
                    <div className="text-[10px] opacity-80">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
