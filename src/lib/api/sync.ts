import { db } from "@/lib/db/database";
import { fetchProblems, fetchProblemModels, fetchContests } from "./atcoder-client";

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const SYNC_KEY = "comp-prog-trainer-last-sync";

export function getLastSyncTime(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SYNC_KEY);
  return stored ? parseInt(stored, 10) : null;
}

function setLastSyncTime(time: number): void {
  localStorage.setItem(SYNC_KEY, time.toString());
}

export function isCacheValid(): boolean {
  const lastSync = getLastSyncTime();
  if (!lastSync) return false;
  return Date.now() - lastSync < CACHE_DURATION_MS;
}

export async function hasCachedData(): Promise<boolean> {
  const count = await db.problems.count();
  return count > 0;
}

export type SyncProgressCallback = (stage: string, progress: number) => void;

export async function syncData(
  onProgress?: SyncProgressCallback,
  force = false
): Promise<void> {
  if (!force && isCacheValid() && (await hasCachedData())) {
    return;
  }

  onProgress?.("問題データを取得中...", 0);
  const problems = await fetchProblems();

  onProgress?.("難易度データを取得中...", 33);
  const models = await fetchProblemModels();

  onProgress?.("コンテストデータを取得中...", 66);
  const contests = await fetchContests();

  onProgress?.("データベースに保存中...", 90);

  await db.transaction("rw", [db.problems, db.problemModels, db.contests], async () => {
    await db.problems.clear();
    await db.problemModels.clear();
    await db.contests.clear();

    // Bulk insert in chunks to avoid memory issues
    const CHUNK_SIZE = 5000;

    for (let i = 0; i < problems.length; i += CHUNK_SIZE) {
      await db.problems.bulkPut(problems.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < models.length; i += CHUNK_SIZE) {
      await db.problemModels.bulkPut(models.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < contests.length; i += CHUNK_SIZE) {
      await db.contests.bulkPut(contests.slice(i, i + CHUNK_SIZE));
    }
  });

  setLastSyncTime(Date.now());
  onProgress?.("完了", 100);
}
