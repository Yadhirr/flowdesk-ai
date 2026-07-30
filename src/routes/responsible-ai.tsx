import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — FlowDesk AI" },
      {
        name: "description",
        content:
          "How FlowDesk AI approaches human oversight, accuracy, privacy, fairness and transparency in workplace AI tools.",
      },
      { property: "og:title", content: "Responsible AI — FlowDesk AI" },
      {
        property: "og:description",
        content: "Our commitments on oversight, accuracy, privacy, fairness and transparency.",
      },
    ],
  }),
  component: ResponsibleAiPage,
});

const commitments = [
  {
    title: "Human oversight",
    body: "Outputs are drafts, not decisions. A person reviews and approves anything that is sent, shared or acted upon.",
  },
  {
    title: "Accuracy and verification",
    body: "AI-generated text can be incomplete or wrong. Research summaries and meeting notes should always be checked against the underlying source.",
  },
  {
    title: "Privacy by default",
    body: "Avoid entering personal, confidential or client-identifying information. This foundation build stores nothing and connects to no external service.",
  },
  {
    title: "Fairness",
    body: "Language models can reflect bias present in training data. Review tone and wording before using generated content in decisions about people.",
  },
  {
    title: "Transparency",
    body: "Where AI assistance materially shapes a document or a plan, say so. Colleagues should know what was drafted with assistance.",
  },
  {
    title: "Appropriate use",
    body: "FlowDesk AI supports routine professional communication and planning. It is not a substitute for legal, financial, medical or HR advice.",
  },
];

function ResponsibleAiPage() {
  return (
    <AppShell>
      <div className="page-container grid gap-10 py-12 lg:py-16">
        <PageHeader
          eyebrow="Our approach"
          title="Responsible AI"
          description="FlowDesk AI is designed for workplace use, where accuracy, privacy and accountability matter. These principles guide how the tools are built and how they should be used."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {commitments.map((item) => (
            <section key={item.title} className="surface-panel min-w-0 p-6">
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </section>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold">Current status</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            This release is the application foundation only. No AI model, backend, account system
            or third-party service is connected, and no user data is collected or stored.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
