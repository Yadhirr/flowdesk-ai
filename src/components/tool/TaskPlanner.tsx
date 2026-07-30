import { useRef, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";

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

const PERIODS = ["Daily", "Weekly"] as const;
const LEVELS = ["Low", "Medium", "High"] as const;
const BREAKS = [
  "Short breaks every hour",
  "One 15-minute break each half day",
  "A 45-minute lunch break",
  "No scheduled breaks",
] as const;

type Task = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  duration: string;
  urgency: string;
  importance: string;
  dependencies: string;
};

type TaskErrors = { name?: string; duration?: string };

const newTask = (): Task => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  deadline: "",
  duration: "",
  urgency: "Medium",
  importance: "Medium",
  dependencies: "",
});

const EXAMPLE_TASKS: Task[] = [
  {
    id: "example-1",
    name: "Draft supplier follow-up email",
    description: "Chase confirmed delivery dates for onboarding materials.",
    deadline: "2026-08-03",
    duration: "30",
    urgency: "High",
    importance: "High",
    dependencies: "",
  },
  {
    id: "example-2",
    name: "Prepare weekly project report",
    description: "Summarise status, risks and next steps for the steering group.",
    deadline: "2026-08-05",
    duration: "90",
    urgency: "Medium",
    importance: "High",
    dependencies: "Draft supplier follow-up email",
  },
  {
    id: "example-3",
    name: "Tidy shared document library",
    description: "Archive superseded onboarding drafts.",
    deadline: "",
    duration: "45",
    urgency: "Low",
    importance: "Low",
    dependencies: "",
  },
];

type Block = { start: string; end: string; label: string; kind: "task" | "break" };
type Result = {
  prioritised: { name: string; score: string; reason: string }[];
  schedule: Block[];
  breaks: string[];
  conflicts: string[];
  postpone: string[];
  recommendations: string[];
};

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function toTime(mins: number) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function taskErrors(task: Task): TaskErrors {
  const errors: TaskErrors = {};
  if (!task.name.trim()) errors.name = "Enter a task name.";
  const duration = Number(task.duration);
  if (!task.duration.trim()) errors.duration = "Enter an estimated duration in minutes.";
  else if (!Number.isFinite(duration) || duration <= 0)
    errors.duration = "Duration must be greater than zero minutes.";
  else if (duration > 24 * 60) errors.duration = "Duration cannot exceed 24 hours.";
  return errors;
}

function build(
  tasks: Task[],
  period: string,
  start: string,
  end: string,
  breakPref: string,
): Result {
  const weight = { High: 3, Medium: 2, Low: 1 } as const;
  const scored = tasks
    .map((task) => ({
      task,
      score:
        weight[task.urgency as keyof typeof weight] * 2 +
        weight[task.importance as keyof typeof weight] * 2 +
        (task.deadline ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  // Dependencies first
  const ordered: typeof scored = [];
  const pending = [...scored];
  while (pending.length) {
    const idx = pending.findIndex(({ task }) => {
      const deps = task.dependencies
        .split(",")
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);
      return deps.every(
        (dep) =>
          ordered.some((o) => o.task.name.toLowerCase().includes(dep)) ||
          !pending.some((p) => p.task.name.toLowerCase().includes(dep)),
      );
    });
    ordered.push(...pending.splice(idx === -1 ? 0 : idx, 1));
  }

  const dayStart = toMinutes(start);
  const dayEnd = toMinutes(end);
  const capacity = Math.max(0, dayEnd - dayStart) * (period === "Weekly" ? 5 : 1);

  const schedule: Block[] = [];
  const breaks: string[] = [];
  const postpone: string[] = [];
  const conflicts: string[] = [];

  let cursor = dayStart;
  let sinceBreak = 0;
  let used = 0;

  for (const { task } of ordered) {
    const duration = Number(task.duration);
    if (used + duration > capacity) {
      postpone.push(
        `${task.name} (${duration} min) — no capacity left in the ${period.toLowerCase()} window; postpone or renegotiate.`,
      );
      continue;
    }
    if (cursor + duration > dayEnd) {
      if (period === "Weekly") {
        cursor = dayStart;
        sinceBreak = 0;
        schedule.push({ start: "", end: "", label: "Next available day", kind: "break" });
      } else {
        postpone.push(
          `${task.name} (${duration} min) — extends beyond ${end}; postpone or renegotiate.`,
        );
        continue;
      }
    }
    if (
      breakPref !== "No scheduled breaks" &&
      sinceBreak >= 90 &&
      cursor + duration + 15 <= dayEnd
    ) {
      schedule.push({
        start: toTime(cursor),
        end: toTime(cursor + 15),
        label: "Break",
        kind: "break",
      });
      breaks.push(`15-minute break at ${toTime(cursor)} (${breakPref.toLowerCase()}).`);
      cursor += 15;
      sinceBreak = 0;
    }
    schedule.push({
      start: toTime(cursor),
      end: toTime(cursor + duration),
      label: task.name,
      kind: "task",
    });
    cursor += duration;
    sinceBreak += duration;
    used += duration;

    if (task.deadline) {
      const due = new Date(task.deadline);
      const soon = (due.getTime() - Date.now()) / 86_400_000;
      if (soon < 0) conflicts.push(`${task.name} has a deadline in the past (${task.deadline}).`);
      else if (soon < 1 && task.urgency !== "High")
        conflicts.push(
          `${task.name} is due within 24 hours but is marked ${task.urgency.toLowerCase()} urgency.`,
        );
    }
  }

  const total = ordered.reduce((sum, { task }) => sum + Number(task.duration), 0);
  if (total > capacity)
    conflicts.push(
      `Requested work totals ${Math.round(total / 60)}h against ${Math.round(
        capacity / 60,
      )}h of available time.`,
    );
  if (breakPref === "No scheduled breaks")
    breaks.push("No breaks were scheduled because that was your stated preference.");
  if (!breaks.length) breaks.push("No additional breaks were needed for this workload.");

  const recommendations = [
    "Handle the highest urgency and importance tasks in your first focused block of the day.",
    "Group short administrative tasks into a single block to reduce context switching.",
    ordered.some(({ task }) => task.dependencies.trim())
      ? "Dependent tasks are sequenced after the work they rely on — confirm the sequence still holds."
      : "Add dependencies to any task that cannot start until another finishes.",
    postpone.length
      ? "Renegotiate the postponed items early rather than at the deadline."
      : "You have some slack in the window — keep it free for unplanned requests.",
  ];

  return {
    prioritised: ordered.map(({ task, score }) => ({
      name: task.name,
      score: `${task.urgency} urgency · ${task.importance} importance · score ${score}`,
      reason:
        task.description.trim() ||
        (task.deadline ? `Deadline ${task.deadline}` : "No description supplied"),
    })),
    schedule,
    breaks,
    conflicts: conflicts.length ? conflicts : ["No workload conflicts detected."],
    postpone: postpone.length ? postpone : ["Nothing needs postponing in this window."],
    recommendations,
  };
}

export function TaskPlanner() {
  const [period, setPeriod] = useState("Daily");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [breakPref, setBreakPref] = useState(BREAKS[0] as string);
  const [tasks, setTasks] = useState<Task[]>([newTask()]);
  const [submitted, setSubmitted] = useState(false);
  const [windowError, setWindowError] = useState<string>("");

  const { status, result, setResult, error, editing, setEditing, run, clear } =
    useToolRun<Result>();
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const allTaskErrors = tasks.map(taskErrors);
  const windowInvalid = toMinutes(end) <= toMinutes(start);
  const valid = !windowInvalid && allTaskErrors.every((e) => !e.name && !e.duration);

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const generate = () => {
    setSubmitted(true);
    setWindowError(windowInvalid ? "The end time must be later than the start time." : "");
    if (windowInvalid) {
      refs.current.end?.focus();
      return;
    }
    const firstBad = tasks.findIndex((t) => {
      const e = taskErrors(t);
      return e.name || e.duration;
    });
    if (firstBad !== -1) {
      const e = taskErrors(tasks[firstBad]);
      refs.current[`${tasks[firstBad].id}-${e.name ? "name" : "duration"}`]?.focus();
      return;
    }
    run(() => build(tasks, period, start, end, breakPref));
  };

  const clearAll = () => {
    setPeriod("Daily");
    setStart("09:00");
    setEnd("17:00");
    setBreakPref(BREAKS[0]);
    setTasks([newTask()]);
    setSubmitted(false);
    setWindowError("");
    clear();
  };

  const asText = (r: Result) =>
    [
      `Prioritised tasks\n${r.prioritised.map((p, i) => `${i + 1}. ${p.name} — ${p.score}`).join("\n")}`,
      `Time-blocked schedule\n${r.schedule
        .map((b) => (b.start ? `${b.start}–${b.end}  ${b.label}` : b.label))
        .join("\n")}`,
      `Suggested breaks\n${r.breaks.join("\n")}`,
      `Workload conflicts\n${r.conflicts.join("\n")}`,
      `Postpone or renegotiate\n${r.postpone.join("\n")}`,
      `Time optimisation\n${r.recommendations.join("\n")}`,
    ].join("\n\n");

  return (
    <div className="grid min-w-0 gap-8">
      <PageHeader
        eyebrow="Workspace tool"
        title="AI Task Planner"
        description="Turn a task list into a prioritised, time-blocked plan with breaks, conflicts and optimisation notes."
      />

      <ToolLayout
        form={
          <div className="grid min-w-0 gap-6">
            <FormSection title="Planning window">
              <SelectField
                id="plan-period"
                label="Plan period"
                required
                options={PERIODS}
                value={period}
                onChange={setPeriod}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="plan-start"
                  label="Available work start time"
                  required
                  type="time"
                  value={start}
                  onChange={setStart}
                />
                <TextField
                  id="plan-end"
                  label="Available work end time"
                  required
                  type="time"
                  value={end}
                  onChange={setEnd}
                  error={submitted ? windowError : undefined}
                  inputRef={(el) => (refs.current.end = el)}
                />
              </div>
              <SelectField
                id="plan-breaks"
                label="Break preference"
                options={BREAKS}
                value={breakPref}
                onChange={setBreakPref}
              />
            </FormSection>

            <FormSection title="Tasks" description="Add every task you want included in the plan.">
              <div className="grid gap-4">
                {tasks.map((task, index) => {
                  const errs = submitted ? allTaskErrors[index] : {};
                  return (
                    <div key={task.id} className="grid gap-4 rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold">Task {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setTasks((prev) =>
                              prev.length === 1
                                ? [newTask()]
                                : prev.filter((t) => t.id !== task.id),
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                          Remove Task
                          <span className="sr-only"> {index + 1}</span>
                        </Button>
                      </div>

                      <TextField
                        id={`task-${task.id}-name`}
                        label="Task name"
                        required
                        value={task.name}
                        onChange={(v) => updateTask(task.id, { name: v })}
                        error={errs.name}
                        inputRef={(el) => (refs.current[`${task.id}-name`] = el)}
                      />
                      <TextAreaField
                        id={`task-${task.id}-description`}
                        label="Description"
                        rows={3}
                        value={task.description}
                        onChange={(v) => updateTask(task.id, { description: v })}
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                          id={`task-${task.id}-deadline`}
                          label="Deadline"
                          type="date"
                          value={task.deadline}
                          onChange={(v) => updateTask(task.id, { deadline: v })}
                        />
                        <TextField
                          id={`task-${task.id}-duration`}
                          label="Estimated duration (minutes)"
                          required
                          type="number"
                          value={task.duration}
                          onChange={(v) => updateTask(task.id, { duration: v })}
                          error={errs.duration}
                          inputRef={(el) => (refs.current[`${task.id}-duration`] = el)}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField
                          id={`task-${task.id}-urgency`}
                          label="Urgency"
                          required
                          options={LEVELS}
                          value={task.urgency}
                          onChange={(v) => updateTask(task.id, { urgency: v })}
                        />
                        <SelectField
                          id={`task-${task.id}-importance`}
                          label="Importance"
                          required
                          options={LEVELS}
                          value={task.importance}
                          onChange={(v) => updateTask(task.id, { importance: v })}
                        />
                      </div>
                      <TextField
                        id={`task-${task.id}-dependencies`}
                        label="Dependencies"
                        value={task.dependencies}
                        onChange={(v) => updateTask(task.id, { dependencies: v })}
                        hint="Names of tasks that must finish first, separated by commas."
                      />
                    </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setTasks((prev) => [...prev, newTask()])}
              >
                <Plus className="size-4" />
                Add Task
              </Button>
            </FormSection>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Button onClick={generate} disabled={!valid || status === "loading"}>
                Generate Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTasks(EXAMPLE_TASKS.map((t) => ({ ...t, id: crypto.randomUUID() })));
                  setPeriod("Daily");
                  setStart("09:00");
                  setEnd("17:00");
                  setBreakPref(BREAKS[0]);
                  setSubmitted(false);
                }}
              >
                Load Example
              </Button>
              <Button variant="ghost" onClick={clearAll}>
                Clear All
              </Button>
            </div>
            {!valid ? (
              <p className="text-xs text-muted-foreground">
                Generate Plan becomes available once every task has a name and a duration greater
                than zero, within a valid time window.
              </p>
            ) : null}
          </div>
        }
        results={
          status === "loading" ? (
            <LoadingState label="Building your plan…" />
          ) : status === "error" ? (
            <ErrorState message={error} onRetry={generate} />
          ) : status === "success" && result ? (
            <ResultPanel
              title="Your plan"
              controls={
                <ResultControls
                  editing={editing}
                  onToggleEdit={() => setEditing(!editing)}
                  onCopy={() => copyText(asText(result))}
                  onRegenerate={generate}
                  onClear={clear}
                />
              }
              footer={
                <Disclaimer>
                  Review priorities, deadlines and workload assumptions. FlowDesk AI does not add
                  events to an external calendar.
                </Disclaimer>
              }
            >
              <ResultBlock title="Prioritised task list">
                <ol className="grid gap-3">
                  {result.prioritised.map((item, i) => (
                    <li key={i} className="rounded-lg border border-border p-3">
                      <p className="font-medium">
                        {i + 1}. {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.score}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                    </li>
                  ))}
                </ol>
              </ResultBlock>

              <ResultBlock title="Time-blocked schedule">
                <ul className="grid gap-2">
                  {result.schedule.map((block, i) => (
                    <li
                      key={i}
                      className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-3 border-b border-border pb-2 last:border-0"
                    >
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {block.start ? `${block.start}–${block.end}` : "—"}
                      </span>
                      <span className={block.kind === "break" ? "text-muted-foreground" : ""}>
                        {block.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </ResultBlock>

              <ResultBlock title="Suggested breaks">
                <ul className="grid gap-2">
                  {result.breaks.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </ResultBlock>

              <ResultBlock title="Workload conflicts">
                <ul className="grid gap-2">
                  {result.conflicts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </ResultBlock>

              <ResultBlock title="Postpone or renegotiate">
                <ul className="grid gap-2">
                  {result.postpone.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </ResultBlock>

              <ResultBlock title="Time-optimisation recommendations">
                {editing ? (
                  <Textarea
                    aria-label="Time-optimisation recommendations"
                    rows={6}
                    value={result.recommendations.join("\n")}
                    onChange={(e) =>
                      setResult({ ...result, recommendations: e.target.value.split("\n") })
                    }
                  />
                ) : (
                  <ul className="grid gap-2">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span className="min-w-0">{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ResultBlock>
            </ResultPanel>
          ) : (
            <div className="grid gap-4">
              <EmptyState
                icon={CalendarClock}
                title="Your plan will appear here"
                description="Set your working window, add at least one task with a duration, then select Generate Plan for a prioritised, time-blocked schedule."
              />
              <Disclaimer>
                Review priorities, deadlines and workload assumptions. FlowDesk AI does not add
                events to an external calendar.
              </Disclaimer>
            </div>
          )
        }
      />
    </div>
  );
}
