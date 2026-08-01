import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Settings = {
  question: z.string().trim().min(1).max(2000),
  audience: z.string().trim().max(60),
  detail: z.string().trim().max(60),
  focus: z.string().trim().max(60),
};

const ResearchInput = z.object({
  ...Settings,
  material: z.string().trim().min(100).max(20000),
});

const PdfInput = z.object({
  ...Settings,
  filename: z.string().trim().min(1).max(300),
  /** Base64-encoded PDF, held only for the duration of this request. */
  fileData: z.string().min(100).max(15_000_000),
});

const UrlInput = z.object({
  ...Settings,
  url: z.string().trim().min(4).max(2000),
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
    const { callGateway, extractJson } = await import("./ai.server");
    const { PASTE_INSTRUCTION, settingsBlock, normaliseSections } = await import(
      "./research.server"
    );

    const text = await callGateway(
      [
        { role: "system", content: PASTE_INSTRUCTION },
        {
          role: "user",
          content: [settingsBlock(data), "Supplied source material:", data.material].join("\n\n"),
        },
      ],
      true,
    );

    return normaliseSections(
      extractJson(text) as Record<string, unknown>,
      "Not established by the supplied source.",
    );
  });

export const runPdfAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PdfInput.parse(input))
  .handler(async ({ data }) => {
    const { callGateway, extractJson } = await import("./ai.server");
    const { PDF_INSTRUCTION, settingsBlock, normaliseSections, sanitiseText } = await import(
      "./research.server"
    );

    const text = await callGateway(
      [
        { role: "system", content: PDF_INSTRUCTION },
        {
          role: "user",
          content: [
            { type: "text" as const, text: settingsBlock(data) },
            {
              type: "file" as const,
              file: {
                filename: sanitiseText(data.filename, 120) || "document.pdf",
                file_data: `data:application/pdf;base64,${data.fileData}`,
              },
            },
          ],
        },
      ],
      true,
    );

    const parsed = extractJson(text) as Record<string, unknown>;
    if (parsed["unreadable"] === true) throw new Error("unreadable_pdf");
    return normaliseSections(parsed, "Not established by the supplied PDF.");
  });

export const runUrlAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => UrlInput.parse(input))
  .handler(async ({ data }) => {
    const { callGateway, extractJson } = await import("./ai.server");
    const { URL_INSTRUCTION, settingsBlock, normaliseSections, validatePublicUrl, scrapePage } =
      await import("./research.server");

    const checked = validatePublicUrl(data.url);
    if (!checked.ok) throw new Error("unsafe_url");

    let page;
    try {
      page = await scrapePage(checked.url);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "connector";
      // One automatic retry, only for transient connector failures.
      if (reason === "connector") {
        page = await scrapePage(checked.url);
      } else {
        throw error;
      }
    }

    const text = await callGateway(
      [
        { role: "system", content: URL_INSTRUCTION },
        {
          role: "user",
          content: [
            settingsBlock(data),
            `Retrieved webpage title: ${page.title}`,
            `Source domain: ${page.domain}`,
            "Retrieved webpage content:",
            page.markdown,
          ].join("\n\n"),
        },
      ],
      true,
    );

    return {
      ...normaliseSections(
        extractJson(text) as Record<string, unknown>,
        "Not established by the retrieved webpage.",
      ),
      source: {
        title: page.title,
        domain: page.domain,
        finalUrl: page.finalUrl,
        retrievedAt: page.retrievedAt,
      },
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
