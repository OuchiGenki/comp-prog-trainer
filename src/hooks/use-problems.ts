"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/db/database";
import type { ProblemWithDetails, ProblemFilters, ContestCategory } from "@/types";
import { getContestCategory } from "@/lib/utils/difficulty";

const DEFAULT_FILTERS: ProblemFilters = {
  search: "",
  difficultyRange: [0, 4000],
  contestCategories: [],
  reviewStatus: "all",
  bookmarked: false,
};

export function useProblems() {
  const [allProblems, setAllProblems] = useState<ProblemWithDetails[]>([]);
  const [filters, setFilters] = useState<ProblemFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  const loadProblems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [problems, models, contests, reviewCards, bookmarks, notes] = await Promise.all([
        db.problems.toArray(),
        db.problemModels.toArray(),
        db.contests.toArray(),
        db.reviewCards.toArray(),
        db.bookmarks.toArray(),
        db.problemNotes.toArray(),
      ]);

      const modelMap = new Map(models.map((m) => [m.problem_id, m]));
      const contestMap = new Map(contests.map((c) => [c.id, c]));
      const reviewMap = new Map(reviewCards.map((r) => [r.problem_id, r]));
      const bookmarkSet = new Set(bookmarks.map((b) => b.problem_id));
      const noteSet = new Set(notes.map((n) => n.problem_id));

      const enriched: ProblemWithDetails[] = problems.map((p) => {
        const model = modelMap.get(p.id);
        const contest = contestMap.get(p.contest_id);
        const review = reviewMap.get(p.id);
        return {
          ...p,
          difficulty: model?.difficulty,
          is_experimental: model?.is_experimental,
          contestTitle: contest?.title,
          contestStartEpoch: contest?.start_epoch_second,
          isBookmarked: bookmarkSet.has(p.id),
          hasNote: noteSet.has(p.id),
          reviewStatus: review?.status,
          nextReviewDate: review?.nextReviewDate,
        };
      });

      // Sort by contest start time (newest first), then by problem index
      enriched.sort((a, b) => {
        const timeA = a.contestStartEpoch ?? 0;
        const timeB = b.contestStartEpoch ?? 0;
        if (timeB !== timeA) return timeB - timeA;
        return a.problem_index.localeCompare(b.problem_index);
      });

      setAllProblems(enriched);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.contest_id.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Difficulty filter
      const diff = p.difficulty ?? -1;
      if (diff >= 0) {
        if (diff < filters.difficultyRange[0] || diff > filters.difficultyRange[1]) {
          return false;
        }
      }

      // Contest category filter
      if (filters.contestCategories.length > 0) {
        const cat = getContestCategory(p.contest_id);
        if (!filters.contestCategories.includes(cat)) return false;
      }

      // Review status filter
      if (filters.reviewStatus !== "all") {
        const today = new Date().toISOString().split("T")[0];
        if (filters.reviewStatus === "not_added") {
          if (p.reviewStatus) return false;
        } else if (filters.reviewStatus === "due") {
          if (!p.nextReviewDate || p.nextReviewDate > today) return false;
        } else {
          if (p.reviewStatus !== filters.reviewStatus) return false;
        }
      }

      // Bookmark filter
      if (filters.bookmarked && !p.isBookmarked) return false;

      return true;
    });
  }, [allProblems, filters]);

  return {
    problems: filteredProblems,
    allProblems,
    filters,
    setFilters,
    isLoading,
    refresh: loadProblems,
  };
}
