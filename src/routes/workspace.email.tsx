import { createFileRoute } from "@tanstack/react-router";

import { ToolPlaceholder } from "@/components/workspace/ToolPlaceholder";
import { workspaceTools } from "@/lib/tools";

const tool = workspaceTools[0];

export const Route = createFileRoute("/workspace/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — FlowDesk AI" },
      {
        name: "description",
        content:
          "Draft clear, professional workplace emails with consistent tone, structure and formality in the FlowDesk AI workspace.",
      },
      { property: "og:title", content: "Smart Email Generator — FlowDesk AI" },
      {
        property: "og:description",
        content: "Professional email drafting with controllable tone and structure.",
      },
    ],
  }),
  component: () => <ToolPlaceholder tool={tool} />,
});
