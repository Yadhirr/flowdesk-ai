import { createFileRoute } from "@tanstack/react-router";

import { ToolPlaceholder } from "@/components/workspace/ToolPlaceholder";
import { workspaceTools } from "@/lib/tools";

const tool = workspaceTools[2];

export const Route = createFileRoute("/workspace/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — FlowDesk AI" },
      {
        name: "description",
        content:
          "Break objectives into ordered tasks with priorities, effort estimates and realistic sequencing.",
      },
      { property: "og:title", content: "AI Task Planner — FlowDesk AI" },
      {
        property: "og:description",
        content: "Ordered tasks, priorities and schedules for your objectives.",
      },
    ],
  }),
  component: () => <ToolPlaceholder tool={tool} />,
});
