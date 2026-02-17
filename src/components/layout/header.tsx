"use client";

import { ThemeToggle } from "./theme-toggle";
import { useSync } from "@/hooks/use-sync";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function Header() {
  const { isSyncing, progress, stage, sync } = useSync();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left spacer for mobile hamburger */}
      <div className="w-8 md:hidden" />

      <div className="flex items-center gap-2">
        {isSyncing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{stage}</span>
            <Progress value={progress} className="w-24 h-2" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => sync(true)}
          disabled={isSyncing}
          title="データを再同期"
        >
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
