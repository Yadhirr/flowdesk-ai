import { useRef, useState } from "react";
import { Mail } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/tool/fields";
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

const AUDIENCES = ["Client", "Manager", "Team", "Colleague", "Supplier"] as const;
const TONES = ["Formal", "Friendly", "Informal", "Persuasive", "Concise"] as const;
const LENGTHS = ["Short", "Standard", "Detailed"] as const;

const CONTEXT_MAX = 2000;

type Form = {
  purpose: string;
  audience: string;
  tone: string;
  context: string;
  keyPoints: string;
  cta: string;
  length: string;
  recipient: string;
  sender: string;
};

const EMPTY: Form = {
  purpose: "",
  audience: "",
  tone: "",
  context: "",
  keyPoints: "",
  cta: "",
  length: "Standard",
  recipient: "",
  sender: "",
};

const EXAMPLE: Form = {
  purpose: "Request updated delivery dates for the Q3 onboarding project",
  audience: "Supplier",
  tone: "Formal",
  context:
    "The supplier committed to delivering the onboarding materials by 12 August, but the last status call suggested the design review may slip. We need confirmed dates so internal training can be scheduled.",
  keyPoints:
    "Confirm the revised delivery date\nFlag any dependency on the design review\nConfirm who will attend the handover call",
  cta: "Please confirm the revised delivery date by Friday.",
  length: "Standard",
  recipient: "Ms Adeyemi",
  sender: "Jordan Blake",
};

type Result = { subject: string; body: string; shorter: string };

type Errors = Partial<Record<"purpose" | "audience" | "tone" | "context", string>>;

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.purpose.trim()) errors.purpose = "Enter the purpose of this email.";
  if (!form.audience) errors.audience = "Select who this email is for.";
  if (!form.tone) errors.tone = "Select a tone for this email.";
  if (form.context.trim().length < 20)
    errors.context = "Add at least 20 characters of context so the draft is useful.";
  return errors;
}

function build(form: Form): Result {
  const greetingName = form.recipient.trim() || "there";
  const greeting =
    form.tone === "Formal" ? `Dear ${greetingName},` : `Hi ${greetingName},`;
  const signOff = form.tone === "Formal" ? "Kind regards," : "Best,";
  const sender = form.sender.trim() || "[Your name]";
  const points = form.keyPoints
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const subject = form.purpose.trim().replace(/\.$/, "");
  const intro = `I'm writing regarding ${subject.toLowerCase()}.`;
  const contextLine = form.context.trim();
  const pointsBlock = points.length
    ? `\n\n${points.map((p) => `• ${p}`).join("\n")}`
    : "";
  const ctaLine = form.cta.trim() ? `\n\n${form.cta.trim()}` : "";
  const closing =
    form.length === "Detailed"
      ? "\n\nHappy to talk this through if it is easier — let me know a time that suits you."
      : "";

  const body = `${greeting}\n\n${intro}\n\n${contextLine}${pointsBlock}${ctaLine}${closing}\n\n${signOff}\n${sender}`;

  const shorter = `${greeting}\n\n${intro}${
    form.cta.trim() ? ` ${form.cta.trim()}` : ""
  }\n\n${signOff}\n${sender}`;

  return {
    subject: `${subject}${form.audience === "Client" ? "" : ""}`,
    body: form.length === "Short" ? shorter : body,
    shorter,
  };
}

export function EmailGenerator() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const { status, result, setResult, error, editing, setEditing, run, clear } =
    useToolRun<Result>();

  const refs = useRef<Record<string, HTMLElement | null>>({});
  const errors = validate(form);
  const shownErrors: Errors = submitted ? errors : {};
  const canGenerate = Object.keys(errors).length === 0;

  const set = <K extends keyof Form>(key: K) => (value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const generate = () => {
    setSubmitted(true);
    const current = validate(form);
    const first = (["purpose", "audience", "tone", "context"] as const).find(
      (key) => current[key],
    );
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
    `Subject: ${r.subject}\n\n${r.body}\n\n--- Shorter alternative ---\n${r.shorter}`;

  return (
    <div className="grid min-w-0 gap-8">
      <PageHeader
        eyebrow="Workspace tool"
        title="Smart Email Generator"
        description="Draft clear, professional workplace emails with a consistent tone, structure and level of formality."
      />

      <ToolLayout
        form={
          <div className="grid min-w-0 gap-6">
            <FormSection title="Email details">
              <TextField
                id="email-purpose"
                label="Email purpose"
                required
                value={form.purpose}
                onChange={set("purpose")}
                error={shownErrors.purpose}
                placeholder="e.g. Request updated delivery dates"
                inputRef={(el) => (refs.current.purpose = el)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  id="email-audience"
                  label="Audience"
                  required
                  options={AUDIENCES}
                  value={form.audience}
                  onChange={set("audience")}
                  error={shownErrors.audience}
                  triggerRef={(el) => (refs.current.audience = el)}
                />
                <SelectField
                  id="email-tone"
                  label="Tone"
                  required
                  options={TONES}
                  value={form.tone}
                  onChange={set("tone")}
                  error={shownErrors.tone}
                  triggerRef={(el) => (refs.current.tone = el)}
                />
              </div>
              <TextAreaField
                id="email-context"
                label="Context"
                required
                showCounter
                maxLength={CONTEXT_MAX}
                rows={6}
                value={form.context}
                onChange={set("context")}
                error={shownErrors.context}
                hint="Background the reader needs: what happened, what is outstanding and any dates involved."
                placeholder="Describe the situation this email responds to…"
                inputRef={(el) => (refs.current.context = el)}
              />
            </FormSection>

            <FormSection title="Optional refinements">
              <TextAreaField
                id="email-points"
                label="Key points"
                rows={4}
                value={form.keyPoints}
                onChange={set("keyPoints")}
                hint="One point per line. These become bullet points in the draft."
              />
              <TextField
                id="email-cta"
                label="Call to action"
                value={form.cta}
                onChange={set("cta")}
                placeholder="e.g. Please confirm by Friday."
              />
              <SelectField
                id="email-length"
                label="Desired length"
                options={LENGTHS}
                value={form.length}
                onChange={set("length")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="email-recipient"
                  label="Recipient name"
                  value={form.recipient}
                  onChange={set("recipient")}
                />
                <TextField
                  id="email-sender"
                  label="Sender name"
                  value={form.sender}
                  onChange={set("sender")}
                />
              </div>
            </FormSection>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Button onClick={generate} disabled={!canGenerate || status === "loading"}>
                Generate Email
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
            {!canGenerate ? (
              <p className="text-xs text-muted-foreground">
                Generate Email becomes available once purpose, audience, tone and context are
                complete.
              </p>
            ) : null}
          </div>
        }
        results={
          status === "loading" ? (
            <LoadingState label="Preparing your email draft…" />
          ) : status === "error" ? (
            <ErrorState message={error} onRetry={generate} />
          ) : status === "success" && result ? (
            <ResultPanel
              title="Draft email"
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
                  Review names, dates, commitments, attachments and tone before sending. FlowDesk
                  AI does not send emails.
                </Disclaimer>
              }
            >
              <ResultBlock title="Subject line">
                {editing ? (
                  <Textarea
                    aria-label="Subject line"
                    rows={2}
                    value={result.subject}
                    onChange={(e) => setResult({ ...result, subject: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{result.subject}</p>
                )}
              </ResultBlock>
              <ResultBlock title="Complete email">
                {editing ? (
                  <Textarea
                    aria-label="Complete email"
                    rows={14}
                    value={result.body}
                    onChange={(e) => setResult({ ...result, body: e.target.value })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{result.body}</p>
                )}
              </ResultBlock>
              <ResultBlock title="Shorter alternative">
                {editing ? (
                  <Textarea
                    aria-label="Shorter alternative"
                    rows={8}
                    value={result.shorter}
                    onChange={(e) => setResult({ ...result, shorter: e.target.value })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-muted-foreground">{result.shorter}</p>
                )}
              </ResultBlock>
            </ResultPanel>
          ) : (
            <div className="grid gap-4">
              <EmptyState
                icon={Mail}
                title="Your draft will appear here"
                description="Complete the purpose, audience, tone and context, then select Generate Email to see a subject line, a full draft and a shorter alternative."
              />
              <Disclaimer>
                Review names, dates, commitments, attachments and tone before sending. FlowDesk AI
                does not send emails.
              </Disclaimer>
            </div>
          )
        }
      />
    </div>
  );
}
