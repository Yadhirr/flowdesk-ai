import { useRef, useState } from "react";
import { FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, SelectField, TextAreaField, TextField } from "@/components/tool/fields";
import {
  Disclaimer,
  EmptyState,
  ErrorState,
  LoadingState,
  ResultBlock,
  ResultControls,
  ResultPanel,
  ToolLayout,
} from "@/components/tool/panels";
import { copyText, useToolRun } from "@/components/tool/useToolRun";

const DETAIL_LEVELS = ["Brief", "Standard", "Detailed"] as const;
const NOTES_MAX = 8000;
const NOT_SPECIFIED = "Not specified";

type Form = {
  title: string;
  date: string;
  attendees: string;
  notes: string;
  detail: string;
};

const EMPTY: Form = { title: "", date: "", attendees: "", notes: "", detail: "Standard" };

const EXAMPLE: Form = {
  title: "Q3 onboarding project — weekly sync",
  date: "2026-07-28",
  attendees: "Priya Raman, Jordan Blake, Sam Okafor",
  detail: "Standard",
  notes: `Priya opened with the delivery status. Design review is running two days behind because the supplier has not returned the revised templates.
Decision: we will hold the internal training date and absorb the delay in the review window.
Jordan to chase the supplier for confirmed dates.
Sam raised that the training room booking has not been confirmed yet. No owner agreed.
Open question: do we need a fallback trainer if Priya is on leave in week 3?
Decision: comms to staff go out only once the supplier date is confirmed.
Priya to draft the staff comms by 5 August.`,
};

type Action = { task: string; owner: string; deadline: string };
type Result = {
  summary: string;
  points: string[];
  decisions: string[];
  actions: Action[];
  questions: string[];
};

type Errors = Partial<Record<"title" | "notes", string>>;

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.title.trim()) errors.title = "Enter the meeting title.";
  if (form.notes.trim().length < 80)
    errors.notes = "Add at least 80 characters of raw notes so a summary can be produced.";
  return errors;
}

function splitLines(text: string) {
  return text
    .split(/\n|(?<=\.)\s+(?=[A-Z])/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseOwner(line: string, attendees: string[]) {
  const match = attendees.find((name) =>
    line.toLowerCase().includes(name.split(" ")[0].toLowerCase()),
  );
  return match ?? NOT_SPECIFIED;
}

function parseDeadline(line: string) {
  const match = line.match(
    /\b(by|before|due)\s+([^.,;]+)/i,
  );
  return match ? match[2].trim() : NOT_SPECIFIED;
}

function build(form: Form): Result {
  const attendees = form.attendees
    .split(/,|\n/)
    .map((a) => a.trim())
    .filter(Boolean);
  const lines = splitLines(form.notes);

  const decisions = lines.filter((l) => /^decision\b|\bdecided\b|\bwe will\b/i.test(l));
  const actionLines = lines.filter((l) =>
    /\bto\s+(chase|draft|send|confirm|prepare|review|book|follow up)\b|\baction\b/i.test(l),
  );
  const questions = lines.filter((l) => /\?|open question|unresolved/i.test(l));
  const used = new Set([...decisions, ...actionLines, ...questions]);
  const points = lines.filter((l) => !used.has(l));

  const cap = form.detail === "Brief" ? 3 : form.detail === "Standard" ? 6 : lines.length;

  const actions: Action[] = actionLines.map((line) => ({
    task: line.replace(/^action[:\s-]*/i, ""),
    owner: parseOwner(line, attendees),
    deadline: parseDeadline(line),
  }));

  const summary =
    `${form.title.trim()}${form.date ? ` (${form.date})` : ""} covered ` +
    `${points.length + decisions.length} discussion items, ${decisions.length} decision${
      decisions.length === 1 ? "" : "s"
    } and ${actions.length} action item${actions.length === 1 ? "" : "s"}. ` +
    (attendees.length
      ? `Attendees recorded: ${attendees.join(", ")}.`
      : "No attendee names were supplied, so none are named in this summary.") +
    (questions.length ? ` ${questions.length} question(s) remain unresolved.` : "");

  return {
    summary,
    points: points.slice(0, cap),
    decisions: decisions.length ? decisions : [NOT_SPECIFIED],
    actions,
    questions: questions.length ? questions : [NOT_SPECIFIED],
  };
}

export function MeetingSummarizer() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const { status, result, setResult, error, editing, setEditing, run, clear } =
    useToolRun<Result>();
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const errors = validate(form);
  const shownErrors: Errors = submitted ? errors : {};
  const canSummarize = Object.keys(errors).length === 0;

  const set = <K extends keyof Form>(key: K) => (value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const summarize = () => {
    setSubmitted(true);
    const current = validate(form);
    const first = (["title", "notes"] as const).find((key) => current[key]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    run(() => build(form));
  };

  const clearForm = () => {
    setForm(EMPTY);
    setSubmitted(false);
    clear();
  };

  const asText = (r: Result) =>
    [
      `Executive summary\n${r.summary}`,
      `Key discussion points\n${r.points.map((p) => `• ${p}`).join("\n") || NOT_SPECIFIED}`,
      `Decisions\n${r.decisions.map((d) => `• ${d}`).join("\n")}`,
      `Action items\n${
        r.actions.length
          ? r.actions
              .map((a) => `• ${a.task} — Owner: ${a.owner} — Deadline: ${a.deadline}`)
              .join("\n")
          : NOT_SPECIFIED
      }`,
      `Unresolved questions\n${r.questions.map((q) => `• ${q}`).join("\n")}`,
    ].join("\n\n");

  return (
    <div className="grid min-w-0 gap-8">
      <PageHeader
        eyebrow="Workspace tool"
        title="Meeting Notes Summarizer"
        description="Turn long meeting notes into a concise summary with decisions, owner-tagged actions and open questions."
      />

      <ToolLayout
        form={
          <div className="grid min-w-0 gap-6">
            <FormSection title="Meeting details">
              <TextField
                id="meeting-title"
                label="Meeting title"
                required
                value={form.title}
                onChange={set("title")}
                error={shownErrors.title}
                placeholder="e.g. Q3 onboarding project — weekly sync"
                inputRef={(el) => (refs.current.title = el)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="meeting-date"
                  label="Meeting date"
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                />
                <SelectField
                  id="meeting-detail"
                  label="Detail level"
                  options={DETAIL_LEVELS}
                  value={form.detail}
                  onChange={set("detail")}
                />
              </div>
              <TextField
                id="meeting-attendees"
                label="Attendees"
                value={form.attendees}
                onChange={set("attendees")}
                placeholder="Separate names with commas"
                hint="Names appear in the summary only when you supply them here. Nothing is inferred."
              />
              <TextAreaField
                id="meeting-notes"
                label="Raw meeting notes"
                required
                showCounter
                maxLength={NOTES_MAX}
                rows={12}
                value={form.notes}
                onChange={set("notes")}
                error={shownErrors.notes}
                placeholder="Paste your raw notes or transcript…"
                inputRef={(el) => (refs.current.notes = el)}
              />
            </FormSection>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Button onClick={summarize} disabled={!canSummarize || status === "loading"}>
                Summarize Meeting
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(EXAMPLE);
                  setSubmitted(false);
                }}
              >
                Load Example
              </Button>
              <Button variant="ghost" onClick={clearForm}>
                Clear Form
              </Button>
            </div>
            {!canSummarize ? (
              <p className="text-xs text-muted-foreground">
                Summarize Meeting becomes available once a meeting title and sufficient raw notes
                are entered.
              </p>
            ) : null}
          </div>
        }
        results={
          status === "loading" ? (
            <LoadingState label="Summarising your meeting notes…" />
          ) : status === "error" ? (
            <ErrorState message={error} onRetry={summarize} />
          ) : status === "success" && result ? (
            <ResultPanel
              title="Meeting summary"
              controls={
                <ResultControls
                  editing={editing}
                  onToggleEdit={() => setEditing(!editing)}
                  onCopy={() => copyText(asText(result))}
                  onRegenerate={summarize}
                  onClear={clear}
                />
              }
              footer={
                <Disclaimer>
                  When an owner or deadline is absent, FlowDesk AI will identify it as not
                  specified rather than guessing.
                </Disclaimer>
              }
            >
              <ResultBlock title="Executive summary">
                {editing ? (
                  <Textarea
                    aria-label="Executive summary"
                    rows={5}
                    value={result.summary}
                    onChange={(e) => setResult({ ...result, summary: e.target.value })}
                  />
                ) : (
                  <p>{result.summary}</p>
                )}
              </ResultBlock>

              <ResultBlock title="Key discussion points">
                {editing ? (
                  <Textarea
                    aria-label="Key discussion points"
                    rows={6}
                    value={result.points.join("\n")}
                    onChange={(e) =>
                      setResult({ ...result, points: e.target.value.split("\n") })
                    }
                  />
                ) : result.points.length ? (
                  <ul className="grid gap-2">
                    {result.points.map((point, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span className="min-w-0">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">{NOT_SPECIFIED}</p>
                )}
              </ResultBlock>

              <ResultBlock title="Decisions">
                <ul className="grid gap-2">
                  {result.decisions.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="min-w-0">{d}</span>
                    </li>
                  ))}
                </ul>
              </ResultBlock>

              <ResultBlock title="Action items">
                {result.actions.length ? (
                  <ul className="grid gap-3">
                    {result.actions.map((action, i) => (
                      <li key={i} className="rounded-lg border border-border p-3">
                        <p className="font-medium">{action.task}</p>
                        <dl className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                          <div className="flex gap-1">
                            <dt className="font-semibold">Owner:</dt>
                            <dd>{action.owner}</dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="font-semibold">Deadline:</dt>
                            <dd>{action.deadline}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No action items were identified in these notes.
                  </p>
                )}
              </ResultBlock>

              <ResultBlock title="Unresolved questions">
                <ul className="grid gap-2">
                  {result.questions.map((q, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="min-w-0">{q}</span>
                    </li>
                  ))}
                </ul>
              </ResultBlock>
            </ResultPanel>
          ) : (
            <div className="grid gap-4">
              <EmptyState
                icon={FileText}
                title="Your summary will appear here"
                description="Add a meeting title and your raw notes, then select Summarize Meeting to see decisions, owner-tagged actions and open questions."
              />
              <Disclaimer>
                When an owner or deadline is absent, FlowDesk AI will identify it as not specified
                rather than guessing.
              </Disclaimer>
            </div>
          )
        }
      />
    </div>
  );
}
