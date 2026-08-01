import { useEffect, useRef, useState } from "react";
import { BookOpenCheck, FileText, Globe, Trash2, Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FieldError, FormSection, SelectField, TextAreaField, TextField } from "@/components/tool/fields";
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
import { runPdfAnalysis, runResearchAnalysis, runUrlAnalysis } from "@/lib/ai.functions";

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
const MAX_PDF_BYTES = 10 * 1024 * 1024;

type SourceTab = "paste" | "pdf" | "url";

const TABS: { id: SourceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "paste", label: "Paste Text", icon: FileText },
  { id: "pdf", label: "Upload PDF", icon: Upload },
  { id: "url", label: "Website URL", icon: Globe },
];

const PRIVACY_NOTICE =
  "Do not upload or submit confidential, personal, legally restricted or proprietary material unless you are authorised to process it.";

const NOTICE: Record<SourceTab, string> = {
  paste:
    "This analysis is based only on the material you supplied. AI-generated content may contain errors or omissions. Verify important claims against the original source.",
  pdf: "This analysis is based only on content FlowDesk AI could reliably read from the uploaded PDF. Verify important findings against the original document.",
  url: "This analysis is based on content retrieved from the supplied public webpage. The source has not been independently verified. Review the original webpage and confirm important claims.",
};

const ERRORS = {
  paste:
    "FlowDesk AI could not complete the analysis. Your source material has been preserved. Please retry.",
  pdfInvalid: "Please upload a valid PDF file.",
  pdfOversized:
    "This PDF exceeds the supported file-size limit. Upload a smaller PDF or paste the relevant text.",
  pdfUnreadable:
    "FlowDesk AI could not read this PDF. It may be scanned, password-protected, unsupported, empty or corrupted.",
  pdfInsufficient:
    "FlowDesk AI could not find enough readable content in this PDF to produce a reliable analysis.",
  pdfFailure: "FlowDesk AI could not complete the PDF analysis. Please retry or paste the relevant text.",
  urlInvalid: "Enter a complete public website URL beginning with http:// or https://.",
  urlUnsafe: "FlowDesk AI can analyse public webpages only.",
  urlBlocked:
    "FlowDesk AI could not access this webpage. It may be private, restricted, blocked or unavailable.",
  urlInsufficient:
    "FlowDesk AI could not find enough readable content on this webpage to produce a reliable analysis.",
  urlConnector:
    "FlowDesk AI could not retrieve the webpage. Please retry or paste the relevant content into the Paste Text tab.",
};

const STATUS_STEPS: Record<SourceTab, string[]> = {
  paste: ["Analysing the supplied material..."],
  pdf: [
    "Validating PDF",
    "Reading PDF",
    "Extracting readable content",
    "Analysing document",
    "Preparing results",
  ],
  url: [
    "Validating URL",
    "Retrieving webpage",
    "Extracting readable content",
    "Analysing source",
    "Preparing results",
  ],
};

const EXAMPLE_QUESTION =
  "Should the operations team move weekly status reporting to a shared template?";
const EXAMPLE_MATERIAL = `Internal review note (fictional demonstration content, Northgate Services Ltd).

Weekly status reporting is currently produced in four different formats across the operations team. Coordinators spend an estimated two hours each week reformatting updates before the Thursday review.

The review group found that decisions are frequently repeated because previous decisions are recorded inconsistently. Two of the five coordinators keep decisions in email threads only.

A shared reporting template was trialled by one sub-team for six weeks. That sub-team reported shorter review meetings and fewer follow-up clarification requests. They also noted that the template needed a free-text section for risks that do not fit fixed headings.

Concerns raised: the template must not add extra fields that duplicate the project tracker, and any change should be introduced after the current delivery milestone rather than during it.`;

type SourceMeta = { title: string; domain: string; finalUrl: string; retrievedAt: string };

type Result = {
  summary: string[];
  insights: string[];
  recommendations: string[];
  simplified: string[];
  limitations: string[];
  questions: string[];
  sourceScope: string[];
  source?: SourceMeta;
  fileName?: string;
  fileSize?: string;
};

type Status = "idle" | "loading" | "error" | "success";

const SECTION_KEYS: [keyof Result, string][] = [
  ["summary", "Concise summary"],
  ["insights", "Key insights"],
  ["recommendations", "Recommendations supported by the source"],
  ["simplified", "Simplified explanation"],
  ["limitations", "Limitations"],
  ["questions", "Questions requiring further investigation"],
  ["sourceScope", "Source-scope information"],
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read_failed"));
    reader.onload = () => {
      const value = String(reader.result ?? "");
      const comma = value.indexOf(",");
      resolve(comma === -1 ? value : value.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });
}

export function ResearchAssistant() {
  const [tab, setTab] = useState<SourceTab>("paste");

  // Shared research settings
  const [question, setQuestion] = useState("");
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);
  const [detail, setDetail] = useState<string>(DETAIL_LEVELS[1]);
  const [focus, setFocus] = useState<string>(FOCUS_OPTIONS[0]);

  // Per-tab sources (kept for the current session so switching does not lose input)
  const [material, setMaterial] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [statusStep, setStatusStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState(ERRORS.paste);
  const [result, setResult] = useState<Result | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const questionRef = useRef<HTMLInputElement | null>(null);
  const materialRef = useRef<HTMLTextAreaElement | null>(null);
  const urlRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Rolling status labels while a multi-step source is processing.
  useEffect(() => {
    if (status !== "loading") return;
    const steps = STATUS_STEPS[tab];
    if (steps.length < 2) return;
    const timer = window.setInterval(() => {
      setStatusStep((s) => Math.min(s + 1, steps.length - 1));
    }, 1600);
    return () => window.clearInterval(timer);
  }, [status, tab]);

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

  const urlError = (() => {
    const value = url.trim();
    if (!value) return "Enter the public webpage address you want analysed.";
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      return ERRORS.urlInvalid;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return ERRORS.urlInvalid;
    if (parsed.username || parsed.password) return ERRORS.urlUnsafe;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "::1" ||
      host.endsWith(".local") ||
      !host.includes(".") ||
      /^(127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
    ) {
      return ERRORS.urlUnsafe;
    }
    return "";
  })();

  const sourceError = tab === "paste" ? materialError : tab === "url" ? urlError : fileError || (file ? "" : "Select a PDF file to analyse.");
  const valid = !questionError && !sourceError;

  const switchTab = (next: SourceTab) => {
    if (next === tab) return;
    setTab(next);
    setSubmitted(false);
    setResult(null);
    setEditing(false);
    setStatus("idle");
  };

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + TABS.length) % TABS.length;
    tabRefs.current[next]?.focus();
    switchTab(TABS[next]!.id);
  };

  const acceptFile = (candidate: File | null | undefined) => {
    if (!candidate) return;
    const isPdf =
      candidate.type === "application/pdf" || /\.pdf$/i.test(candidate.name);
    if (!isPdf || (candidate.type && candidate.type !== "application/pdf")) {
      setFile(null);
      setFileError(ERRORS.pdfInvalid);
      return;
    }
    if (candidate.size === 0) {
      setFile(null);
      setFileError(ERRORS.pdfInvalid);
      return;
    }
    if (candidate.size > MAX_PDF_BYTES) {
      setFile(null);
      setFileError(ERRORS.pdfOversized);
      return;
    }
    setFileError("");
    setFile(candidate);
    setResult(null);
    setStatus("idle");
  };

  const analyse = async () => {
    setSubmitted(true);
    if (questionError) {
      questionRef.current?.focus();
      return;
    }
    if (sourceError) {
      if (tab === "paste") materialRef.current?.focus();
      else if (tab === "url") urlRef.current?.focus();
      else fileInputRef.current?.focus();
      return;
    }
    if (status === "loading") return;

    setStatus("loading");
    setStatusStep(0);
    setEditing(false);

    const settings = { question: question.trim(), audience, detail, focus };

    try {
      if (tab === "paste") {
        const data = await runResearchAnalysis({
          data: { ...settings, material: material.trim() },
        });
        setResult(data);
      } else if (tab === "url") {
        const data = await runUrlAnalysis({ data: { ...settings, url: url.trim() } });
        setResult(data);
      } else if (file) {
        const fileData = await toBase64(file);
        const data = await runPdfAnalysis({
          data: { ...settings, filename: file.name, fileData },
        });
        setResult({ ...data, fileName: file.name, fileSize: formatBytes(file.size) });
      }
      setStatus("success");
      window.setTimeout(() => resultsRef.current?.focus(), 0);
    } catch (error) {
      const raw = error instanceof Error ? error.message : "";
      setErrorMessage(
        tab === "paste"
          ? ERRORS.paste
          : tab === "pdf"
            ? raw.includes("unreadable")
              ? ERRORS.pdfUnreadable
              : raw.includes("unparsable")
                ? ERRORS.pdfInsufficient
                : ERRORS.pdfFailure
            : raw.includes("unsafe")
              ? ERRORS.urlUnsafe
              : raw.includes("blocked")
                ? ERRORS.urlBlocked
                : raw.includes("insufficient")
                  ? ERRORS.urlInsufficient
                  : ERRORS.urlConnector,
      );
      setStatus("error");
    }
  };

  const clearOutput = () => {
    setResult(null);
    setEditing(false);
    setStatus("idle");
  };

  const clearSource = () => {
    if (tab === "paste") setMaterial("");
    if (tab === "url") setUrl("");
    if (tab === "pdf") {
      setFile(null);
      setFileError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setSubmitted(false);
    clearOutput();
  };

  const clearForm = () => {
    setQuestion("");
    setAudience(AUDIENCES[0]);
    setDetail(DETAIL_LEVELS[1]);
    setFocus(FOCUS_OPTIONS[0]);
    clearSource();
  };

  const asText = (r: Result) =>
    [
      `Research question\n${question}`,
      ...SECTION_KEYS.map(
        ([key, title]) => `${title}\n${(r[key] as string[]).join("\n")}`,
      ),
      r.source ? `Source\n${r.source.title} — ${r.source.finalUrl}` : "",
      r.fileName ? `Source\nUploaded PDF: ${r.fileName} (${r.fileSize})` : "",
      NOTICE[tab],
    ]
      .filter(Boolean)
      .join("\n\n");

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
        value={(result[key] as string[]).join("\n")}
        onChange={(e) => setResult({ ...result, [key]: e.target.value.split("\n") })}
      />
    ) : result ? (
      list(result[key] as string[])
    ) : null;

  const loadingLabel = STATUS_STEPS[tab][Math.min(statusStep, STATUS_STEPS[tab].length - 1)]!;

  return (
    <div className="grid min-w-0 gap-8">
      <PageHeader
        eyebrow="Workspace tool"
        title="AI Research Assistant"
        description="Analyse pasted text, an uploaded PDF or a public webpage and turn it into a structured brief you can check against the original source."
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
                {TABS.map((entry, index) => {
                  const Icon = entry.icon;
                  const selected = tab === entry.id;
                  return (
                    <Button
                      key={entry.id}
                      role="tab"
                      id={`research-tab-${entry.id}`}
                      aria-selected={selected}
                      aria-controls="research-source-panel"
                      tabIndex={selected ? 0 : -1}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => switchTab(entry.id)}
                      onKeyDown={(e) => onTabKeyDown(e, index)}
                    >
                      <Icon className="size-4" />
                      {entry.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Only the active source is analysed. Switching source clears any generated result.
              </p>
            </div>

            <div id="research-source-panel" role="tabpanel" aria-labelledby={`research-tab-${tab}`}>
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

                {tab === "paste" ? (
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
                    hint={`Paste the text itself — this tab does not open links. Minimum ${MIN_MATERIAL} characters.`}
                    error={submitted ? materialError : undefined}
                    inputRef={(el) => (materialRef.current = el)}
                  />
                ) : null}

                {tab === "pdf" ? (
                  <div className="grid min-w-0 gap-2">
                    <span className="text-sm font-medium">
                      PDF document
                      <span className="ml-1 text-muted-foreground" aria-hidden>
                        *
                      </span>
                    </span>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        acceptFile(e.dataTransfer.files?.[0]);
                      }}
                      className={`grid gap-3 rounded-lg border border-dashed p-5 text-center ${
                        dragging ? "border-accent bg-secondary/60" : "border-border"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground">
                        Drag and drop a PDF here, or select a file. Maximum 10 MB.
                      </p>
                      <input
                        ref={fileInputRef}
                        id="research-pdf"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        aria-describedby={fileError ? "research-pdf-error" : undefined}
                        onChange={(e) => acceptFile(e.target.files?.[0])}
                      />
                      <div className="justify-self-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="size-4" />
                          Select PDF
                        </Button>
                      </div>
                      {file ? (
                        <div className="grid gap-2 rounded-md bg-secondary/60 p-3 text-left">
                          <p className="min-w-0 break-all text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)} · Source type: Uploaded PDF
                          </p>
                          <div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                            >
                              <Trash2 className="size-4" />
                              Remove File
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Only readable document content is analysed. Scanned or password-protected PDFs
                      may not be analysable. The file is processed for this request only and is not
                      stored.
                    </p>
                    <FieldError
                      id="research-pdf-error"
                      message={submitted || fileError ? sourceError || undefined : undefined}
                    />
                  </div>
                ) : null}

                {tab === "url" ? (
                  <TextField
                    id="research-url"
                    label="Website URL"
                    required
                    value={url}
                    onChange={setUrl}
                    placeholder="https://example.com/article"
                    hint="One public webpage per request. FlowDesk AI does not crawl the wider website, bypass logins or defeat paywalls."
                    error={submitted ? urlError : undefined}
                    inputRef={(el) => (urlRef.current = el)}
                  />
                ) : null}
              </FormSection>
            </div>

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
              {tab === "paste" ? (
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
              ) : null}
              <Button variant="outline" onClick={() => setConfirmClear(true)}>
                Clear Source
              </Button>
              <Button variant="ghost" onClick={clearForm}>
                Clear Form
              </Button>
            </div>
            <Disclaimer>{PRIVACY_NOTICE}</Disclaimer>
            <Disclaimer>{NOTICE[tab]}</Disclaimer>
          </div>
        }
        results={
          status === "loading" ? (
            <LoadingState label={loadingLabel} />
          ) : status === "error" ? (
            <ErrorState message={errorMessage} onRetry={analyse} />
          ) : status === "success" && result ? (
            <div ref={resultsRef} tabIndex={-1} className="min-w-0 outline-none">
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
                footer={<Disclaimer>{NOTICE[tab]}</Disclaimer>}
              >
                {result.source ? (
                  <div className="grid gap-1 rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                    <p className="min-w-0 break-words font-medium text-foreground">
                      {result.source.title}
                    </p>
                    <p className="min-w-0 break-all">
                      <a
                        href={result.source.finalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {result.source.finalUrl}
                      </a>
                    </p>
                    <p>
                      {result.source.domain} · Retrieved{" "}
                      {new Date(result.source.retrievedAt).toLocaleString()} · Source not
                      independently verified
                    </p>
                  </div>
                ) : null}
                {result.fileName ? (
                  <div className="grid gap-1 rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                    <p className="min-w-0 break-all font-medium text-foreground">
                      {result.fileName}
                    </p>
                    <p>
                      {result.fileSize} · Source type: Uploaded PDF · Only readable document content
                      was analysed
                    </p>
                  </div>
                ) : null}
                {SECTION_KEYS.map(([key, title]) => (
                  <ResultBlock key={key} title={title}>
                    {editableBlock(title, key)}
                  </ResultBlock>
                ))}
              </ResultPanel>
            </div>
          ) : (
            <div className="grid gap-4">
              <EmptyState
                icon={BookOpenCheck}
                title="Your brief will appear here"
                description="Choose a source, enter a research question, then select Generate Analysis for a structured brief drawn only from that source."
              />
              <Disclaimer>{NOTICE[tab]}</Disclaimer>
            </div>
          )
        }
      />

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear the active source?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the current source and any generated result. Your research settings are
              kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearSource}>Clear Source</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
