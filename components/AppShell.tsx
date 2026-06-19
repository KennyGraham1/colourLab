"use client";

import type { ReactNode } from "react";
import {
  Beaker,
  BookOpen,
  Home,
  Palette,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { SectionId } from "@/types";
import { useAppState } from "@/store/AppStateProvider";

interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  hint: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home, hint: "Welcome & overview" },
  { id: "mixer", label: "Mixer", icon: Beaker, hint: "Mix colours interactively" },
  { id: "theory", label: "Theory", icon: BookOpen, hint: "Learn colour theory" },
  { id: "wheel", label: "Wheel", icon: Target, hint: "Wheel & harmonies" },
  { id: "challenges", label: "Challenges", icon: Trophy, hint: "Practice & feedback" },
  { id: "palettes", label: "Palettes", icon: Palette, hint: "Your saved colours" },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-glow"
        style={{
          background:
            "conic-gradient(from 210deg, #6366F1, #8B5CF6, #EC4899, #F59E0B, #22C55E, #06B6D4, #6366F1)",
        }}
        aria-hidden
      >
        <Beaker className="h-5 w-5 drop-shadow" />
      </span>
      <div className="leading-none">
        <p className="text-[15px] font-bold tracking-tight text-ink">
          Colour Lab
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-muted">
          Learn colour by mixing
        </p>
      </div>
    </div>
  );
}

function NavButton({
  item,
  active,
  onNavigate,
  variant,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: (id: SectionId) => void;
  variant: "sidebar" | "pill";
}) {
  const Icon = item.icon;
  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => onNavigate(item.id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
          active
            ? "bg-gradient-to-br from-brand to-accent text-white shadow-soft"
            : "bg-surface text-muted ring-1 ring-border hover:text-ink"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {item.label}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.id)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active
          ? "bg-gradient-to-br from-brand to-accent text-white shadow-soft"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      )}
    >
      <Icon
        className={cn("h-[18px] w-[18px]", active ? "text-white" : "text-muted group-hover:text-brand")}
        aria-hidden
      />
      <span className="flex-1 text-left">{item.label}</span>
    </button>
  );
}

/**
 * Responsive dashboard frame: a vertical sidebar on desktop, a sticky header
 * with a scrollable pill nav on smaller screens.
 */
export function AppShell({
  active,
  onNavigate,
  children,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  children: ReactNode;
}) {
  const { progress } = useAppState();
  const completed = progress.completed.length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-border bg-surface/70 px-4 py-6 backdrop-blur lg:flex">
        <div className="px-1">
          <BrandMark />
        </div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={active === item.id}
              onNavigate={onNavigate}
              variant="sidebar"
            />
          ))}
        </nav>
        <div className="mt-auto">
          <div className="rounded-xl border border-border bg-surface-2/60 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
              Challenges
            </div>
            <p className="mt-1 text-xs text-muted">
              {completed} completed
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all"
                style={{ width: `${Math.min(100, (completed / 6) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <BrandMark />
          </div>
          <nav
            className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={active === item.id}
                onNavigate={onNavigate}
                variant="pill"
              />
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
