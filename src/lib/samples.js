/* ================================================================
   Sample data — an agent pipeline config + a JSONL run log.
   ================================================================ */

export const SAMPLE = {
  pipeline: "recruitment-rag",
  version: "2.4.0",
  active: true,
  model: { provider: "anthropic", name: "claude-sonnet-4-6", maxTokens: 4096, temperature: 0.3 },
  mcpServers: [
    { name: "n8n", transport: "sse", url: "https://n8n.local/mcp", tools: ["trigger_flow", "get_execution"] },
    { name: "gmail", transport: "http", scopes: ["read", "draft"], rateLimit: { rpm: 60, burst: 10 } }
  ],
  retrieval: {
    store: "pgvector",
    topK: 8,
    reranker: null,
    filters: { language: ["en", "ar"], minScore: 0.72 }
  },
  stages: ["discover", "score", "draft", "forecast"]
};

export const SAMPLE_JSONL = [
  { ts: "2026-07-13T09:02:11Z", run: "a1f3", stage: "discover", tool: "n8n.trigger_flow", ok: true, latencyMs: 412 },
  { ts: "2026-07-13T09:02:14Z", run: "a1f3", stage: "score", model: "claude-sonnet-4-6", tokens: { in: 6210, out: 340 }, ok: true },
  { ts: "2026-07-13T09:02:19Z", run: "a1f3", stage: "draft", tokens: { in: 480, out: 1290 }, ok: false, error: "rate_limited" },
  { ts: "2026-07-13T09:02:25Z", run: "a1f3", stage: "draft", retry: 1, tokens: { in: 480, out: 1310 }, ok: true },
]
  .map((r) => JSON.stringify(r))
  .join("\n");
