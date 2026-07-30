import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark } from "@/components/layout/BrandMark";
import { workspaceTools } from "@/lib/tools";

const primaryLinks = [
  { label: "Workspace", to: "/workspace" },
  { label: "Responsible AI", to: "/responsible-ai" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="page-container grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <BrandMark />
          <span className="truncate font-display text-base font-semibold tracking-tight">
            FlowDesk AI
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link to="/workspace">Open workspace</Link>
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Open navigation menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col gap-6 px-5 pt-10 pb-8">
              <div className="flex items-center gap-2.5">
                <BrandMark />
                <span className="font-display text-base font-semibold">FlowDesk AI</span>
              </div>

              <nav className="flex flex-col gap-1">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-1">
                <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Tools
                </p>
                {workspaceTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <tool.icon className="size-4 shrink-0 text-accent" />
                    <span className="truncate">{tool.name}</span>
                  </Link>
                ))}
              </div>

              <Button asChild onClick={() => setOpen(false)}>
                <Link to="/workspace">Open workspace</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
