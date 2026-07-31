import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ResearchInput = z.object({
  question: z.string().trim().min(1).max(2000),
  material: z.string().trim().min(100).max(20000),
  audience: z.string().trim().max(60),
  detail: z.string().trim().max(60),
  focus: z.string().trim().max(60),
});

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(8000),
      }),
    )
    .min(1)
    .max(10),
});

export const runResearchAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const { callGateway, extractJson, RESEARCH_SYSTEM_INSTRUCTION } = await import(
      "./ai.server"
    );

    const text = await callGateway(
      [
        { role: "system", content: RESEARCH_SYSTEM_INSTRUCTION },
        {
          role: "user",
          content: [
            `Research question: ${data.question}`,
            `Intended audience: ${data.audience}`,
            `Detail level: ${data.detail}`,
            `Output focus: ${data.focus}`,
            "Supplied source material:",
            data.material,
          ].join("\n\n"),
        },
      ],
      true,
    );

    const parsed = extractJson(text) as Record<string, unknown>;
    const section = (key: string): string[] => {
      const value = parsed[key];
      const items = Array.isArray(value)
        ? value.map((v) => String(v).trim()).filter(Boolean)
        : typeof value === "string" && value.trim()
          ? [value.trim()]
          : [];
      return items.length ? items : ["Not established by the supplied material."];
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
  });

export const runWorkplaceChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const { callGateway, CHAT_SYSTEM_INSTRUCTION } = await import("./ai.server");
    const reply = await callGateway([
      { role: "system", content: CHAT_SYSTEM_INSTRUCTION },
      ...data.messages,
    ]);
    return { reply };
  });
