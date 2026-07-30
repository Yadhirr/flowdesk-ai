import type { ReactNode } from "react";
import { AlertTriangle, Copy, Eraser, Info, Loader2, Pencil, RefreshCw, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type ToolStatus = "idle" | "loading" | "error" | "success";

export function ToolLayout({
  form,
  results,
}: {
  form: ReactNode;
  results: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section className="surface-panel min-w-0 p-5 sm:p-7">{form}</section>
      <section
        aria-live="polite"
        className="min-w-0 lg:sticky lg:top-24"
      >
        {results}
      </section>
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-border bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
      <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-panel grid min-w-0 place-items-center border-dashed p-8 text-center sm:p-12">
      <div className="grid max-w-sm gap-3 justify-items-center">
        <span className="grid size-11 place-items-center rounded-full bg-secondary text-accent">
          <Icon className="size-5" />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="surface-panel min-w-0 p-5 sm:p-7">
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <Loader2 aria-hidden className="size-4 animate-spin" />
        {label}
      </div>
      <div className="mt-6 grid gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="mt-4 h-5 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-10/12" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="surface-panel min-w-0 border-destructive/40 p-5 sm:p-7"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-destructive">Something went wrong</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </div>
      <Button className="mt-5 w-full sm:w-auto" variant="outline" onClick={onRetry}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}

export function ResultControls({
  editing,
  onToggleEdit,
  onCopy,
  onRegenerate,
  onClear,
}: {
  editing: boolean;
  onToggleEdit: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
  onClear: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap">
      <Button variant={editing ? "default" : "outline"} size="sm" onClick={onToggleEdit}>
        <Pencil className="size-4" />
        {editing ? "Done editing" : "Edit"}
      </Button>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button variant="outline" size="sm" onClick={onRegenerate}>
        <RefreshCw className="size-4" />
        Regenerate
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <Eraser className="size-4" />
        Clear
      </Button>
    </div>
  );
}

export function ResultPanel({
  title,
  controls,
  children,
  footer,
}: {
  title: string;
  controls: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="surface-panel min-w-0 p-5 sm:p-7">
      <div className="grid gap-3 border-b border-border pb-4 sm:flex sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {controls}
      </div>
      <div className="mt-5 grid gap-5">{children}</div>
      {footer ? <div className="mt-6 border-t border-border pt-4">{footer}</div> : null}
    </div>
  );
}

export function ResultBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="mt-2 min-w-0 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
