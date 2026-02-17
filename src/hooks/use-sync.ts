"use client";

import { useState, useCallback, useEffect } from "react";
import { syncData, isCacheValid, hasCachedData } from "@/lib/api/sync";

interface UseSyncReturn {
  isSyncing: boolean;
  progress: number;
  stage: string;
  error: string | null;
  sync: (force?: boolean) => Promise<void>;
  hasData: boolean;
}

export function useSync(): UseSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    hasCachedData().then(setHasData);
  }, []);

  const sync = useCallback(async (force = false) => {
    setIsSyncing(true);
    setError(null);
    setProgress(0);
    try {
      await syncData(
        (s, p) => {
          setStage(s);
          setProgress(p);
        },
        force
      );
      setHasData(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "同期に失敗しました");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Auto-sync on mount if cache is invalid
  useEffect(() => {
    if (!isCacheValid()) {
      sync();
    }
  }, [sync]);

  return { isSyncing, progress, stage, error, sync, hasData };
}
