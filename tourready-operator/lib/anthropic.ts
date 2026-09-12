import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client factory. Returns null when no key is configured.
 *
 * `fetch` is passed explicitly because this runs on Cloudflare Workers. Under
 * nodejs_compat the SDK otherwise reaches for Node's http stack, whose outbound
 * support in Workers is limited — the symptom is a bare "Connection error." on
 * every call. Handing it the platform fetch keeps requests on the Workers
 * networking path, and is harmless on Node, where global fetch is standard.
 */
export function getAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  return new Anthropic({
    apiKey,
    fetch: (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args),
  });
}

/**
 * Grading model.
 *
 * Was "claude-sonnet-4-6", which is not a model id that exists — the path had
 * never executed, because no API key was configured until the first deploy, so
 * nothing surfaced it. Override with ANTHROPIC_MODEL if you want a different one.
 */
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5";
