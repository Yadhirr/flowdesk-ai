import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceNav } from "@/components/workspace/WorkspaceNav";

export const Route = createFileRoute("/workspace")({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <AppShell>
      <div className="page-container grid gap-8 py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-14">
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="hidden pb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
            Workspace
          </p>
          <WorkspaceNav />
        </div>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}
