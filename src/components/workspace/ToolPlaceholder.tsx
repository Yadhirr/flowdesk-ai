import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import type { WorkspaceTool } from "@/lib/tools";

export function ToolPlaceholder({ tool }: { tool: WorkspaceTool }) {
  return (
    <div className="grid gap-8">
      <PageHeader eyebrow="Workspace tool" title={tool.name} description={tool.summary} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="surface-panel min-w-0 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-medium text-accent">
            <Sparkles className="size-4 shrink-0" />
            Interface preview
          </div>
          <h2 className="mt-3 text-lg font-semibold">Not connected yet</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            This is the foundation layout for {tool.name}. The input, controls and output panels
            will be added in a later stage. No AI service is connected and nothing you enter is
            stored.
          </p>

          <div className="mt-6 grid gap-3">
            <div className="h-11 rounded-lg border border-dashed border-border bg-muted/60" />
            <div className="h-28 rounded-lg border border-dashed border-border bg-muted/60" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-11 rounded-lg border border-dashed border-border bg-muted/60" />
              <div className="h-11 rounded-lg border border-dashed border-border bg-muted/60" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button disabled>Generate</Button>
            <Button variant="outline" asChild>
              <Link to="/workspace">Back to workspace</Link>
            </Button>
          </div>
        </section>

        <aside className="surface-panel min-w-0 p-6 sm:p-8">
          <h2 className="text-sm font-semibold">Planned capabilities</h2>
          <ul className="mt-4 space-y-3">
            {tool.capabilities.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            Review any AI-assisted output before sending or acting on it. See our{" "}
            <Link to="/responsible-ai" className="font-medium text-primary underline-offset-4 hover:underline">
              Responsible AI
            </Link>{" "}
            approach.
          </p>
        </aside>
      </div>
    </div>
  );
}
