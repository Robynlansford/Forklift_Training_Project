import Anthropic from "@anthropic-ai/sdk";

/** Server-only Anthropic client factory. Returns null when no key is configured. */
export function getAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";
