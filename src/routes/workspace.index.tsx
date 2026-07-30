import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ToolCard } from "@/components/ToolCard";
import { workspaceTools } from "@/lib/tools";

export const Route = createFileRoute("/workspace/")({
  head: () => ({
    meta: [
      { title: "Workspace — FlowDesk AI" },
      {
        name: "description",
        content:
          "Your FlowDesk AI workspace: email drafting, meeting summaries, task planning, research and workplace chat in one place.",
      },
      { property: "og:title", content: "Workspace — FlowDesk AI" },
      {
        property: "og:description",
        content: "Five focused productivity tools in one consistent workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkspaceOverview,
});

function WorkspaceOverview() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Overview"
        title="Welcome to Your FlowDesk"
        description="Choose a tool to get started. Each tool takes the context you provide and returns an editable draft you review before using it."
      />

      <div className="flex gap-3 rounded-xl border border-border bg-surface p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-accent shadow-[var(--shadow-card)]">
          <ShieldCheck className="size-4" />
        </span>
        <p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
          AI-generated content may contain errors, omissions or unsuitable wording. Verify important
          facts, dates, responsibilities, deadlines and recommendations before taking action. Avoid
          entering confidential information.{" "}
          <Link
            to="/responsible-ai"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Responsible AI guidance
          </Link>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {workspaceTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} size="large" />
        ))}
      </div>
    </div>
  );
}
