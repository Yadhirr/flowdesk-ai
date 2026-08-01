const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "file"; file: { filename: string; file_data: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
};

/**
 * Minimal server-side call to the Lovable AI Gateway. The API key never leaves
 * the server; nothing is logged or stored.
 */
export async function callGateway(messages: ChatMessage[], jsonMode = false) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured.");

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("rate_limited");
    if (response.status === 402) throw new Error("credits_exhausted");
    throw new Error(`gateway_error_${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("empty_response");
  return text;
}

export function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw new Error("unparsable_response");
  }
}

export const RESEARCH_SYSTEM_INSTRUCTION = `You are the AI Research Assistant inside FlowDesk AI.
Your purpose is to analyse material supplied directly by the user.
Use only the supplied source material.
Do not claim access to the live internet.
Do not use outside knowledge to fill gaps.
Do not invent facts, statistics, authors, dates, sources, quotations, citations or recommendations unsupported by the supplied material.
Separate clearly:
1. Information directly supported by the supplied material
2. Reasonable interpretations
3. Recommendations
4. Limitations and missing information
If the supplied material does not answer the research question, state that clearly.
Adapt the explanation to the selected intended audience and detail level.
Use professional, neutral and inclusive language.
Treat the output as an editable draft requiring human verification.

Respond with a single JSON object using exactly these keys, each an array of short plain-text strings:
"summary", "insights", "recommendations", "simplified", "limitations", "questions", "sourceScope".
If a section is not supported by the supplied material, return the single item "Not established by the supplied material." for that section.
Never include fake citations or a bibliography unless citations appear in the supplied material. Never claim external verification was performed.`;

export const CHAT_SYSTEM_INSTRUCTION = `You are the AI Workplace Chatbot inside FlowDesk AI.
Your role is to provide practical workplace-productivity guidance and help users choose the correct FlowDesk AI specialist tool.
Available specialist tools:
1. Smart Email Generator
2. Meeting Notes Summarizer
3. AI Task Planner
4. AI Research Assistant
When the user asks for help:
1. Answer the request directly when it is safe and appropriate.
2. Ask concise clarification questions when essential context is missing.
3. Recommend the appropriate specialist FlowDesk AI tool when useful.
4. State important assumptions.
5. Distinguish facts supplied by the user from recommendations.
6. Remind the user to review consequential workplace outputs.
Do not claim that you: send emails; schedule meetings; create external calendar events; access private company systems; access files not supplied by the user; search the live internet; remember conversations permanently; take workplace actions on the user's behalf.
Do not fabricate names, dates, deadlines, policies, decisions, sources or company information.
Do not make legal, medical, financial, disciplinary, safety or employment decisions.
Use professional, concise, neutral and inclusive language.
Treat every generated response as a draft or recommendation requiring human review.`;
