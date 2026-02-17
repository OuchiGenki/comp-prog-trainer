"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { db } from "@/lib/db/database";
import { addToReview, removeFromReview } from "@/lib/sm2/scheduler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DifficultyBadge } from "@/components/problems/difficulty-badge";
import {
  ExternalLink,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  X,
  Save,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Problem, ProblemModel, Contest, ReviewCard, ProblemNote } from "@/types";

export default function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [model, setModel] = useState<ProblemModel | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [reviewCard, setReviewCard] = useState<ReviewCard | null>(null);
  const [bookmark, setBookmark] = useState(false);
  const [note, setNote] = useState<ProblemNote | null>(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const load = useCallback(async () => {
    const [p, m, rc, bk, n] = await Promise.all([
      db.problems.get(id),
      db.problemModels.get(id),
      db.reviewCards.get(id),
      db.bookmarks.get(id),
      db.problemNotes.get(id),
    ]);
    setProblem(p ?? null);
    setModel(m ?? null);
    setReviewCard(rc ?? null);
    setBookmark(!!bk);
    setNote(n ?? null);
    setNoteContent(n?.content ?? "");

    if (p) {
      const c = await db.contests.get(p.contest_id);
      setContest(c ?? null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleBookmark = async () => {
    if (bookmark) {
      await db.bookmarks.delete(id);
    } else {
      await db.bookmarks.put({ problem_id: id, createdAt: new Date().toISOString() });
    }
    setBookmark(!bookmark);
  };

  const toggleReview = async () => {
    if (reviewCard) {
      await removeFromReview(id);
    } else {
      await addToReview(id);
    }
    load();
  };

  const saveNote = async () => {
    const data: ProblemNote = {
      problem_id: id,
      content: noteContent,
      updatedAt: new Date().toISOString(),
    };
    await db.problemNotes.put(data);
    setNote(data);
    setEditingNote(false);
  };

  const deleteNote = async () => {
    await db.problemNotes.delete(id);
    setNote(null);
    setNoteContent("");
    setEditingNote(false);
  };

  if (!problem) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  const atcoderUrl = `https://atcoder.jp/contests/${problem.contest_id}/tasks/${problem.id}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/problems">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> 戻る
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <DifficultyBadge difficulty={model?.difficulty} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">
            {problem.contest_id.toUpperCase()} - {problem.problem_index}
          </span>
          {contest && <span>({contest.title})</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={atcoderUrl} target="_blank" rel="noopener noreferrer">
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" /> AtCoderで開く
          </Button>
        </a>
        <Button variant={bookmark ? "default" : "outline"} onClick={toggleBookmark}>
          {bookmark ? (
            <BookmarkCheck className="mr-2 h-4 w-4" />
          ) : (
            <Bookmark className="mr-2 h-4 w-4" />
          )}
          {bookmark ? "ブックマーク済" : "ブックマーク"}
        </Button>
        <Button variant={reviewCard ? "secondary" : "outline"} onClick={toggleReview}>
          {reviewCard ? (
            <X className="mr-2 h-4 w-4" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          {reviewCard ? "復習から削除" : "復習に追加"}
        </Button>
      </div>

      {reviewCard && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">復習情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">状態:</span>{" "}
                <Badge variant="outline">
                  {{ learning: "学習中", reviewing: "復習中", mastered: "習得済" }[reviewCard.status]}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">次回復習:</span>{" "}
                {reviewCard.nextReviewDate}
              </div>
              <div>
                <span className="text-muted-foreground">間隔:</span>{" "}
                {reviewCard.interval}日
              </div>
              <div>
                <span className="text-muted-foreground">Easy Factor:</span>{" "}
                {reviewCard.easeFactor.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">メモ</CardTitle>
          {!editingNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingNote(true);
                setNoteContent(note?.content ?? "");
              }}
            >
              {note ? "編集" : "追加"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingNote ? (
            <div className="space-y-3">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="解法メモをMarkdownで記入..."
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveNote}>
                  <Save className="mr-1 h-3 w-3" /> 保存
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingNote(false);
                    setNoteContent(note?.content ?? "");
                  }}
                >
                  キャンセル
                </Button>
                {note && (
                  <Button variant="destructive" size="sm" onClick={deleteNote} className="ml-auto">
                    削除
                  </Button>
                )}
              </div>
            </div>
          ) : note ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              メモはまだありません。「追加」をクリックして解法メモを記録しましょう。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
