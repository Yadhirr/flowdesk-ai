import { useRef, useState } from "react";
import { BookOpenCheck } from "lucide-react";

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
import { copyText } from "@/components/tool/useToolRun";
import { runResearchAnalysis } from "@/lib/ai.functions";

const AUDIENCES = ["General", "Team", "Manager", "Client", "Specialist"] as const;
const DETAIL_LEVELS = ["Quick", "Standard", "Detailed"] as const;
const FOCUS_OPTIONS = [
  "Summary",
  "Key insights",
  "Recommendations",
  "Simplified explanation",
  "Complete analysis",
] as const;

const MIN_MATERIAL = 100;
const MAX_MATERIAL = 8000;

const SCOPE_NOTICE =
  "This analysis is based only on the material you supplied. AI-generated content may contain errors or omissions. Verify important claims against the original source.";

const ERROR_MESSAGE =
  "FlowDesk AI could not complete the analysis. Your source material has been preserved. Please retry.";

const EXAMPLE_QUESTION =
  "Should the operations team move weekly status reporting to a shared template?";
const EXAMPLE_MATERIAL = `Internal review note (fictional demonstration content, Northgate Services Ltd).

Weekly status reporting is currently produced in four different formats across the operations team. Coordinators spend an estimated two hours each week reformatting updates before the Thursday review.

The review group found that decisions are frequently repeated because previous decisions are recorded inconsistently. Two of the five coordinators keep decisions in email threads only.

A shared reporting template was trialled by one sub-team for six weeks. That sub-team reported shorter review meetings and fewer follow-up clarification requests. They also noted that the template needed a free-text section for risks that do not fit fixed headings.

Concerns raised: the template must not add extra fields that duplicate the project tracker, and any change should be introduced after the current delivery milestone rather than during it.`;

type Result = {
  summary: string[];
  insights: string[];
  recommendations: string[];
  simplified: string[];
  limitations: string[];
  questions: string[];
  sourceScope: string[];
};

type Status = "idle" | "loading" | "error" | "success";

export function ResearchAssistant() {
  const [question, setQuestion] = useState("");
  const [material, setMaterial] = useState("");
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);
  const [detail, setDetail] = useState<string>(DETAIL_LEVELS[1]);
  const [focus, setFocus] = useState<string>(FOCUS_OPTIONS[0]);
  const [submitted, setSubmitted] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [editing, setEditing] = useState(false);

  const questionRef = useRef<HTMLInputElement | null>(null);
  const materialRef = useRef<HTMLTextAreaElement | null>(null);

  const questionError = !question.trim()
    ? "Enter the research question you want answered."
    : question.trim().length < 10
      ? "Give a little more detail so the question is meaningful."
      : "";
  const materialError = !material.trim()
    ? "Paste the source material you want analysed."
    : material.trim().length < MIN_MATERIAL
      ? `Add more source material — at least ${MIN_MATERIAL} characters of meaningful content (currently ${material.trim().length}).`
      : "";
  const valid = !questionError && !materialError;

  const analyse = async () => {
    setSubmitted(true);
    if (questionError) {
      questionRef.current?.focus();
      return;
    }
    if (materialError) {
      materialRef.current?.focus();
      return;
    }
    if (status === "loading") return;

    setStatus("loading");
    setEditing(false);
    try {
      const data = await runResearchAnalysis({
        data: {
          question: question.trim(),
          material: material.trim(),
          audience,
          detail,
          focus,
        },
      });
      setResult(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const clearOutput = () => {
    setResult(null);
    setEditing(false);
    setStatus("idle");
  };

  const clearForm = () => {
    setQuestion("");
    setMaterial("");
    setAudience(AUDIENCES[0]);
    setDetail(DETAIL_LEVELS[1]);
    setFocus(FOCUS_OPTIONS[0]);
    setSubmitted(false);
    clearOutput();
  };

  const asText = (r: Result) =>
    [
      `Research question\n${question}`,
      `Concise summary\n${r.summary.join("\n")}`,
      `Key insights\n${r.insights.join("\n")}`,
      `Recommendations supported by the supplied material\n${r.recommendations.join("\n")}`,
      `Simplified explanation\n${r.simplified.join("\n")}`,
      `Limitations\n${r.limitations.join("\n")}`,
      `Questions requiring further investigation\n${r.questions.join("\n")}`,
      `Source scope\n${r.sourceScope.join("\n")}`,
      SCOPE_NOTICE,
    ].join("\n\n");

  const list = (items: string[]) => (
    <ul className="grid gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );

  const editableBlock = (title: string, key: keyof Result) =>
    editing && result ? (
      <Textarea
        aria-label={title}
        rows={5}
        value={result[key].join("\n")}
        onChange={(e) => setResult({ ...result, [key]: e.target.value.split("\n") })}
      />
    ) : result ? (
      list(result[key])
    ) : null;

  return (
    <div className="grid min-w-0 gap-8">
      <PageHeader
        eyebrow="Workspace tool"
        title="AI Research Assistant"
        description="Organise material you already have into a structured brief you can check against the original source."
      />

      <ToolLayout
        form={
          <div className="grid min-w-0 gap-6">
            <div className="grid gap-2">
              <div
                role="tablist"
                aria-label="Source input method"
                className="grid gap-2 sm:flex sm:flex-wrap"
              >
                <Button role="tab" aria-selected="true" size="sm" className="justify-start">
                  Paste Text
                </Button>
                <Button
                  role="tab"
                  aria-selected="false"
                  size="sm"
                  variant="outline"
                  disabled
                  aria-describedby="research-tab-help"
                  className="justify-start"
                >
                  Upload PDF — Planned enhancement
                </Button>
                <Button
                  role="tab"
                  aria-selected="false"
                  size="sm"
                  variant="outline"
                  disabled
                  aria-describedby="research-tab-help"
                  className="justify-start"
                >
                  Website URL — Planned enhancement
                </Button>
              </div>
              <p id="research-tab-help" className="text-xs leading-relaxed text-muted-foreground">
                Only the Paste Text workflow is available in this prototype. PDF upload and website
                analysis are planned enhancements and are disabled.
              </p>
            </div>

            <FormSection title="What are you researching?">
              <TextField
                id="research-question"
                label="Research question"
                required
                value={question}
                onChange={setQuestion}
                placeholder="What do you need to find out?"
                hint="State one clear question. A focused question produces a more useful brief than a broad topic."
                error={submitted ? questionError : undefined}
                inputRef={(el) => (questionRef.current = el)}
              />
              <TextAreaField
                id="research-material"
                label="Source material"
                required
                rows={10}
                value={material}
                onChange={setMaterial}
                maxLength={MAX_MATERIAL}
                showCounter
                placeholder="Paste the article, report extract or topic information you want analysed…"
                hint={`Paste the text itself — this tool does not open links or search the internet. Minimum ${MIN_MATERIAL} characters.`}
                error={submitted ? materialError : undefined}
                inputRef={(el) => (materialRef.current = el)}
              />
            </FormSection>

            <FormSection title="How should it be presented?">
              <SelectField
                id="research-audience"
                label="Intended audience"
                required
                options={AUDIENCES}
                value={audience}
                onChange={setAudience}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  id="research-detail"
                  label="Detail level"
                  required
                  options={DETAIL_LEVELS}
                  value={detail}
                  onChange={setDetail}
                />
                <SelectField
                  id="research-focus"
                  label="Output focus"
                  required
                  options={FOCUS_OPTIONS}
                  value={focus}
                  onChange={setFocus}
                />
              </div>
            </FormSection>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Button onClick={analyse} disabled={!valid || status === "loading"}>
                {status === "loading" ? "Analysing…" : "Generate Analysis"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQuestion(EXAMPLE_QUESTION);
                  setMaterial(EXAMPLE_MATERIAL);
                  setAudience("Manager");
                  setDetail("Standard");
                  setFocus("Complete analysis");
                  setSubmitted(false);
                }}
              >
                Load Example
              </Button>
              <Button variant="ghost" onClick={clearForm}>
                Clear Form
              </Button>
            </div>
            {!valid ? (
              <p className="text-xs text-muted-foreground">
                Generate Analysis becomes available once a research question and at least{" "}
                {MIN_MATERIAL} characters of source material have been entered.
              </p>
            ) : null}
            <Disclaimer>{SCOPE_NOTICE}</Disclaimer>
          </div>
        }
        results={
          status === "loading" ? (
            <LoadingState label="Analysing the supplied material..." />
          ) : status === "error" ? (
            <ErrorState message={ERROR_MESSAGE} onRetry={analyse} />
          ) : status === "success" && result ? (
            <ResultPanel
              title="Structured brief"
              controls={
                <ResultControls
                  editing={editing}
                  onToggleEdit={() => setEditing(!editing)}
                  onCopy={() => copyText(asText(result))}
                  onRegenerate={analyse}
                  onClear={clearOutput}
                />
              }
              footer={<Disclaimer>{SCOPE_NOTICE}</Disclaimer>}
            >
              <ResultBlock title="Concise summary">
                {editableBlock("Concise summary", "summary")}
              </ResultBlock>
              <ResultBlock title="Key insights">
                {editableBlock("Key insights", "insights")}
              </ResultBlock>
              <ResultBlock title="Recommendations supported by the supplied material">
                {editableBlock("Recommendations", "recommendations")}
              </ResultBlock>
              <ResultBlock title="Simplified explanation">
                {editableBlock("Simplified explanation", "simplified")}
              </ResultBlock>
              <ResultBlock title="Limitations">
                {editableBlock("Limitations", "limitations")}
              </ResultBlock>
              <ResultBlock title="Questions requiring further investigation">
                {editableBlock("Questions requiring further investigation", "questions")}
              </ResultBlock>
              <ResultBlock title="Source-scope reminder">
                {editableBlock("Source-scope reminder", "sourceScope")}
              </ResultBlock>
            </ResultPanel>
          ) : (
            <div className="grid gap-4">
              <EmptyState
                icon={BookOpenCheck}
                title="Your brief will appear here"
                description="Enter a research question, paste the material you want examined, then select Generate Analysis for a structured brief drawn only from your own text."
              />
              <Disclaimer>{SCOPE_NOTICE}</Disclaimer>
            </div>
          )
        }
      />
    </div>
  );
}
