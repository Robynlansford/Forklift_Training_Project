import type { Scenario } from "./curriculum";

export type Verdict = "PASS" | "FAIL";

export interface GradeResult {
  verdict: Verdict;
  feedback: string;
  technique: string;
  /** Where the verdict came from — surfaced subtly in the UI. */
  source: "ai" | "offline";
}

/**
 * Deterministic, fully-offline grader.
 * ---------------------------------------------------------------------------
 * Runs instantly with no network. A clear FAIL keyword overrides everything
 * (an actively dangerous decision); otherwise at least one PASS concept must
 * be present. This is the reliable floor that keeps the trainer working on a
 * venue laptop with no connectivity — the AI layer only adds nuance on top.
 */
export function gradeOffline(scenario: Scenario, answer: string): GradeResult {
  const text = ` ${answer.toLowerCase()} `;

  const hitFail = scenario.failKeywords.some((k) => text.includes(k.toLowerCase()));
  const hitPass = scenario.passKeywords.some((k) => text.includes(k.toLowerCase()));

  // An explicit dangerous answer fails even if it also name-drops a correct term.
  if (hitFail && !hitPass) {
    return {
      verdict: "FAIL",
      feedback: `Not quite. ${scenario.concept} Re-run the scenario with that technique in mind.`,
      technique: scenario.technique,
      source: "offline",
    };
  }

  if (hitPass) {
    return {
      verdict: "PASS",
      feedback: `Correct — that's the ${scenario.technique}. ${scenario.concept}`,
      technique: scenario.technique,
      source: "offline",
    };
  }

  return {
    verdict: "FAIL",
    feedback: `Not quite. The decision here is the ${scenario.technique}: ${scenario.concept}`,
    technique: scenario.technique,
    source: "offline",
  };
}

/** Minimum answer length before we even bother grading. */
export const MIN_ANSWER_LENGTH = 2;
