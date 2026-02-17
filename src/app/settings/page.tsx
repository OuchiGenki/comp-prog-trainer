"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/database";
import { useSync } from "@/hooks/use-sync";
import { getLastSyncTime } from "@/lib/api/sync";
import { Download, Upload, Trash2, RefreshCw, Save } from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const { sync, isSyncing } = useSync();
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("atcoder-username");
    if (stored) setUsername(stored);
    const syncTime = getLastSyncTime();
    if (syncTime) {
      setLastSync(new Date(syncTime).toLocaleString("ja-JP"));
    }
  }, []);

  const saveUsername = () => {
    localStorage.setItem("atcoder-username", username);
  };

  const exportData = async () => {
    const [reviewCards, notes, bookmarks, logs] = await Promise.all([
      db.reviewCards.toArray(),
      db.problemNotes.toArray(),
      db.bookmarks.toArray(),
      db.reviewLogs.toArray(),
    ]);

    const data = { reviewCards, notes, bookmarks, logs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comp-prog-trainer-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMessage("エクスポートしました");
    setTimeout(() => setExportMessage(""), 3000);
  };

  const importData = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        await db.transaction("rw", [db.reviewCards, db.problemNotes, db.bookmarks, db.reviewLogs], async () => {
          if (data.reviewCards) {
            await db.reviewCards.clear();
            await db.reviewCards.bulkPut(data.reviewCards);
          }
          if (data.notes) {
            await db.problemNotes.clear();
            await db.problemNotes.bulkPut(data.notes);
          }
          if (data.bookmarks) {
            await db.bookmarks.clear();
            await db.bookmarks.bulkPut(data.bookmarks);
          }
          if (data.logs) {
            await db.reviewLogs.clear();
            await db.reviewLogs.bulkPut(data.logs);
          }
        });

        setExportMessage("インポートしました");
        setTimeout(() => setExportMessage(""), 3000);
      } catch {
        setExportMessage("インポートに失敗しました");
        setTimeout(() => setExportMessage(""), 3000);
      }
    };
    input.click();
  };

  const clearUserData = async () => {
    if (!confirm("復習カード、メモ、ブックマーク、復習ログを全て削除しますか？")) return;
    await db.transaction("rw", [db.reviewCards, db.problemNotes, db.bookmarks, db.reviewLogs], async () => {
      await db.reviewCards.clear();
      await db.problemNotes.clear();
      await db.bookmarks.clear();
      await db.reviewLogs.clear();
    });
    setExportMessage("ユーザーデータを削除しました");
    setTimeout(() => setExportMessage(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground">アプリケーションの設定</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AtCoderユーザー名</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="username" className="sr-only">ユーザー名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="AtCoderのユーザー名"
              />
            </div>
            <Button onClick={saveUsername}>
              <Save className="mr-1 h-4 w-4" /> 保存
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">データ同期</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            最終同期: {lastSync ?? "未同期"}
          </p>
          <Button onClick={() => sync(true)} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "同期中..." : "今すぐ同期"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">データ管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exportMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{exportMessage}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" /> エクスポート
            </Button>
            <Button variant="outline" onClick={importData}>
              <Upload className="mr-2 h-4 w-4" /> インポート
            </Button>
            <Button variant="destructive" onClick={clearUserData}>
              <Trash2 className="mr-2 h-4 w-4" /> ユーザーデータ削除
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            エクスポート: 復習カード、メモ、ブックマーク、復習ログをJSONファイルとして保存します。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">クレジット</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            問題データは{" "}
            <a
              href="https://github.com/kenkoooo/AtCoderProblems"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              kenkoooo/AtCoderProblems
            </a>{" "}
            (MIT License) のAPIを利用しています。
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            復習システムは SM-2 アルゴリズム（Anki採用）に基づいています。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
