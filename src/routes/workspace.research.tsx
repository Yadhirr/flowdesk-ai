import { createFileRoute } from "@tanstack/react-router";

import { ResearchAssistant } from "@/components/tool/ResearchAssistant";


export const Route = createFileRoute("/workspace/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — FlowDesk AI" },
      {
        name: "description",
        content:
          "Gather background on a topic, compare options and produce structured briefing notes you can verify.",
      },
      { property: "og:title", content: "AI Research Assistant — FlowDesk AI" },
      {
        property: "og:description",
        content: "Structured briefs and option comparisons for workplace research.",
      },
    ],
  }),
  component: ResearchAssistant,
});
