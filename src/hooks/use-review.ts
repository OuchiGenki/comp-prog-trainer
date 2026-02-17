"use client";

import { useState, useEffect, useCallback } from "react";
import { getDueCards, getDueCount, addToReview, removeFromReview, reviewCard, getReviewStats } from "@/lib/sm2/scheduler";
import type { ReviewCard, ReviewQuality } from "@/types";

export function useReview() {
  const [dueCards, setDueCards] = useState<ReviewCard[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, due: 0, learning: 0, reviewing: 0, mastered: 0 });

  const refresh = useCallback(async () => {
    const [cards, count, s] = await Promise.all([
      getDueCards(),
      getDueCount(),
      getReviewStats(),
    ]);
    setDueCards(cards);
    setDueCount(count);
    setStats(s);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (problemId: string) => {
      await addToReview(problemId);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (problemId: string) => {
      await removeFromReview(problemId);
      await refresh();
    },
    [refresh]
  );

  const review = useCallback(
    async (problemId: string, quality: ReviewQuality) => {
      const updated = await reviewCard(problemId, quality);
      await refresh();
      return updated;
    },
    [refresh]
  );

  return {
    dueCards,
    dueCount,
    stats,
    addToReview: add,
    removeFromReview: remove,
    reviewCard: review,
    refresh,
  };
}
