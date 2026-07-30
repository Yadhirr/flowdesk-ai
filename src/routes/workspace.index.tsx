import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/PageHeader";
import { ToolCard } from "@/components/ToolCard";
import { workspaceTools } from "@/lib/tools";

export const Route = createFileRoute("/workspace/")({
  head: () => ({
    meta: [
      { title: "Workspace — FlowDesk AI" },
      {
        name: "description",
        content:
          "Your FlowDesk AI workspace: email drafting, meeting summaries, task planning, research and workplace chat in one place.",
      },
      { property: "og:title", content: "Workspace — FlowDesk AI" },
      {
        property: "og:description",
        content: "Five focused productivity tools in one consistent workspace.",
      },
    ],
  }),
  component: WorkspaceOverview,
});

function WorkspaceOverview() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Overview"
        title="Your workspace"
        description="Choose a tool to get started. This foundation build shows the layout and structure of each tool; generation is not connected yet."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {workspaceTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
