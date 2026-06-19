"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
}

export function Card({ className, as = "div", ...props }: CardProps) {
  const Comp = as;
  return (
    <Comp
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-soft",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-border px-5 py-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            {icon}
          </span>
        ) : null}
        <div>
          <h3 className="text-base font-semibold leading-tight text-ink">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-muted text-pretty">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
