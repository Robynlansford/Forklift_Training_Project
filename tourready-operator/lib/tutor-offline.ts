import { MODULES, type Module, type Scenario } from "./curriculum";
import { TECHNIQUES, QUICK_REFERENCE, type TechniqueCard } from "./glossary";
import { gradeOffline } from "./grading";

/**
 * OFFLINE AI SAFETY TUTOR — deterministic retrieval engine.
 * ---------------------------------------------------------------------------
 * Answers questions, explains named techniques, and runs quizzes with ZERO
 * network and no API key, using the curriculum as the single source of truth
 * (MODULES / TECHNIQUES / QUICK_REFERENCE). It reuses gradeOffline() to score
 * quiz answers — the exact same engine the scenario trainer runs on.
 *
 * It retrieves and formats authoritative course content matched to the
 * question; it does not synthesize answers to things outside the curriculum.
 * The route falls back to this whenever the Anthropic key is absent or a live
 * call fails, so the tutor is never dead.
 */

type Msg = { role: "user" | "assistant"; content: string };

/** Function words that never help discriminate a topic. */
const STOPWORDS = new Set([
  "the", "and", "for", "you", "your", "our", "are", "was", "were", "with",
  "what", "whats", "how", "when", "why", "who", "which", "that", "this",
  "should", "would", "could", "can", "cant", "does", "did", "have", "has",
  "about", "into", "onto", "from", "then", "than", "there", "their", "them",
  "get", "got", "put", "use", "using", "need", "want", "tell", "give", "show",
  "explain", "define", "mean", "means", "please", "just", "like", "some",
  "any", "all", "one", "two", "not", "but", "out", "off", "over", "under",
  "its", "it's", "i'm", "im", "a", "an", "of", "to", "in", "on", "is", "be",
  "do", "me", "my", "we", "at", "or", "as", "if", "so", "up",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // hyphens/punctuation become separators
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Stem-aware token match: exact, or one token is a prefix of the other
 * (min length 4). Lets "windy"↔"wind", "rigging"↔"rig", "signals"↔"signal"
 * match without a full stemmer.
 */
function tokenHit(hay: string[], t: string): boolean {
  return hay.some(
    (h) =>
      h === t ||
      (t.length >= 4 && h.startsWith(t)) ||
      (h.length >= 4 && t.startsWith(h))
  );
}

/** Count how many query tokens hit a haystack, with stem-aware matching. */
function overlap(hay: string[], queryTokens: string[]): number {
  return queryTokens.reduce((n, t) => n + (tokenHit(hay, t) ? 1 : 0), 0);
}

function moduleLabel(m: Module): string {
  return m.slug === "capstone" ? "Final Assessment" : `Module ${m.id} · ${m.title}`;
}

function moduleForSlug(slug?: string): Module | undefined {
  return slug ? MODULES.find((m) => m.slug === slug) : undefined;
}

/** Does this text look like a fresh command rather than a quiz answer? */
function isCommand(q: string): boolean {
  return /\b(quiz|test me|ask me|drill|practice|scenario|explain|what is|what's|define|tell me about|help|menu|another|next)\b/i.test(
    q
  );
}

/** Find the scenario whose prompt was quoted in a prior assistant message. */
function askedScenario(assistantMsg: string): { scenario: Scenario; module: Module } | undefined {
  for (const m of MODULES) {
    for (const s of m.scenarios) {
      if (assistantMsg.includes(s.prompt)) return { scenario: s, module: m };
    }
  }
  return undefined;
}

/** Count how many quiz questions have already been asked in this conversation. */
function priorQuizCount(messages: Msg[]): number {
  return messages.filter((m) => m.role === "assistant" && !!askedScenario(m.content)).length;
}

/** Build the scenario pool, optionally scoped to a module or topic keywords. */
function scenarioPool(
  moduleSlug: string | undefined,
  topicTokens: string[]
): { scenario: Scenario; module: Module }[] {
  const all: { scenario: Scenario; module: Module }[] = [];
  MODULES.forEach((m) => m.scenarios.forEach((scenario) => all.push({ scenario, module: m })));

  // Topic keywords take priority (e.g. "quiz me on rigging"). Tier the signal so
  // a topic routes to the module actually named for it, not any scenario that
  // merely mentions the word: title (5) > subtitle/technique (2) > prompt (1).
  if (topicTokens.length) {
    const scored = all
      .map((entry) => {
        const title = tokenize(entry.module.title);
        const mid = tokenize(`${entry.module.subtitle} ${entry.scenario.technique}`);
        const prompt = tokenize(entry.scenario.prompt);
        const score =
          overlap(title, topicTokens) * 5 +
          overlap(mid, topicTokens) * 2 +
          overlap(prompt, topicTokens);
        return { entry, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    if (scored.length) return scored.map((x) => x.entry);
  }

  const active = moduleForSlug(moduleSlug);
  if (active) return all.filter((e) => e.module.slug === active.slug);
  return all;
}

function presentScenario(entry: { scenario: Scenario; module: Module }): string {
  return `Quiz — ${moduleLabel(entry.module)}\n\n${entry.scenario.prompt}\n\nType your decision, or say "skip" to see the answer.`;
}

/** Explain a named technique by fuzzy-matching the question to a TechniqueCard. */
function matchTechnique(q: string, tokens: string[]): TechniqueCard | undefined {
  const lower = q.toLowerCase();
  // Strongest: the query contains most of a technique's name.
  let best: { card: TechniqueCard; score: number } | undefined;
  for (const card of TECHNIQUES) {
    const nameLower = card.name.toLowerCase();
    const nameCore = nameLower.replace(/[^a-z0-9\s]/g, " ");
    let score = 0;
    if (lower.includes(nameLower)) score += 100;
    const nameTokens = tokenize(nameCore);
    const hits = nameTokens.filter((t) => tokenHit(tokens, t)).length;
    if (nameTokens.length) score += (hits / nameTokens.length) * 40 + hits * 4;
    if (score > 0 && (!best || score > best.score)) best = { card, score };
  }
  // Require a meaningful match (full name hit, or a solid share of the name).
  return best && best.score >= 12 ? best.card : undefined;
}

function explainTechnique(card: TechniqueCard): string {
  const mod = MODULES.find((m) => m.slug === card.moduleSlug);
  const drill = mod?.scenarios.find((s) => s.technique.toLowerCase() === card.name.toLowerCase());
  const lines = [
    `${card.name} — ${card.summary}`,
    ``,
    `Rule: ${card.rule}`,
    mod ? `From ${moduleLabel(mod)}.` : "",
  ];
  if (drill) lines.push(``, `On the floor: ${drill.concept}`);
  return lines.filter(Boolean).join("\n");
}

/** Score every content unit against the question and return the best answer. */
function retrieveTopic(tokens: string[]): string | undefined {
  if (!tokens.length) return undefined;

  interface Cand {
    score: number;
    render: () => string;
  }
  const cands: Cand[] = [];

  // Module sections.
  MODULES.forEach((m) => {
    m.sections.forEach((sec) => {
      const blob = [
        sec.heading,
        sec.lede ?? "",
        ...(sec.body ?? []),
        ...(sec.steps ?? []),
        sec.callout ? `${sec.callout.title} ${sec.callout.body}` : "",
      ].join(" ");
      const hay = tokenize(blob);
      let score = overlap(hay, tokens);
      // Boost when the section heading itself is being asked about.
      const headTokens = tokenize(sec.heading);
      score += headTokens.filter((t) => tokenHit(tokens, t)).length * 1.5;
      if (score > 0) {
        cands.push({
          score,
          render: () => {
            const parts = [`${moduleLabel(m)} — ${sec.heading}`, ``];
            if (sec.lede) parts.push(sec.lede);
            if (sec.body?.length) parts.push(sec.body.join(" "));
            if (sec.steps?.length) parts.push(`Steps: ${sec.steps.join(" → ")}`);
            if (sec.callout) parts.push(`${sec.callout.title}: ${sec.callout.body}`);
            return parts.join("\n");
          },
        });
      }
    });
  });

  // Technique cards.
  TECHNIQUES.forEach((card) => {
    const hay = tokenize(`${card.name} ${card.summary} ${card.rule}`);
    const score = overlap(hay, tokens);
    if (score > 0) cands.push({ score: score + 0.5, render: () => explainTechnique(card) });
  });

  // Quick-reference rules.
  const qr: { label: string; text: string }[] = [
    { label: "Wind rule", text: QUICK_REFERENCE.wind },
    { label: "Fatigue rule", text: QUICK_REFERENCE.fatigue },
    { label: "Stop-Work phrases", text: QUICK_REFERENCE.stopWork.join(" · ") },
  ];
  qr.forEach((item) => {
    const hay = tokenize(`${item.label} ${item.text}`);
    const score = overlap(hay, tokens);
    if (score > 0) cands.push({ score, render: () => `${item.label}: ${item.text}` });
  });

  if (!cands.length) return undefined;
  cands.sort((a, b) => b.score - a.score);
  // Ignore weak single-token noise.
  if (cands[0].score < 1) return undefined;
  return cands[0].render();
}

function helpMenu(moduleSlug?: string): string {
  const active = moduleForSlug(moduleSlug);
  const lines = [
    "I'm your offline Safety Tutor — grounded in the full TourReady curriculum. I can:",
    "• Explain any named technique — e.g. \"Explain the PIT Classification Trap\"",
    "• Answer a topic question — e.g. \"What do I do when it's windy?\"",
    "• Quiz you — say \"Quiz me\" (add a topic like \"quiz me on rigging\")",
    "• Walk a scenario — e.g. \"Give me a 2:00 AM rigging-zone scenario\"",
  ];
  if (active) {
    const techs = active.scenarios
      .map((s) => s.technique)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 4);
    if (techs.length) lines.push(``, `You're on ${active.title}. Try: ${techs.join(" · ")}.`);
  }
  return lines.join("\n");
}

/**
 * Produce the tutor's reply for the latest user message, deriving quiz state
 * from the conversation history so the engine stays stateless per call.
 */
export function offlineTutorReply(messages: Msg[], moduleSlug?: string): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const q = (lastUser?.content ?? "").trim();
  if (!q) return helpMenu(moduleSlug);

  const lower = q.toLowerCase();
  const qTokens = tokenize(q);
  const prevAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const pending = prevAssistant ? askedScenario(prevAssistant.content) : undefined;

  // 1. Quiz answer — the previous turn asked a question and this isn't a command.
  if (pending && !isCommand(q)) {
    if (/^\s*(skip|pass|show( me)? the answer|i don'?t know|idk)\s*$/i.test(q)) {
      return `The technique here is the ${pending.scenario.technique}: ${pending.scenario.concept}\n\nSay "quiz me" for another.`;
    }
    const result = gradeOffline(pending.scenario, q);
    const tag = result.verdict === "PASS" ? "✅ PASS" : "❌ Not yet";
    return `${tag} — ${result.feedback}\n\nSay "quiz me" for another.`;
  }

  // Words that describe the request itself, not a topic to scope by.
  const SCOPE_WORDS = [
    "quiz", "test", "ask", "drill", "practice", "scenario", "situation", "give",
    "whole", "entire", "everything", "curriculum", "course", "random", "any",
    "another", "more", "question",
  ];

  // 2. Start a quiz.
  if (/\b(quiz|test me|ask me|drill me|practice)\b/i.test(lower)) {
    const topic = qTokens.filter((t) => !SCOPE_WORDS.includes(t));
    const pool = scenarioPool(moduleSlug, topic);
    if (!pool.length) return helpMenu(moduleSlug);
    const idx = priorQuizCount(messages) % pool.length;
    return presentScenario(pool[idx]);
  }

  // 3. Give a scenario.
  if (/\bscenario\b/i.test(lower) || /\bgive me a\b/i.test(lower)) {
    const topic = qTokens.filter((t) => !SCOPE_WORDS.includes(t));
    const pool = scenarioPool(moduleSlug, topic);
    if (!pool.length) return helpMenu(moduleSlug);
    const idx = priorQuizCount(messages) % pool.length;
    return presentScenario(pool[idx]);
  }

  // 4. Explain a named technique.
  const tech = matchTechnique(q, qTokens);
  if (tech) return explainTechnique(tech);

  // 5. Topic keyword retrieval.
  const topic = retrieveTopic(qTokens);
  if (topic) return topic;

  // 6. Fallback / help.
  return helpMenu(moduleSlug);
}
