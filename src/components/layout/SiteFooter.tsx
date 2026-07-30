import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/layout/BrandMark";
import { workspaceTools } from "@/lib/tools";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-sm font-semibold">FlowDesk AI</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Five intelligent tools. One seamless workspace.
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tools
          </p>
          <ul className="mt-3 space-y-2">
            {workspaceTools.map((tool) => (
              <li key={tool.id}>
                <Link
                  to={tool.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Workspace
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                to="/workspace"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Workspace overview
              </Link>
            </li>
            <li>
              <Link
                to="/responsible-ai"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Responsible AI
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="page-container py-5">
          <p className="text-xs text-muted-foreground">
            FlowDesk AI — foundation build. Tool experiences are previews and do not yet generate
            content.
          </p>
        </div>
      </div>
    </footer>
  );
}
