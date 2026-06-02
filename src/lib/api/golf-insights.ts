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
  upAndDownPct: z.number(),
  upAndDownAttempts: z.number(),
  penalties: z.number(),
});

export type InsightInput = z.infer<typeof InputSchema>;

export const getAIInsights = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { error: "no_key", insights: null };

    const fwMissTotal = data.fairwayMissLeft + data.fairwayMissRight + data.fairwayMissOB;
    const girMissTotal = data.girMissLeft + data.girMissRight + data.girMissOB;

    const fwLine = data.fairwayAttempts > 0
      ? `Fairways: ${Math.round(data.fairwayHitPct * 100)}% of ${data.fairwayAttempts}` +
        (fwMissTotal > 0 ? ` | misses — left: ${data.fairwayMissLeft}, right: ${data.fairwayMissRight}, OB: ${data.fairwayMissOB}` : "")
      : null;

    const girLine = `GIR: ${Math.round(data.girPct * 100)}%` +
      (girMissTotal > 0 ? ` | misses — left: ${data.girMissLeft}, right: ${data.girMissRight}, OB: ${data.girMissOB}` : "");

    const udLine = data.upAndDownAttempts > 0
      ? `Up & Down: ${Math.round(data.upAndDownPct * 100)}% (${data.upAndDownAttempts} attempts)`
      : null;

    const prompt = `You are an expert golf caddie analyst. Analyze this round and return exactly 3 concise, specific insights as a JSON array.

Round data:
- Holes played: ${data.holesPlayed}
- Score: ${data.totalScore} (${data.toPar > 0 ? "+" : ""}${data.toPar} to par)
${fwLine ? `- ${fwLine}` : ""}
- ${girLine}
${udLine ? `- ${udLine}` : ""}- Avg putts per hole: ${data.avgPutts.toFixed(2)}
- Penalty strokes: ${data.penalties}

Return ONLY a valid JSON array — no markdown, no explanation:
[{"tone":"focus","title":"...","body":"..."},{"tone":"win","title":"...","body":"..."},{"tone":"neutral","title":"...","body":"..."}]

Guidelines:
- tone: "focus" = area needing work, "win" = strength to build on, "neutral" = general observation
- Use miss direction data for specific directional advice
- body: 1-2 sentences, direct and actionable
- Exactly 3 insights`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const json = await res.json() as { content?: Array<{ type: string; text: string }>; error?: { message: string } };

      if (json.error) return { error: json.error.message, insights: null };

      const raw = json.content?.[0]?.type === "text" ? json.content[0].text.trim() : "";
      // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
      const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      const insights = JSON.parse(text) as Insight[];
      return { error: null, insights };
    } catch (e) {
      return { error: String(e), insights: null };
    }
  });
