import type { ReviewCard, ReviewQuality } from "@/types";

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  status: ReviewCard["status"];
}

/**
 * SM-2 algorithm implementation (as used by Anki).
 *
 * Quality mapping:
 *   5 = 簡単 (Easy)
 *   4 = 良い (Good)
 *   3 = 難しい (Hard)
 *   1 = 忘れた (Forgot)
 */
export function sm2(
  card: Pick<ReviewCard, "easeFactor" | "interval" | "repetitions">,
  quality: ReviewQuality
): SM2Result {
  let { easeFactor, interval, repetitions } = card;

  // Calculate new ease factor
  const newEF = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // Failed: reset
    repetitions = 0;
    interval = 1;
  } else {
    // Success
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * newEF);
    }
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().split("T")[0];

  let status: ReviewCard["status"] = "reviewing";
  if (repetitions === 0) {
    status = "learning";
  } else if (interval >= 21 && newEF >= 2.0) {
    status = "mastered";
  }

  return {
    easeFactor: newEF,
    interval,
    repetitions,
    nextReviewDate,
    status,
  };
}

export function createNewCard(problemId: string): ReviewCard {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());
  return {
    problem_id: problemId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: tomorrow.toISOString().split("T")[0],
    status: "learning",
  };
}
