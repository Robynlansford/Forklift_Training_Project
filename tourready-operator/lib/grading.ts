import type { Scenario } from "./curriculum";

export type Verdict = "PASS" | "FAIL";

export interface GradeResult {
  verdict: Verdict;
  feedback: string;
  technique: string;
  /** Where the verdict came from — surfaced in the UI. */
  source: "ai" | "offline";
  /**
   * True when the verdict came from keyword matching rather than the AI grader.
   * Keyword matching cannot judge reasoning, so these verdicts are provisional
   * and the UI must say so rather than presenting them as assessed.
   */
  provisional?: boolean;
}

/**
 * Words that invert the meaning of a keyword that follows them.
 *
 * "no" and "avoid" must be here: the curriculum states many correct answers as
 * a prohibition whose object is itself a fail keyword — "no wheel-spin" against
 * fail "spin", "no jerk" against fail "jerk", "don't set down" against fail
 * "set down". Without these, a correct answer trips its own scenario's fail
 * list. A negator only suppresses a keyword hit, so listing "no" here does not
 * stop a bare "no" from matching where it is itself a pass keyword.
 */
const NEGATORS = new Set([
  "no",
  "avoid",
  "avoids",
  "avoiding",
  "not",
  "dont",
  "doesnt",
  "didnt",
  "wont",
  "wouldnt",
  "shouldnt",
  "cant",
  "cannot",
  "never",
  "without",
  "skip",
  "skips",
  "skipped",
  "skipping",
  "ignore",
  "ignores",
  "ignoring",
  "forget",
  "forgot",
]);

/** How many preceding tokens are searched for a negator. */
const NEGATION_WINDOW = 3;

/** Normalize to lowercase word tokens, folding "don't" -> "dont". */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z0-9-]+/)
    .filter(Boolean);
}

/**
 * Does `keyword` appear in `tokens` on word boundaries, un-negated?
 *
 * Multi-word keywords ("hands on", "up-look") match as consecutive token runs,
 * so "stop" no longer matches inside "stopped" and "up" no longer matches
 * inside "supervisor".
 */
function hasKeyword(tokens: string[], keyword: string): boolean {
  const kw = tokenize(keyword);
  if (kw.length === 0) return false;

  for (let i = 0; i + kw.length <= tokens.length; i++) {
    let matched = true;
    for (let j = 0; j < kw.length; j++) {
      if (tokens[i + j] !== kw[j]) {
        matched = false;
        break;
      }
    }
    if (!matched) continue;

    // Reject the hit if a negator sits just before it.
    const from = Math.max(0, i - NEGATION_WINDOW);
    const negated = tokens.slice(from, i).some((t) => NEGATORS.has(t));
    if (!negated) return true;
  }
  return false;
}

/**
 * Deterministic, fully-offline grader.
 * ---------------------------------------------------------------------------
 * Runs instantly with no network. Fail-safe by construction:
 *
 *   1. ANY dangerous keyword fails — unconditionally. Naming a correct
 *      technique alongside a dangerous one does not rescue the answer.
 *   2. Pass keywords only count when they are not negated, so "I would not
 *      stop" is no longer read as "stop".
 *   3. Matching is on word boundaries, so short keywords cannot match inside
 *      unrelated words.
 *
 * This is still keyword matching: it cannot assess reasoning, so every verdict
 * it returns is marked `provisional`. The AI grader is what upgrades a verdict
 * to a real assessment.
 */
export function gradeOffline(scenario: Scenario, answer: string): GradeResult {
  const tokens = tokenize(answer);

  const hitFail = scenario.failKeywords.some((k) => hasKeyword(tokens, k));
  const hitPass = scenario.passKeywords.some((k) => hasKeyword(tokens, k));

  // A dangerous decision fails outright, even if the answer also name-drops a
  // correct term. This is the whole point of the fail list.
  if (hitFail) {
    return {
      verdict: "FAIL",
      feedback: `That answer contains an unsafe decision. ${scenario.concept} Re-run the scenario with that technique in mind.`,
      technique: scenario.technique,
      source: "offline",
      provisional: true,
    };
  }

  if (hitPass) {
    return {
      verdict: "PASS",
      feedback: `Correct — that's the ${scenario.technique}. ${scenario.concept}`,
      technique: scenario.technique,
      source: "offline",
      provisional: true,
    };
  }

  return {
    verdict: "FAIL",
    feedback: `Not quite. The decision here is the ${scenario.technique}: ${scenario.concept}`,
    technique: scenario.technique,
    source: "offline",
    provisional: true,
  };
}

/**
 * Minimum answer length before we bother grading.
 * A scenario answer is a decision with a reason — two characters cannot be one.
 */
export const MIN_ANSWER_LENGTH = 12;
