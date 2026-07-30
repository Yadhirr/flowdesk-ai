import {
  Mail,
  FileText,
  CalendarClock,
  Search,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

export type WorkspaceTool = {
  id: string;
  name: string;
  shortName: string;
  to: string;
  icon: LucideIcon;
  summary: string;
  capabilities: string[];
};

export const workspaceTools: WorkspaceTool[] = [
  {
    id: "email",
    name: "Smart Email Generator",
    shortName: "Email",
    to: "/workspace/email",
    icon: Mail,
    summary:
      "Draft clear, professional workplace emails with a consistent tone, structure and level of formality.",
    capabilities: [
      "Choose tone, audience and length",
      "Reply, follow-up and announcement formats",
      "Reusable drafts for recurring communication",
    ],
  },
  {
    id: "meetings",
    name: "Meeting Notes Summarizer",
    shortName: "Meetings",
    to: "/workspace/meetings",
    icon: FileText,
    summary:
      "Turn long meeting notes and transcripts into concise summaries, decisions and action items.",
    capabilities: [
      "Key points and decisions",
      "Owner-tagged action items",
      "Shareable summary formats",
    ],
  },
  {
    id: "planner",
    name: "AI Task Planner",
    shortName: "Planner",
    to: "/workspace/planner",
    icon: CalendarClock,
    summary:
      "Break objectives into ordered tasks with realistic sequencing, priorities and time estimates.",
    capabilities: [
      "Priority and effort suggestions",
      "Daily and weekly schedule views",
      "Dependency-aware task ordering",
    ],
  },
  {
    id: "research",
    name: "AI Research Assistant",
    shortName: "Research",
    to: "/workspace/research",
    icon: Search,
    summary:
      "Gather background on a topic, compare options and produce structured briefing notes.",
    capabilities: [
      "Structured topic briefs",
      "Comparison tables for options",
      "Source notes you can verify",
    ],
  },
  {
    id: "chat",
    name: "Workplace Chatbot",
    shortName: "Chat",
    to: "/workspace/chat",
    icon: MessagesSquare,
    summary:
      "A multi-turn assistant that keeps context across a conversation for day-to-day work questions.",
    capabilities: [
      "Multi-turn conversation memory",
      "Context carried between tools",
      "Saved conversation history",
    ],
  },
];

export const getTool = (id: string) => workspaceTools.find((tool) => tool.id === id);
