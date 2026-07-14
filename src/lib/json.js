/* ================================================================
   JSON value helpers + input parsing (JSON / JSONL)
   Pure functions — no React, no DOM. Single responsibility:
   turn raw text into a parsed value and describe primitive values.
   ================================================================ */

export const isPrim = (v) => v === null || typeof v !== "object";
export const typeOf = (v) =>
  v === null ? "null" : Array.isArray(v) ? "array" : typeof v;
export const fmtVal = (v) =>
  v === null ? "null" : typeof v === "string" ? JSON.stringify(v) : String(v);
export const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/* Parse plain JSON, or fall back to JSONL (one JSON value per line). */
export function parseInput(text) {
  try {
    return { value: JSON.parse(text), kind: "json" };
  } catch (jsonErr) {
    const lines = text.split(/\r?\n/);
    const records = [];
    let sawAny = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        records.push(JSON.parse(line));
        sawAny = true;
      } catch (e) {
        // Only report as JSONL error if at least one line already parsed —
        // otherwise it's just invalid JSON.
        if (sawAny) throw new Error(`jsonl line ${i + 1}: ${e.message}`);
        throw jsonErr;
      }
    }
    if (records.length < 2) throw jsonErr;
    return { value: records, kind: "jsonl" };
  }
}
