import { Link } from "@tanstack/react-router";

import { workspaceTools } from "@/lib/tools";

export function WorkspaceNav() {
  return (
    <nav
      aria-label="Workspace tools"
      className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0"
    >
      <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
        <li>
          <Link
            to="/workspace"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-secondary text-secondary-foreground" }}
            className="block rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-secondary"
          >
            Overview
          </Link>
        </li>
        {workspaceTools.map((tool) => (
          <li key={tool.id}>
            <Link
              to={tool.to}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-secondary"
            >
              <tool.icon className="size-4 shrink-0 text-accent" />
              {tool.shortName}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
