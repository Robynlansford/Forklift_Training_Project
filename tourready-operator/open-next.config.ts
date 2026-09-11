import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Cloudflare Workers adapter config.
 *
 * No incremental cache is configured: every page here is either static or
 * rendered per-request from local data, and the two API routes are dynamic.
 * Adding an R2/KV cache would buy nothing and would add a failure mode.
 */
export default defineCloudflareConfig();
