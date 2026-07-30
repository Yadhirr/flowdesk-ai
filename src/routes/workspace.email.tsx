import { createFileRoute } from "@tanstack/react-router";

import { EmailGenerator } from "@/components/tool/EmailGenerator";

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
  component: EmailGenerator,
});
