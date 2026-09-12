import { NextResponse } from "next/server";
import { getAnthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { MODULES } from "@/lib/curriculum";
import { TECHNIQUES, QUICK_REFERENCE } from "@/lib/glossary";
import { offlineTutorReply } from "@/lib/tutor-offline";

export const runtime = "nodejs";

interface TutorBody {
  messages: { role: "user" | "assistant"; content: string }[];
  moduleSlug?: string;
}

/**
 * The COMPLETE curriculum, serialized for the tutor's grounding context:
 * every module's theory (headings, ledes, body, steps, callouts) and every
 * scenario (technique, question, correct-answer concept), plus the full
 * technique glossary and the quick-reference rule card. This is what lets the
 * tutor answer anything in the course in depth. It is static, so the caller
 * caches it (see below) to keep repeated requests cheap.
 */
function fullCurriculum(): string {
  const mods = MODULES.map((m) => {
    const label = m.slug === "capstone" ? "FINAL ASSESSMENT" : `MODULE ${m.id}`;
    const sections = m.sections
      .map((s) => {
        const parts: string[] = [`  ▸ ${s.heading}`];
        if (s.lede) parts.push(`    Key idea: ${s.lede}`);
        if (s.body) s.body.forEach((b) => parts.push(`    ${b}`));
        if (s.steps) parts.push(`    Procedure: ${s.steps.join(" → ")}`);
        if (s.callout)
          parts.push(`    [${s.callout.kind.toUpperCase()}] ${s.callout.title}: ${s.callout.body}`);
        return parts.join("\n");
      })
      .join("\n");
    const scenarios = m.scenarios
      .map((s) => `  • Technique "${s.technique}" — Q: ${s.prompt} — Correct answer: ${s.concept}`)
      .join("\n");
    return `=== ${label}: ${m.title} — ${m.subtitle} ===
Why it matters: ${m.whyItMatters}
THEORY:
${sections}
DRILL SCENARIOS (technique — question — correct answer):
${scenarios}`;
  }).join("\n\n");

  const techs = TECHNIQUES.map(
    (t) => `- ${t.name} [${t.category}]: ${t.summary} RULE: ${t.rule}`
  ).join("\n");

  const qr = [
    `Daily reminders: ${QUICK_REFERENCE.daily.join(" | ")}`,
    `Commands: ${QUICK_REFERENCE.commands.map((c) => `${c.cue} = ${c.meaning}`).join(" | ")}`,
    `Wind rule: ${QUICK_REFERENCE.wind}`,
    `Fatigue rule: ${QUICK_REFERENCE.fatigue}`,
    `Stop-work phrases: ${QUICK_REFERENCE.stopWork.join(" | ")}`,
  ].join("\n");

  return `FULL MODULE CURRICULUM:\n${mods}\n\nNAMED TECHNIQUES & RULES:\n${techs}\n\nQUICK-REFERENCE RULE CARD:\n${qr}`;
}

export async function POST(req: Request) {
  let body: TutorBody;
  try {
    body = (await req.json()) as TutorBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // No API key → serve the fully-offline retrieval tutor (no 503; always works).
  const client = getAnthropic();
  if (!client) {
    return NextResponse.json({
      reply: offlineTutorReply(body.messages, body.moduleSlug),
      source: "offline",
    });
  }

  const activeModule = MODULES.find((m) => m.slug === body.moduleSlug);

  const voice = `You are the TourReady Operator AI Safety Tutor — an elite, no-nonsense instructor for Concert & Festival telehandler and forklift operators. You teach ONLY within the live-event production domain (telehandlers, rough-terrain lifts, pre-rigged truss, LED walls, festival/arena venues).

You have the COMPLETE TourReady curriculum below — every module's theory, every drill scenario with its correct answer, every named technique, and the quick-reference card. Treat it as your authoritative source of truth: you can explain any concept in depth, quiz the operator on any module, build custom scenarios, or walk through the correct answer to any drill.

RULES OF VOICE:
- Professional, empowering, respectful. Never patronizing, gamified, or childish.
- Treat the work as high-stakes: 2:00 AM load-outs, rigging zones, fatigue, production pressure, expensive gear.
- Always reinforce Stop-Work Authority and the unified "STOP" command (echoed, non-negotiable).
- Use NO warehouse, agricultural, or tractor analogies.
- When you reference a technique, name it precisely (e.g., "Up-Look Protocol", "Sail Effect Wind-Load Derating", "Hot Dog vs. Hamburger", "PIT Classification Trap").
- Keep answers tight and high-signal. Use short paragraphs or compact lists.
- Ground every answer in the curriculum below. If a question falls outside this course, say so briefly, give the safe general principle, and steer back to the curriculum.`;

  const grounding = `CURRICULUM GROUNDING — the complete, authoritative content of the course:\n\n${fullCurriculum()}`;

  // System prompt as ordered content blocks. The large, static grounding block
  // is marked for caching so repeated tutor turns don't re-pay for it; the small
  // per-page "active module" hint is appended after the cache breakpoint.
  const system = [
    { type: "text" as const, text: voice },
    {
      type: "text" as const,
      text: grounding,
      cache_control: { type: "ephemeral" as const },
    },
    ...(activeModule
      ? [
          {
            type: "text" as const,
            text: `The operator is currently studying: ${activeModule.title} — ${activeModule.subtitle}. Bias examples toward this module when relevant.`,
          },
        ]
      : []),
  ];

  try {
    const msg = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system,
      messages: body.messages.slice(-12),
    });
    const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
    return NextResponse.json({ reply: text, source: "ai" });
  } catch (err) {
    // Live call failed (bad key, rate limit, network) → fall back to offline.
    // Logged rather than swallowed: this path degrades silently to the offline
    // tutor, so without a log a broken model id or key looks like normal
    // operation. Visible in `wrangler tail`.
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`[tutor] live call failed (model=${ANTHROPIC_MODEL}): ${detail}`);
    return NextResponse.json({
      reply: offlineTutorReply(body.messages, body.moduleSlug),
      source: "offline",
    });
  }
}
