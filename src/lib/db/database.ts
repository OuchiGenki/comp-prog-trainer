import Dexie, { type EntityTable } from "dexie";
import type {
  Problem,
  ProblemModel,
  Contest,
  ReviewCard,
  ProblemNote,
  Bookmark,
  ReviewLog,
} from "@/types";

class CompProgDB extends Dexie {
  problems!: EntityTable<Problem, "id">;
  problemModels!: EntityTable<ProblemModel, "problem_id">;
  contests!: EntityTable<Contest, "id">;
  reviewCards!: EntityTable<ReviewCard, "problem_id">;
  problemNotes!: EntityTable<ProblemNote, "problem_id">;
  bookmarks!: EntityTable<Bookmark, "problem_id">;
  reviewLogs!: EntityTable<ReviewLog, "id">;

  constructor() {
    super("CompProgTrainer");

    this.version(1).stores({
      problems: "id, contest_id, problem_index, name",
      problemModels: "problem_id, difficulty",
      contests: "id, start_epoch_second",
      reviewCards: "problem_id, nextReviewDate, status",
      problemNotes: "problem_id",
      bookmarks: "problem_id, createdAt",
      reviewLogs: "++id, problem_id, reviewedAt",
    });
  }
}

export const db = new CompProgDB();
