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
import { copyText, useToolRun } from "@/components/tool/useToolRun";

const AUDIENCES = ["General", "Team", "Manager", "Client", "Specialist"] as const;
const DETAIL_LEVELS = ["Quick", "Standard", "Detailed"] as const;
const FOCUS_OPTIONS = [
  "Summary",
  "Key insights",
  "Recommendations",
  "Simplified explanation",
  "Complete analysis",
] as const;

const MIN_MATERIAL = 200;
const MAX_MATERIAL = 8000;

const SCOPE_NOTICE =
  "This prototype analyses only the material you provide. It does not claim to conduct live internet research. Verify important claims against the original source.";

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
};

function sentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function build(
  question: string,
  material: string,
  audience: string,
  detail: string,
  focus: string,
): Result {
  const all = sentences(material);
  const take = detail === "Quick" ? 2 : detail === "Detailed" ? 6 : 4;
  const paras = paragraphs(material);

  const summary = (paras.length > 1 ? paras : all)
    .slice(0, take)
    .map((p) => sentences(p)[0] ?? p)
    .filter(Boolean);

  const insightKeys = /(found|reported|noted|estimated|currently|trial|concern|risk|because)/i;
  const insights = all.filter((s) => insightKeys.test(s)).slice(0, take);

  const recKeys = /(should|must|need|recommend|require|propose|after|introduc)/i;
  const recommendations = all.filter((s) => recKeys.test(s)).slice(0, take);

  const audienceNote: Record<string, string> = {
    General: "Written for a reader with no background in this topic.",
    Team: "Framed for colleagues who already share day-to-day context.",
    Manager: "Framed around decisions, effort and risk.",
    Client: "Framed around outcomes and what happens next.",
    Specialist: "Assumes subject familiarity; detail is retained rather than reduced.",
  };

  const simplified = [
    `Your question: ${question.trim()}`,
    audienceNote[audience],
    summary[0]
      ? `In plain terms, the material says: ${summary[0]}`
      : "The material did not contain a clear opening statement to simplify.",
    `Output focus selected: ${focus}. Detail level: ${detail}.`,
  ];

  const limitations = [
    "Only the text you pasted was examined. Nothing was retrieved from the internet or any other system.",
    "This prototype arranges and highlights your material; no AI model has been connected, so nothing here is inferred beyond your text.",
    "No statistics, sources or citations have been added. If a figure appears here, it came from your material.",
    all.length < 6
      ? "The supplied material is short, so the analysis is necessarily shallow."
      : "Long or mixed-topic material may dilute the sections above; consider analysing one topic at a time.",
  ];

  const questions = [
    recommendations.length
      ? "Which of the points above are actually agreed, and which are one person's view?"
      : "The material contains no clear recommendation — who owns the decision?",
    "Is the source material current, complete and from an authority you trust?",
    "What evidence outside this material would confirm or contradict the summary?",
    `Who else needs to review this before it is shared with a ${audience.toLowerCase()} audience?`,
  ];

  return {
    summary: summary.length ? summary : ["No complete sentences could be extracted from the material."],
    insights: insights.length
      ? insights
      : ["No findings, estimates or concerns were detectable in the supplied text."],
    recommendations: recommendations.length
      ? recommendations
      : ["The supplied material does not state any recommendation or required action."],
    simplified,
    limitations,
    questions,
  };
}

export function ResearchAssistant() {
  const [question, setQuestion] = useState("");
  const [material, setMaterial] = useState("");
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);
  const [detail, setDetail] = useState<string>(DETAIL_LEVELS[1]);
  const [focus, setFocus] = useState<string>(FOCUS_OPTIONS[0]);
  const [submitted, setSubmitted] = useState(false);

  const { status, result, setResult, error, editing, setEditing, run, clear } =
    useToolRun<Result>();
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

  const analyse = () => {
    setSubmitted(true);
    if (questionError) {
      questionRef.current?.focus();
      return;
    }
    if (materialError) {
      materialRef.current?.focus();
      return;
    }
    run(() => build(question, material, audience, detail, focus));
  };

  const clearForm = () => {
    setQuestion("");
    setMaterial("");
    setAudience(AUDIENCES[0]);
    setDetail(DETAIL_LEVELS[1]);
    setFocus(FOCUS_OPTIONS[0]);
    setSubmitted(false);
    clear();
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
      `Source scope\n${SCOPE_NOTICE}`,
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
                Analyse Material
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
                Analyse Material becomes available once a research question and at least{" "}
                {MIN_MATERIAL} characters of source material have been entered.
              </p>
            ) : null}
            <Disclaimer>{SCOPE_NOTICE}</Disclaimer>
          </div>
        }
        results={
          status === "loading" ? (
            <LoadingState label="Organising your material…" />
          ) : status === "error" ? (
            <ErrorState message={error} onRetry={analyse} />
          ) : status === "success" && result ? (
            <ResultPanel
              title="Structured brief"
              controls={
                <ResultControls
                  editing={editing}
                  onToggleEdit={() => setEditing(!editing)}
                  onCopy={() => copyText(asText(result))}
                  onRegenerate={analyse}
                  onClear={clear}
                />
              }
              footer={<Disclaimer>{SCOPE_NOTICE}</Disclaimer>}
            >
              <ResultBlock title="Concise summary">
                {editing ? (
                  <Textarea
                    aria-label="Concise summary"
                    rows={6}
                    value={result.summary.join("\n")}
                    onChange={(e) => setResult({ ...result, summary: e.target.value.split("\n") })}
                  />
                ) : (
                  list(result.summary)
                )}
              </ResultBlock>
              <ResultBlock title="Key insights">{list(result.insights)}</ResultBlock>
              <ResultBlock title="Recommendations supported by the supplied material">
                {list(result.recommendations)}
              </ResultBlock>
              <ResultBlock title="Simplified explanation">{list(result.simplified)}</ResultBlock>
              <ResultBlock title="Limitations">{list(result.limitations)}</ResultBlock>
              <ResultBlock title="Questions requiring further investigation">
                {list(result.questions)}
              </ResultBlock>
              <ResultBlock title="Source-scope notice">
                <p className="text-muted-foreground">{SCOPE_NOTICE}</p>
              </ResultBlock>
            </ResultPanel>
          ) : (
            <div className="grid gap-4">
              <EmptyState
                icon={BookOpenCheck}
                title="Your brief will appear here"
                description="Enter a research question, paste the material you want examined, then select Analyse Material for a structured brief drawn only from your own text."
              />
              <Disclaimer>{SCOPE_NOTICE}</Disclaimer>
            </div>
          )
        }
      />
    </div>
  );
}
