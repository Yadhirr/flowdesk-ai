import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import type { WorkspaceTool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: WorkspaceTool }) {
  return (
    <Link
      to={tool.to}
      className="surface-panel group flex flex-col gap-4 p-6 transition-shadow hover:shadow-[var(--shadow-raised)]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
        <tool.icon className="size-5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-semibold">{tool.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.summary}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Open tool
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
