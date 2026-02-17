// === API-derived types (cached in IndexedDB) ===

export interface Problem {
  id: string;
  contest_id: string;
  problem_index: string;
  name: string;
  title: string;
}

export interface ProblemModel {
  problem_id: string;
  slope?: number;
  intercept?: number;
  variance?: number;
  difficulty?: number;
  discrimination?: number;
  is_experimental: boolean;
  raw_point?: number;
}

export interface Contest {
  id: string;
  start_epoch_second: number;
  duration_second: number;
  title: string;
  rate_change: string;
}

// === User data types ===

export interface ReviewCard {
  problem_id: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  lastReviewedAt?: string; // ISO datetime
  status: "learning" | "reviewing" | "mastered";
}

export type ReviewQuality = 1 | 3 | 4 | 5;

export interface ProblemNote {
  problem_id: string;
  content: string;
  updatedAt: string;
}

export interface Bookmark {
  problem_id: string;
  createdAt: string;
}

export interface ReviewLog {
  id?: number;
  problem_id: string;
  reviewedAt: string;
  quality: ReviewQuality;
}

// === Enriched types for display ===

export interface ProblemWithDetails extends Problem {
  difficulty?: number;
  is_experimental?: boolean;
  contestTitle?: string;
  contestStartEpoch?: number;
  isBookmarked?: boolean;
  hasNote?: boolean;
  reviewStatus?: ReviewCard["status"];
  nextReviewDate?: string;
}

// === Filter types ===

export type ContestCategory = "ABC" | "ARC" | "AGC" | "Other";

export interface ProblemFilters {
  search: string;
  difficultyRange: [number, number];
  contestCategories: ContestCategory[];
  reviewStatus: "all" | "not_added" | "learning" | "reviewing" | "mastered" | "due";
  bookmarked: boolean;
}

// === Sync types ===

export interface SyncStatus {
  lastSyncAt: string | null;
  issyncing: boolean;
  error: string | null;
}
