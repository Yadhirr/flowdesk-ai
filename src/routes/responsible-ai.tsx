import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { workspaceTools } from "@/lib/tools";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — FlowDesk AI" },
      {
        name: "description",
        content:
          "How FlowDesk AI approaches human review, accuracy limitations, fabrication risk, bias, confidentiality and tool-specific limitations.",
      },
      { property: "og:title", content: "Responsible AI — FlowDesk AI" },
      {
        property: "og:description",
        content: "Human review, accuracy limits, confidentiality and tool-specific guidance.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResponsibleAiPage,
});

const commitments = [
  {
    title: "Why responsible AI matters here",
    body: "FlowDesk AI is used for workplace communication and planning, where wording, dates and commitments have real consequences. Responsible use means treating the assistant as support for your judgement, not a replacement for it.",
  },
  {
    title: "Human review is required",
    body: "Every output is an editable draft. A person must read, correct and approve anything that is sent, shared, scheduled or acted upon. Accountability for the final content stays with you.",
  },
  {
    title: "Accuracy limitations",
    body: "Language models can misread context, drop important detail or state something confidently that is wrong. Check facts, figures, names, dates and deadlines against the original source before relying on them.",
  },
  {
    title: "Fabrication risk",
    body: "When information is missing, an AI model may fill the gap with something plausible but invented. FlowDesk AI is designed to mark missing owners, dates and details as not specified — if you see a detail you did not provide, treat it as unverified.",
  },
  {
    title: "Bias and inclusive language",
    body: "Models reflect patterns in their training data, which can carry bias in tone, assumptions or word choice. Review generated text for fair, respectful and inclusive language, particularly where it concerns people, performance or decisions.",
  },
  {
    title: "Confidentiality",
    body: "Do not enter personal data, client-identifying details, credentials, commercially sensitive information or anything covered by a confidentiality obligation. Summarise or anonymise context instead.",
  },
];

const toolLimitations = [
  {
    id: "email",
    text: "Produces a draft only. It does not send email, add attachments, or know your recipients, threads or organisational tone conventions.",
  },
  {
    id: "meetings",
    text: "Summarises only the notes you paste in. It cannot hear a meeting, resolve contradictions in the notes, or infer an owner or deadline that was never stated.",
  },
  {
    id: "planner",
    text: "Suggests an order and time blocks based on what you enter. It has no access to your calendar, cannot create events, and does not know interruptions or real availability.",
  },
  {
    id: "research",
    text: "Produces structured briefing notes that must be verified against primary sources. It is not a citation service and may present outdated or incomplete background.",
  },
  {
    id: "chat",
    text: "Offers general workplace guidance only. It is not legal, financial, medical or HR advice, and it has no knowledge of your organisation's policies.",
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

        <div className="flex gap-3 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-accent shadow-[var(--shadow-card)]">
            <AlertTriangle className="size-4" />
          </span>
          <p className="min-w-0 text-sm leading-relaxed">
            AI-generated content may contain errors, omissions or unsuitable wording. Verify
            important facts, dates, responsibilities, deadlines and recommendations before taking
            action.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {commitments.map((item) => (
            <section key={item.title} className="surface-panel min-w-0 p-6">
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </section>
          ))}
        </div>

        <section className="grid gap-5">
          <h2 className="text-xl font-semibold sm:text-2xl">Tool-specific limitations</h2>
          <ul className="grid gap-4">
            {toolLimitations.map((limitation) => {
              const tool = workspaceTools.find((item) => item.id === limitation.id);
              if (!tool) return null;
              return (
                <li key={limitation.id} className="surface-panel flex min-w-0 gap-4 p-5 sm:p-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
                    <tool.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{tool.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {limitation.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold">Clearing your session</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Anything you type stays in your browser for the length of your visit — nothing is sent
            to a server or stored remotely. Use the Clear controls inside each tool to remove your
            input and results when you are finished, and close or refresh the tab on a shared or
            public computer. Clearing cannot be undone, so copy anything you want to keep first.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold">Current status</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            This release is the application foundation. No AI model, backend, account system or
            third-party service is connected, and no user data is collected or stored. Return to the{" "}
            <Link
              to="/workspace"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              workspace
            </Link>{" "}
            to explore the tools.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
