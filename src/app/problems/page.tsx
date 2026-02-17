"use client";

import { useCallback } from "react";
import { useProblems } from "@/hooks/use-problems";
import { ProblemTable } from "@/components/problems/problem-table";
import { ProblemFiltersBar } from "@/components/problems/problem-filters";
import { db } from "@/lib/db/database";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemsPage() {
  const { problems, allProblems, filters, setFilters, isLoading, refresh } = useProblems();

  const handleToggleBookmark = useCallback(
    async (problemId: string, shouldBookmark: boolean) => {
      if (shouldBookmark) {
        await db.bookmarks.put({
          problem_id: problemId,
          createdAt: new Date().toISOString(),
        });
      } else {
        await db.bookmarks.delete(problemId);
      }
      refresh();
    },
    [refresh]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">問題一覧</h1>
      <ProblemFiltersBar
        filters={filters}
        onChange={setFilters}
        totalCount={allProblems.length}
        filteredCount={problems.length}
      />
      <ProblemTable problems={problems} onToggleBookmark={handleToggleBookmark} />
    </div>
  );
}
