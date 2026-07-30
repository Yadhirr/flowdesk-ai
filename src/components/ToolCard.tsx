import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import type { WorkspaceTool } from "@/lib/tools";

export function ToolCard({ tool, size = "default" }: { tool: WorkspaceTool; size?: "default" | "large" }) {
  const large = size === "large";

  return (
    <Link
      to={tool.to}
      className={`surface-panel group flex flex-col gap-4 transition-shadow hover:shadow-[var(--shadow-raised)] ${
        large ? "p-6 sm:p-7" : "p-6"
      }`}
    >
      <span
        className={`grid shrink-0 place-items-center rounded-lg bg-secondary text-accent ${
          large ? "size-12" : "size-10"
        }`}
      >
        <tool.icon className={large ? "size-6" : "size-5"} />
      </span>
      <div className="min-w-0">
        <h3 className={large ? "text-lg font-semibold" : "text-base font-semibold"}>{tool.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.summary}</p>
        <p className="mt-3 border-l-2 border-accent pl-3 text-sm leading-relaxed text-foreground/80">
          {tool.benefit}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Open tool
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
