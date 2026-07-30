import { createFileRoute } from "@tanstack/react-router";

import { ToolPlaceholder } from "@/components/workspace/ToolPlaceholder";
import { workspaceTools } from "@/lib/tools";

const tool = workspaceTools[1];

export const Route = createFileRoute("/workspace/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — FlowDesk AI" },
      {
        name: "description",
        content:
          "Turn long meeting notes into concise summaries, decisions and owner-tagged action items.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — FlowDesk AI" },
      {
        property: "og:description",
        content: "Concise summaries, decisions and action items from meeting notes.",
      },
    ],
  }),
  component: () => <ToolPlaceholder tool={tool} />,
});
