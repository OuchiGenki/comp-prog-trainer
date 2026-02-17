"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X } from "lucide-react";
import type { ProblemFilters, ContestCategory } from "@/types";
import { cn } from "@/lib/utils";

interface ProblemFiltersBarProps {
  filters: ProblemFilters;
  onChange: (filters: ProblemFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const contestCategories: ContestCategory[] = ["ABC", "ARC", "AGC", "Other"];

export function ProblemFiltersBar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: ProblemFiltersBarProps) {
  const toggleCategory = (cat: ContestCategory) => {
    const current = filters.contestCategories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    onChange({ ...filters, contestCategories: next });
  };

  const hasActiveFilters =
    filters.search ||
    filters.difficultyRange[0] !== 0 ||
    filters.difficultyRange[1] !== 4000 ||
    filters.contestCategories.length > 0 ||
    filters.reviewStatus !== "all" ||
    filters.bookmarked;

  const clearFilters = () => {
    onChange({
      search: "",
      difficultyRange: [0, 4000],
      contestCategories: [],
      reviewStatus: "all",
      bookmarked: false,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="問題名・コンテストIDで検索..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Review status */}
        <Select
          value={filters.reviewStatus}
          onValueChange={(v) => onChange({ ...filters, reviewStatus: v as ProblemFilters["reviewStatus"] })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="復習状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            <SelectItem value="not_added">未追加</SelectItem>
            <SelectItem value="learning">学習中</SelectItem>
            <SelectItem value="reviewing">復習中</SelectItem>
            <SelectItem value="mastered">習得済</SelectItem>
            <SelectItem value="due">要復習</SelectItem>
          </SelectContent>
        </Select>

        {/* Bookmark filter */}
        <Button
          variant={filters.bookmarked ? "default" : "outline"}
          size="sm"
          onClick={() => onChange({ ...filters, bookmarked: !filters.bookmarked })}
        >
          ブックマーク
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" /> クリア
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Contest categories */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-1">コンテスト:</span>
          {contestCategories.map((cat) => (
            <Badge
              key={cat}
              variant={filters.contestCategories.includes(cat) ? "default" : "outline"}
              className={cn("cursor-pointer")}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Difficulty range */}
        <div className="flex items-center gap-2 min-w-[250px]">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            難易度: {filters.difficultyRange[0]}〜{filters.difficultyRange[1]}
          </span>
          <Slider
            min={0}
            max={4000}
            step={100}
            value={filters.difficultyRange}
            onValueChange={(v) =>
              onChange({ ...filters, difficultyRange: v as [number, number] })
            }
            className="flex-1"
          />
        </div>

        <span className="text-sm text-muted-foreground ml-auto">
          {filteredCount.toLocaleString()} / {totalCount.toLocaleString()} 問
        </span>
      </div>
    </div>
  );
}
