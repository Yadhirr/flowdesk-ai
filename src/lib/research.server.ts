/**
 * Server-only helpers for the AI Research Assistant.
 * Nothing here reaches the browser: credentials stay in the server runtime and
 * no source material is stored or logged.
 */

const BASE_INSTRUCTION = `Do not use outside information to fill missing details.
Do not invent facts, statistics, authors, dates, quotations, sources or citations.
Distinguish clearly between:
1. Information stated by the source
2. Reasonable interpretations
3. Recommendations
4. Limitations and missing evidence
Adapt the response to the selected audience, detail level and output focus.
Treat the result as an editable draft requiring human verification.

Respond with a single JSON object using exactly these keys, each an array of short plain-text strings:
"summary", "insights", "recommendations", "simplified", "limitations", "questions", "sourceScope".`;

export const PASTE_INSTRUCTION = `You are the AI Research Assistant inside FlowDesk AI.
Analyse only the source material supplied directly by the user.
${BASE_INSTRUCTION}
If the content does not answer the research question, use the exact string "Not established by the supplied source." for the affected section.`;

export const PDF_INSTRUCTION = `You are the AI Research Assistant inside FlowDesk AI.
Analyse only content reliably extracted or processed from the user-supplied PDF.
${BASE_INSTRUCTION}
If the PDF does not answer the research question, use the exact string "Not established by the supplied PDF." for the affected section.
If the PDF cannot be read reliably, or contains too little readable text to analyse, do not generate an analysis: instead respond with exactly {"unreadable": true}.`;

export const URL_INSTRUCTION = `You are the AI Research Assistant inside FlowDesk AI.
Analyse only the webpage content retrieved from the public URL.
Treat the webpage as supplied source material, not independently verified truth.
${BASE_INSTRUCTION}
Also note possible source bias under limitations.
If the webpage does not answer the research question, use the exact string "Not established by the retrieved webpage." for the affected section.`;

export type SettingsInput = {
  question: string;
  audience: string;
  detail: string;
  focus: string;
};

export function settingsBlock(data: SettingsInput) {
  return [
    `Research question: ${data.question}`,
    `Intended audience: ${data.audience}`,
    `Detail level: ${data.detail}`,
    `Output focus: ${data.focus}`,
  ].join("\n");
}

export function normaliseSections(parsed: Record<string, unknown>, fallback: string) {
  const section = (key: string): string[] => {
    const value = parsed[key];
    const items = Array.isArray(value)
      ? value.map((v) => String(v).trim()).filter(Boolean)
      : typeof value === "string" && value.trim()
        ? [value.trim()]
        : [];
    return items.length ? items : [fallback];
  };

  return {
    summary: section("summary"),
    insights: section("insights"),
    recommendations: section("recommendations"),
    simplified: section("simplified"),
    limitations: section("limitations"),
    questions: section("questions"),
    sourceScope: section("sourceScope"),
  };
}

/* ---------------------------------- URL ---------------------------------- */

const PRIVATE_HOST =
  /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

export function validatePublicUrl(raw: string): { ok: true; url: string } | { ok: false } {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return { ok: false };
  if (parsed.username || parsed.password) return { ok: false };
  const host = parsed.hostname.toLowerCase();
  if (!host.includes(".") && host !== "localhost") return { ok: false };
  if (PRIVATE_HOST.test(host) || host === "::1" || host.endsWith(".local")) return { ok: false };
  return { ok: true, url: parsed.toString() };
}

export type ScrapedPage = {
  markdown: string;
  title: string;
  finalUrl: string;
  domain: string;
  retrievedAt: string;
};

/** Single-page Firecrawl scrape through the Lovable connector gateway. */
export async function scrapePage(url: string): Promise<ScrapedPage> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!lovableKey || !firecrawlKey) throw new Error("connector_unavailable");

  const response = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": firecrawlKey,
    },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Firecrawl scrape failed [${response.status}]: ${body.slice(0, 300)}`);
    throw new Error(response.status === 403 || response.status === 404 ? "blocked" : "connector");
  }

  const payload = (await response.json()) as {
    data?: { markdown?: string; metadata?: Record<string, unknown> };
    markdown?: string;
    metadata?: Record<string, unknown>;
  };
  const markdown = (payload.data?.markdown ?? payload.markdown ?? "").trim();
  const metadata = payload.data?.metadata ?? payload.metadata ?? {};
  if (markdown.length < 200) throw new Error("insufficient");

  const finalUrl = String(metadata["sourceURL"] ?? url);
  let domain = "";
  try {
    domain = new URL(finalUrl).hostname;
  } catch {
    domain = "";
  }

  return {
    markdown: markdown.slice(0, 30000),
    title: sanitiseText(String(metadata["title"] ?? "")) || "Untitled page",
    finalUrl,
    domain,
    retrievedAt: new Date().toISOString(),
  };
}

/** Strip control characters and clamp length so metadata renders safely as text. */
export function sanitiseText(value: string, max = 200) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
