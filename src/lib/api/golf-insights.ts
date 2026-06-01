import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Insight } from "@/lib/kilcard/stats";

const InputSchema = z.object({
  holesPlayed: z.number(),
  totalScore: z.number(),
  toPar: z.number(),
  avgPutts: z.number(),
  fairwayHitPct: z.number(),
  fairwayAttempts: z.number(),
  fairwayMissLeft: z.number(),
  fairwayMissRight: z.number(),
  fairwayMissOB: z.number(),
  girPct: z.number(),
  girMissLeft: z.number(),
  girMissRight: z.number(),
  girMissOB: z.number(),
  penalties: z.number(),
});

export type InsightInput = z.infer<typeof InputSchema>;

export const getAIInsights = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const fwMissTotal = data.fairwayMissLeft + data.fairwayMissRight + data.fairwayMissOB;
    const girMissTotal = data.girMissLeft + data.girMissRight + data.girMissOB;

    const fwLine = data.fairwayAttempts > 0
      ? `Fairways: ${Math.round(data.fairwayHitPct * 100)}% of ${data.fairwayAttempts}` +
        (fwMissTotal > 0
          ? ` | misses — left: ${data.fairwayMissLeft}, right: ${data.fairwayMissRight}, OB: ${data.fairwayMissOB}`
          : "")
      : null;

    const girLine = `GIR: ${Math.round(data.girPct * 100)}%` +
      (girMissTotal > 0
        ? ` | misses — left: ${data.girMissLeft}, right: ${data.girMissRight}, OB: ${data.girMissOB}`
        : "");

    const prompt = `You are an expert golf caddie analyst. Analyze this round and return exactly 3 concise, specific insights as a JSON array.

Round data:
- Holes played: ${data.holesPlayed}
- Score: ${data.totalScore} (${data.toPar > 0 ? "+" : ""}${data.toPar} to par)
${fwLine ? `- ${fwLine}` : ""}
- ${girLine}
- Avg putts per hole: ${data.avgPutts.toFixed(2)}
- Penalty strokes: ${data.penalties}

Return ONLY a valid JSON array — no markdown, no explanation:
[{"tone":"focus","title":"...","body":"..."},{"tone":"win","title":"...","body":"..."},{"tone":"neutral","title":"...","body":"..."}]

Guidelines:
- tone: "focus" = area needing work, "win" = strength to build on, "neutral" = general observation
- Use the miss direction data to give specific, directional practice advice (e.g. "You're missing right consistently — check alignment at address")
- body: 1–2 sentences, direct and actionable, no fluff
- Exactly 3 insights`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    try {
      return JSON.parse(text) as Insight[];
    } catch {
      return null;
    }
  });
