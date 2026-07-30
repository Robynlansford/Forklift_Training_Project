import { NextResponse } from "next/server";
import { getAnthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

interface GradeBody {
  prompt: string;
  technique: string;
  concept: string;
  passKeywords: string[];
  failKeywords: string[];
  answer: string;
  offlineVerdict: "PASS" | "FAIL";
}

/**
 * Nuanced, instructor-style grading layer.
 * If no ANTHROPIC_API_KEY is set, returns 503 and the client keeps its
 * deterministic offline verdict — the trainer stays fully functional.
 */
export async function POST(req: Request) {
  let body: GradeBody;
  try {
    body = (await req.json()) as GradeBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json({ error: "AI grading not configured" }, { status: 503 });
  }

  const system = `You are a strict but fair safety instructor for concert and festival forklift and telehandler operations. You grade an operator's free-text answer to a field scenario.

SCENARIO: ${body.prompt}
NAMED TECHNIQUE BEING DRILLED: ${body.technique}
CORE CONCEPT (the correct answer): ${body.concept}
SIGNALS OF A CORRECT ANSWER: ${body.passKeywords.join(", ") || "(use judgement)"}
SIGNALS OF A DANGEROUS / WRONG ANSWER: ${body.failKeywords.join(", ") || "(use judgement)"}

Grade on whether the operator's DECISION is safe and correct — reward the right action even if phrased differently than the keywords. An actively unsafe decision must FAIL even if it sounds confident.

Respond with ONLY a raw JSON object, no markdown, no code fences:
{"verdict":"PASS"|"FAIL","feedback":"2-3 crisp sentences of instructor feedback. If PASS: affirm the technique by name and add one pro tip. If FAIL: state exactly what was wrong and the correct action. ALWAYS end by naming the technique: ${body.technique}."}`;

  try {
    const msg = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: body.answer }],
    });

    const raw = msg.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    const parsed = JSON.parse(raw) as { verdict: "PASS" | "FAIL"; feedback: string };
    if (parsed.verdict !== "PASS" && parsed.verdict !== "FAIL") {
      throw new Error("bad verdict");
    }

    return NextResponse.json({
      verdict: parsed.verdict,
      feedback: parsed.feedback,
      technique: body.technique,
      source: "ai",
    });
  } catch {
    // Any AI/parse failure → tell client to fall back to its offline verdict.
    return NextResponse.json({ error: "AI grading failed" }, { status: 502 });
  }
}
