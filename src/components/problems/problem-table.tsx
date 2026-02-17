"use client";

import { useMemo, useRef, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useState } from "react";
import { DifficultyBadge } from "./difficulty-badge";
import { ArrowUpDown, ExternalLink, Bookmark, BookmarkCheck, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProblemWithDetails } from "@/types";
import { getContestCategory } from "@/lib/utils/difficulty";
import Link from "next/link";

interface ProblemTableProps {
  problems: ProblemWithDetails[];
  onToggleBookmark: (problemId: string, isBookmarked: boolean) => void;
}

export function ProblemTable({ problems, onToggleBookmark }: ProblemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<ProblemWithDetails>[]>(
    () => [
      {
        accessorKey: "contest_id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            コンテスト <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const contestId = row.original.contest_id;
          const cat = getContestCategory(contestId);
          return (
            <span className="text-sm font-mono">
              <span className="text-muted-foreground">{cat}</span>{" "}
              {contestId.replace(/^(abc|arc|agc)/, "").replace(/^other_/, "")}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: "problem_index",
        header: "問題",
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.original.problem_index}</span>
        ),
        size: 60,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            タイトル <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/problems/${row.original.id}`}
              className="hover:underline font-medium truncate"
            >
              {row.original.title}
            </Link>
            {row.original.hasNote && (
              <StickyNote className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
        ),
        size: 300,
      },
      {
        accessorKey: "difficulty",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            難易度 <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <DifficultyBadge difficulty={row.original.difficulty} />,
        sortingFn: (a, b) => {
          const da = a.original.difficulty ?? -1;
          const db = b.original.difficulty ?? -1;
          return da - db;
        },
        size: 90,
      },
      {
        id: "status",
        header: "状態",
        cell: ({ row }) => {
          const status = row.original.reviewStatus;
          if (!status) return <span className="text-xs text-muted-foreground">-</span>;
          const labels = { learning: "学習中", reviewing: "復習中", mastered: "習得済" };
          const colors = {
            learning: "text-blue-600 dark:text-blue-400",
            reviewing: "text-amber-600 dark:text-amber-400",
            mastered: "text-green-600 dark:text-green-400",
          };
          return <span className={`text-xs font-medium ${colors[status]}`}>{labels[status]}</span>;
        },
        size: 80,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(row.original.id, !row.original.isBookmarked);
              }}
              title={row.original.isBookmarked ? "ブックマーク解除" : "ブックマーク"}
            >
              {row.original.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <a
              href={`https://atcoder.jp/contests/${row.original.contest_id}/tasks/${row.original.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className="h-7 w-7" title="AtCoderで開く">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        ),
        size: 80,
      },
    ],
    [onToggleBookmark]
  );

  const table = useReactTable({
    data: problems,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 20,
  });

  return (
    <div
      ref={tableContainerRef}
      className="relative overflow-auto rounded-md border"
      style={{ height: "calc(100vh - 280px)" }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-10 px-3 text-left font-medium text-muted-foreground"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                className="border-b hover:bg-muted/50 transition-colors"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          条件に一致する問題が見つかりません
        </div>
      )}
    </div>
  );
}
