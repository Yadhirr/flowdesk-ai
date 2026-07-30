import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-2xl font-semibold text-balance sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
