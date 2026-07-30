import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Layers, Timer } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { workspaceTools } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlowDesk AI — Five AI tools in one workspace" },
      {
        name: "description",
        content:
          "FlowDesk AI is an AI-powered workplace productivity assistant for email drafting, meeting summaries, task planning, research and workplace chat.",
      },
      { property: "og:title", content: "FlowDesk AI — Five AI tools in one workspace" },
      {
        property: "og:description",
        content: "Five intelligent tools. One seamless workspace.",
      },
    ],
  }),
  component: LandingPage,
});

const principles = [
  {
    icon: Layers,
    title: "One workspace",
    body: "Five focused tools share a single interface, so work no longer moves between disconnected apps.",
  },
  {
    icon: Timer,
    title: "Less repetition",
    body: "Routine drafting, summarising and planning follow consistent structures you can reuse every day.",
  },
  {
    icon: ShieldCheck,
    title: "Human oversight",
    body: "Every output is a draft for review. People stay accountable for what is sent and decided.",
  },
];

function LandingPage() {
  return (
    <AppShell>
      <section className="border-b border-border bg-surface">
        <div className="page-container grid gap-10 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:py-24">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">
              Workplace productivity assistant
            </p>
            <h1 className="mt-4 text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl">
              FlowDesk AI: five intelligent tools. One seamless workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Professionals lose hours each week drafting emails, writing up meetings, planning
              schedules and researching topics. FlowDesk AI brings those tasks together in a calm,
              consistent workspace built for everyday professional work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/workspace">Open workspace</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/responsible-ai">Responsible AI approach</Link>
              </Button>
            </div>
          </div>

          <div className="surface-panel min-w-0 p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Built for
            </p>
            <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
              {[
                "Administrative professionals",
                "Project coordinators",
                "Business analysts",
                "Team leaders",
                "Graduates entering professional workplaces",
              ].map((role) => (
                <li key={role} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="min-w-0">{role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="page-container py-16 lg:py-20">
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
      </section>

      <section className="border-t border-border bg-surface">
        <div className="page-container grid gap-6 py-16 sm:grid-cols-3 lg:py-20">
          {principles.map((item) => (
            <div key={item.title} className="min-w-0">
              <span className="grid size-10 place-items-center rounded-lg bg-card text-accent shadow-[var(--shadow-card)]">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
