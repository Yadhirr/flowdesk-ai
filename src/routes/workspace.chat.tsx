import { createFileRoute } from "@tanstack/react-router";

import { WorkplaceChat } from "@/components/tool/WorkplaceChat";


export const Route = createFileRoute("/workspace/chat")({
  head: () => ({
    meta: [
      { title: "Workplace Chatbot — FlowDesk AI" },
      {
        name: "description",
        content:
          "A multi-turn workplace assistant that keeps context across a conversation for day-to-day questions.",
      },
      { property: "og:title", content: "Workplace Chatbot — FlowDesk AI" },
      {
        property: "og:description",
        content: "Multi-turn conversations with context carried across your workspace.",
      },
    ],
  }),
  component: () => <ToolPlaceholder tool={tool} />,
});
