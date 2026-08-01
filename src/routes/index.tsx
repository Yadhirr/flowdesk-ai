import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  MousePointerClick,
  PencilLine,
  ClipboardCheck,
  Mail,
  ListChecks,
  CalendarClock,
  BookOpen,
  Repeat,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { workspaceTools } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlowDesk AI | Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "FlowDesk AI combines intelligent email drafting, meeting summarisation, task planning, research analysis and conversational workplace support in one responsible AI workspace.",
      },
      { property: "og:title", content: "FlowDesk AI | Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "FlowDesk AI combines intelligent email drafting, meeting summarisation, task planning, research analysis and conversational workplace support in one responsible AI workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const problems = [
  { icon: Mail, text: "Drafting the same kinds of emails again and again" },
  { icon: ListChecks, text: "Turning rough meeting notes into clear actions" },
  { icon: CalendarClock, text: "Organising competing tasks and deadlines" },
  { icon: BookOpen, text: "Reading and understanding lengthy information" },
  { icon: Repeat, text: "Switching between separate productivity tools" },
];

const steps = [
  {
    icon: MousePointerClick,
    title: "Select a tool",
    body: "Choose the tool that matches the task in front of you — email, meetings, planning, research or workplace questions.",
  },
  {
    icon: PencilLine,
    title: "Provide workplace context",
    body: "Add the purpose, audience, notes or constraints. The more specific your context, the more useful the draft.",
  },
  {
    icon: ClipboardCheck,
    title: "Review and refine the output",
    body: "Every result is an editable draft. Check facts, names and dates, adjust the wording, then use it in your own workflow.",
  },
];

const responsibleAiPoints = [
  "AI outputs are editable drafts, never final decisions.",
  "Important information must be verified by you before it is used.",
  "Confidential, personal or client-identifying information should not be entered.",
  "FlowDesk AI does not send emails or perform actions in your workplace systems.",
  "Where a fact is missing, it should be identified as not specified rather than invented.",
];

function LandingPage() {
  return (
    <AppShell>
      <section className="border-b border-border bg-surface">
        <div className="page-container grid gap-10 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:py-24">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">
              Workplace productivity assistant
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl">
              Bring Your Workday Into One Intelligent Workspace
            </h1>
            <p className="mt-4 text-base font-medium text-accent">
              Five intelligent tools. One seamless workspace.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Draft professional emails, transform meeting notes into actions, organise your
              workload, understand complex information and receive workplace support from one
              responsible AI assistant.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/workspace">Open My Workspace</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/" hash="features">
                  Explore the Tools
                </Link>
              </Button>
            </div>
          </div>

          <WorkspacePreview />
        </div>
      </section>

      <section className="page-container py-16 lg:py-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">The everyday admin that slows work down</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Across industries, professionals spend a significant share of the working week on tasks
          that are necessary but repetitive.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((item) => (
            <li key={item.text} className="surface-panel flex min-w-0 items-start gap-3 p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
                <item.icon className="size-4" />
              </span>
              <span className="min-w-0 text-sm leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="features" className="scroll-mt-24 border-y border-border bg-surface">
        <div className="page-container py-16 lg:py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">The five tools</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Each tool covers one recurring workplace task and shares the same interface patterns, so
            moving between them requires no relearning.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workspaceTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="page-container scroll-mt-24 py-16 lg:py-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="surface-panel min-w-0 p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
                  <step.icon className="size-5" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="page-container grid gap-8 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-20">
          <div className="min-w-0">
            <span className="grid size-10 place-items-center rounded-lg bg-card text-accent shadow-[var(--shadow-card)]">
              <ShieldCheck className="size-5" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">Responsible by design</h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
              FlowDesk AI is built for professional settings, where accuracy, privacy and
              accountability matter more than speed alone.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full sm:w-auto">
              <Link to="/responsible-ai">Read the full Responsible AI page</Link>
            </Button>
          </div>
          <ul className="grid min-w-0 gap-3">
            {responsibleAiPoints.map((point) => (
              <li key={point} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span className="min-w-0 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-container py-16 lg:py-20">
        <div className="surface-panel grid gap-5 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold text-balance sm:text-3xl">
            Ready to Simplify Your Workday?
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Open the workspace and choose the tool that matches the task in front of you.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/workspace">Open My Workspace</Link>
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function WorkspacePreview() {
  return (
    <div
      aria-hidden
      className="surface-panel min-w-0 overflow-hidden p-4 shadow-[var(--shadow-raised)] sm:p-5"
    >
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-2 truncate text-xs font-medium text-muted-foreground">
          FlowDesk AI — Workspace
        </span>
      </div>

      <div className="grid gap-4 pt-4 sm:grid-cols-[130px_minmax(0,1fr)]">
        <div className="hidden flex-col gap-1.5 sm:flex">
          {workspaceTools.map((tool, index) => (
            <div
              key={tool.id}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium ${
                index === 0 ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
              }`}
            >
              <tool.icon className="size-3.5 shrink-0 text-accent" />
              <span className="truncate">{tool.shortName}</span>
            </div>
          ))}
        </div>

        <div className="min-w-0 space-y-3">
          <div className="space-y-2">
            <div className="h-2 w-24 rounded bg-muted" />
            <div className="h-9 rounded-lg border border-border bg-muted/50" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-2 w-16 rounded bg-muted" />
              <div className="h-9 rounded-lg border border-border bg-muted/50" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-16 rounded bg-muted" />
              <div className="h-9 rounded-lg border border-border bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-20 rounded bg-muted" />
            <div className="h-20 rounded-lg border border-border bg-muted/50" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-md bg-primary/90" />
            <div className="h-8 w-20 rounded-md border border-border" />
          </div>
          <div className="rounded-lg border border-dashed border-border p-3">
            <div className="h-2 w-32 rounded bg-muted" />
            <div className="mt-2 h-2 w-full rounded bg-muted" />
            <div className="mt-2 h-2 w-4/5 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
