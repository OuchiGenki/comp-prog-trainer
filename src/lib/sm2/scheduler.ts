import { db } from "@/lib/db/database";
import { sm2, createNewCard } from "./algorithm";
import type { ReviewCard, ReviewQuality } from "@/types";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export async function getDueCards(): Promise<ReviewCard[]> {
  const today = todayStr();
  return db.reviewCards.where("nextReviewDate").belowOrEqual(today).toArray();
}

export async function getDueCount(): Promise<number> {
  const today = todayStr();
  return db.reviewCards.where("nextReviewDate").belowOrEqual(today).count();
}

export async function addToReview(problemId: string): Promise<void> {
  const existing = await db.reviewCards.get(problemId);
  if (existing) return;
  const card = createNewCard(problemId);
  await db.reviewCards.put(card);
}

export async function removeFromReview(problemId: string): Promise<void> {
  await db.reviewCards.delete(problemId);
}

export async function reviewCard(
  problemId: string,
  quality: ReviewQuality
): Promise<ReviewCard> {
  const card = await db.reviewCards.get(problemId);
  if (!card) {
    throw new Error(`No review card found for problem ${problemId}`);
  }

  const result = sm2(card, quality);
  const updated: ReviewCard = {
    ...card,
    ...result,
    lastReviewedAt: new Date().toISOString(),
  };

  await db.reviewCards.put(updated);

  await db.reviewLogs.add({
    problem_id: problemId,
    reviewedAt: new Date().toISOString(),
    quality,
  });

  return updated;
}

export async function getReviewStats() {
  const allCards = await db.reviewCards.toArray();
  const today = todayStr();
  const dueCards = allCards.filter((c) => c.nextReviewDate <= today);

  return {
    total: allCards.length,
    due: dueCards.length,
    learning: allCards.filter((c) => c.status === "learning").length,
    reviewing: allCards.filter((c) => c.status === "reviewing").length,
    mastered: allCards.filter((c) => c.status === "mastered").length,
  };
}
