"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
