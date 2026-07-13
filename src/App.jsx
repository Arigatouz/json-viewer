import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ================================================================
   SCHEMATIC — a JSON → graph visualizer (JSON Crack, rebuilt)
   ----------------------------------------------------------------
   Skinned with the ALIDEVHUB DESIGN SYSTEM (cyberpunk / neon-noir,
   rev 2026.06). Canonical tokens live under [data-theme="dark"];
   the light theme is a contrast-corrected derivation of the same
   hues. Every color, node hue, radius, font, duration and clip-path
   in the app derives from the token block below.
   ================================================================ */

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');

:root{
  /* ==== ALIDEVHUB DESIGN SYSTEM · rev 2026.06 ==== */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --tracking-tight: -0.025em;
  --tracking-wide:  0.025em;
  --tracking-widest: 0.1em;
  --dur-fast: 150ms;
  --dur-base: 250ms;
  --dur-slow: 350ms;
  --ease: cubic-bezier(.4, 0, .2, 1);
  --z-modal: 1040;
  --clip-card: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
  --clip-btn:  polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  --font-display: 'Chakra Petch', system-ui, sans-serif;
  --font-ui:      'Rajdhani', system-ui, sans-serif;
  --font-data:    'Chakra Petch', ui-monospace, monospace;
}

[data-theme="dark"]{
  /* -- canonical neon accents -- */
  --cyber-primary:   #00F3FF;
  --cyber-secondary: #FF00FF;
  --cyber-accent:    #BA84FF;
  --cyber-success:   #05FFA1;
  --cyber-warning:   #FCEE0A;
  --cyber-danger:    #FF2A6D;
  /* -- surfaces & text -- */
  --cyber-black: #0A0A0F;
  --cyber-dark:  #121218;
  --cyber-card:  #16161E;
  --cyber-border:#1F2937;
  --cyber-text:  #E0E0E0;
  --cyber-muted: #A9AECB;
  /* -- glows -- */
  --glow-cyan:    0 0 10px rgba(0,243,255,.45),  0 0 26px rgba(0,243,255,.18);
  --glow-magenta: 0 0 10px rgba(255,0,255,.45),  0 0 26px rgba(255,0,255,.18);

  /* -- app mapping -- */
  --bg:        var(--cyber-black);
  --surface:   var(--cyber-dark);
  --surface-2: var(--cyber-card);
  --line:      var(--cyber-border);
  --text:      var(--cyber-text);
  --muted:     var(--cyber-muted);
  --accent:    var(--cyber-primary);
  --accent-ink:#031014;
  --hit:       var(--cyber-secondary);
  --danger:    var(--cyber-danger);
  --grid-dot:  #171922;
  --t-string:  var(--cyber-success);
  --t-number:  var(--cyber-warning);
  --t-boolean: var(--cyber-accent);
  --t-null:    #6B7186;
  --t-key:     var(--cyber-muted);
  --t-branch:  var(--cyber-primary);
  --node-bg:   var(--cyber-card);
  --node-head: #1B1B26;
  --shadow: 0 10px 30px rgba(0,0,0,.55);
}

[data-theme="light"]{
  /* light variant derived from the same hues, contrast-corrected */
  --cyber-primary:   #008B9E;
  --cyber-secondary: #B800B8;
  --cyber-accent:    #6D3FD1;
  --cyber-success:   #04835A;
  --cyber-warning:   #8A7500;
  --cyber-danger:    #D40E52;
  --cyber-black: #F4F5FA;
  --cyber-dark:  #FFFFFF;
  --cyber-card:  #FFFFFF;
  --cyber-border:#D9DDE9;
  --cyber-text:  #14141C;
  --cyber-muted: #5A6178;
  --glow-cyan:    0 0 0 transparent;
  --glow-magenta: 0 0 0 transparent;

  --bg:        var(--cyber-black);
  --surface:   var(--cyber-dark);
  --surface-2: #EEF0F7;
  --line:      var(--cyber-border);
  --text:      var(--cyber-text);
  --muted:     var(--cyber-muted);
  --accent:    var(--cyber-primary);
  --accent-ink:#FFFFFF;
  --hit:       var(--cyber-secondary);
  --danger:    var(--cyber-danger);
  --grid-dot:  #E2E5EF;
  --t-string:  var(--cyber-success);
  --t-number:  var(--cyber-warning);
  --t-boolean: var(--cyber-accent);
  --t-null:    #6B7186;
  --t-key:     #3D4459;
  --t-branch:  var(--cyber-primary);
  --node-bg:   #FFFFFF;
  --node-head: #F0F2F8;
  --shadow: 0 8px 24px rgba(20,20,28,.10);
}

*{ box-sizing:border-box; }
.app{
  height:100vh; display:flex; flex-direction:column;
  background:var(--bg); color:var(--text); font-family:var(--font-ui);
  transition: background var(--dur-base) var(--ease), color var(--dur-base) var(--ease);
}

/* ---------------- header ---------------- */
.hdr{
  display:flex; align-items:center; gap:14px;
  padding:10px 16px; border-bottom:1px solid var(--line);
  background:var(--surface);
}
.brand{ display:flex; align-items:baseline; gap:10px; }
.brand h1{
  font-family:var(--font-display); font-size:16px; font-weight:700;
  letter-spacing:var(--tracking-widest); margin:0; text-transform:uppercase;
  text-shadow: var(--glow-cyan);
}
.brand .tick{ color:var(--accent); }
.brand span{
  font-family:var(--font-display); font-size:10px; color:var(--muted);
  letter-spacing:var(--tracking-wide); text-transform:uppercase;
}
.hdr .spacer{ flex:1; }
.stats{ font-family:var(--font-display); font-size:10px; letter-spacing:var(--tracking-wide);
  color:var(--muted); display:flex; gap:14px; text-transform:uppercase; }
.stats b{ color:var(--accent); font-weight:600; }

.btn{
  font-family:var(--font-display); font-weight:600; font-size:11px;
  letter-spacing:var(--tracking-wide); text-transform:uppercase;
  border:1px solid var(--line); background:var(--surface-2); color:var(--text);
  clip-path: var(--clip-btn);
  border-radius:var(--radius-sm); padding:7px 12px; cursor:pointer;
  transition: border-color var(--dur-fast) var(--ease),
              color var(--dur-fast) var(--ease),
              box-shadow var(--dur-fast) var(--ease),
              transform var(--dur-fast) var(--ease);
}
.btn:hover{ border-color:var(--accent); color:var(--accent); box-shadow: var(--glow-cyan); }
.btn:active{ transform:scale(.97); }
.btn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
.btn.primary{ background:var(--accent); color:var(--accent-ink); border-color:transparent; }
.btn.primary:hover{ color:var(--accent-ink); }
.btn.icon{ padding:7px 9px; line-height:1; }

/* ---------------- layout ---------------- */
.main{ flex:1; display:flex; min-height:0; }
.editor{
  width:340px; min-width:240px; display:flex; flex-direction:column;
  border-right:1px solid var(--line); background:var(--surface);
}
.editor .bar{
  display:flex; gap:6px; padding:8px; border-bottom:1px solid var(--line); flex-wrap:wrap;
}
.editor textarea{
  flex:1; resize:none; border:0; outline:none; padding:12px;
  background:var(--surface); color:var(--text);
  font-family:var(--font-data); font-size:12px; line-height:1.55;
  tab-size:2; caret-color:var(--accent);
}
.err{
  font-family:var(--font-data); font-size:11px; color:var(--danger);
  padding:8px 12px; border-top:1px solid var(--line); background:var(--surface-2);
}
.ok{
  font-family:var(--font-data); font-size:11px; color:var(--muted);
  padding:8px 12px; border-top:1px solid var(--line);
}

.canvas-wrap{ flex:1; position:relative; min-width:0; }
.canvas-wrap svg{
  display:block; width:100%; height:100%;
  background-image:
    repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,243,255,.012) 3px 6px),
    radial-gradient(var(--grid-dot) 1px, transparent 1px);
  background-size: 100% 100%, 22px 22px; cursor:grab;
}
.canvas-wrap svg.panning{ cursor:grabbing; }

/* ---------------- node open/close animation ---------------- */
.node-g{
  transition: transform var(--dur-slow) var(--ease);
}
.node-inner{
  transform-origin: 0px 50%;
  animation: nodeIn var(--dur-base) var(--ease) both;
}
.node-inner.closing{
  transition: opacity var(--dur-base) var(--ease), transform var(--dur-base) var(--ease);
  opacity: 0;
  transform: scale(.82);
  pointer-events: none;
}
@keyframes nodeIn{
  from{ opacity:0; transform: scale(.82); }
  to{ opacity:1; transform: scale(1); }
}
.edge-path{
  transition: opacity var(--dur-base) var(--ease);
}
.edge-path.closing{ opacity:0; }

.toolbar{
  position:absolute; top:12px; left:12px; display:flex; gap:6px; align-items:center;
  background:var(--surface); border:1px solid var(--line);
  clip-path: var(--clip-card); border-radius:var(--radius-sm);
  padding:6px 16px 6px 6px; box-shadow:var(--shadow);
}
.toolbar input{
  font-family:var(--font-display); font-size:11px; letter-spacing:var(--tracking-wide);
  border:1px solid var(--line);
  border-radius:var(--radius-sm); padding:6px 9px; width:170px;
  background:var(--surface-2); color:var(--text); outline:none;
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
}
.toolbar input:focus{ border-color:var(--hit); box-shadow: var(--glow-magenta); }
.zoomctl{
  position:absolute; bottom:14px; right:14px; display:flex; flex-direction:column; gap:6px;
}
.legend{
  position:absolute; bottom:14px; left:14px; display:flex; gap:12px;
  background:var(--surface); border:1px solid var(--line);
  clip-path: var(--clip-card); border-radius:var(--radius-sm);
  padding:7px 20px 7px 12px; font-family:var(--font-display); font-size:9px;
  letter-spacing:var(--tracking-wide); text-transform:uppercase; color:var(--muted);
  box-shadow:var(--shadow);
}
.legend i{ width:8px; height:8px; border-radius:1px; display:inline-block; margin-right:5px; }

/* ---------------- modal ---------------- */
.modal-backdrop{
  position:fixed; inset:0; background:rgba(6,6,12,.7);
  display:flex; align-items:center; justify-content:center; z-index:var(--z-modal);
}
.modal{
  width:min(640px, 92vw); max-height:80vh; display:flex; flex-direction:column;
  background:var(--surface); border:1px solid var(--accent);
  clip-path: var(--clip-card);
  border-radius:var(--radius-md); box-shadow:var(--glow-cyan), var(--shadow); overflow:hidden;
}
.modal .mh{ display:flex; align-items:center; padding:12px 16px; border-bottom:1px solid var(--line); }
.modal .mh h2{
  font-family:var(--font-display); font-size:12px; margin:0;
  letter-spacing:var(--tracking-widest); text-transform:uppercase;
}
.modal pre{
  margin:0; padding:16px 16px 24px; overflow:auto; flex:1;
  font-family:var(--font-data); font-size:12px; line-height:1.6; color:var(--text);
  background:var(--surface-2);
}
.modal-backdrop{ animation: backdropIn var(--dur-base) var(--ease); }
.modal-backdrop.closing{ animation: backdropOut var(--dur-base) var(--ease) forwards; }
.modal{ animation: modalIn var(--dur-slow) var(--ease); }
.modal.closing{ animation: modalOut var(--dur-base) var(--ease) forwards; }
@keyframes backdropIn{ from{ opacity:0; } to{ opacity:1; } }
@keyframes backdropOut{ from{ opacity:1; } to{ opacity:0; } }
@keyframes modalIn{
  from{ opacity:0; transform: translateY(10px) scale(.96); }
  to{ opacity:1; transform: translateY(0) scale(1); }
}
@keyframes modalOut{
  from{ opacity:1; transform: translateY(0) scale(1); }
  to{ opacity:0; transform: translateY(10px) scale(.96); }
}

@media (max-width: 720px){
  .main{ flex-direction:column; }
  .editor{ width:100%; height:38%; border-right:0; border-bottom:1px solid var(--line); }
  .toolbar input{ width:110px; }
  .legend{ display:none; }
}
@media (prefers-reduced-motion: reduce){
  *{ transition:none !important; animation:none !important; }
}
`;

/* ================================================================
   Sample data — an agent pipeline config
   ================================================================ */
const SAMPLE = {
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

/* ================================================================
   Graph building
   ================================================================ */
const isPrim = (v) => v === null || typeof v !== "object";
const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
const fmtVal = (v) => (v === null ? "null" : typeof v === "string" ? JSON.stringify(v) : String(v));
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/* Parse plain JSON, or fall back to JSONL (one JSON value per line). */
function parseInput(text) {
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

const SAMPLE_JSONL = [
  { ts: "2026-07-13T09:02:11Z", run: "a1f3", stage: "discover", tool: "n8n.trigger_flow", ok: true, latencyMs: 412 },
  { ts: "2026-07-13T09:02:14Z", run: "a1f3", stage: "score", model: "claude-sonnet-4-6", tokens: { in: 6210, out: 340 }, ok: true },
  { ts: "2026-07-13T09:02:19Z", run: "a1f3", stage: "draft", tokens: { in: 480, out: 1290 }, ok: false, error: "rate_limited" },
  { ts: "2026-07-13T09:02:25Z", run: "a1f3", stage: "draft", retry: 1, tokens: { in: 480, out: 1310 }, ok: true },
]
  .map((r) => JSON.stringify(r))
  .join("\n");

function buildGraph(data, rootLabel = "root") {
  const nodes = [];
  const edges = [];
  let id = 0;

  function makeNode(label, kind) {
    const n = { id: `n${id++}`, label, kind, rows: [], children: [] };
    nodes.push(n);
    return n;
  }

  function walk(value, label, parent) {
    if (isPrim(value)) {
      const n = makeNode(label, "leaf");
      n.rows.push({ k: null, v: fmtVal(value), t: typeOf(value) });
      link(parent, n);
      return n;
    }
    if (Array.isArray(value)) {
      const n = makeNode(`${label} [${value.length}]`, "array");
      link(parent, n);
      value.forEach((item, i) => {
        if (isPrim(item)) n.rows.push({ k: String(i), v: fmtVal(item), t: typeOf(item) });
        else walk(item, `${label}[${i}]`, n);
      });
      return n;
    }
    // object
    const n = makeNode(label, "object");
    link(parent, n);
    for (const [k, v] of Object.entries(value)) {
      if (isPrim(v)) n.rows.push({ k, v: fmtVal(v), t: typeOf(v) });
      else walk(v, k, n);
    }
    return n;
  }

  function link(parent, child) {
    if (!parent) return;
    parent.children.push(child.id);
    edges.push({ from: parent.id, to: child.id });
  }

  const root = walk(data, rootLabel, null);
  return { nodes, edges, rootId: root.id };
}

/* ================================================================
   Layout — tidy left→right tree
   ================================================================ */
const ROW_H = 19, HEAD_H = 26, PAD_X = 10, GAP_Y = 16, GAP_X = 72;
const CH = 7.6, MAX_CHARS = 42;

function rowText(r) {
  return r.k === null ? r.v : `${r.k}: ${r.v}`;
}

function layoutGraph(graph, collapsed) {
  const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const pos = {}; // id -> {x,y,w,h,depth,hiddenCount}
  const visibleEdges = [];

  function measure(n) {
    let maxLen = n.label.length + 4;
    for (const r of n.rows) maxLen = Math.max(maxLen, Math.min(rowText(r).length, MAX_CHARS));
    const w = Math.max(110, Math.min(340, maxLen * CH + PAD_X * 2));
    const h = HEAD_H + n.rows.length * ROW_H + (n.rows.length ? 8 : 4);
    return { w, h };
  }

  // depth assignment on visible tree
  const colW = [];
  function depths(id, d) {
    const n = byId[id];
    const m = measure(n);
    pos[id] = { ...m, depth: d };
    colW[d] = Math.max(colW[d] || 0, m.w);
    if (!collapsed.has(id)) for (const c of n.children) depths(c, d + 1);
  }
  depths(graph.rootId, 0);

  const colX = [];
  let acc = 0;
  for (let d = 0; d < colW.length; d++) { colX[d] = acc; acc += colW[d] + GAP_X; }

  /* Band layout: every subtree reserves a disjoint vertical band equal to
     max(own height, stacked children bands). The node is centered inside
     its own band, so a tall parent can never overlap a sibling subtree. */
  const subH = {};
  function calcBand(id) {
    const n = byId[id];
    const kids = collapsed.has(id) ? [] : n.children;
    let kidsH = 0;
    kids.forEach((c, i) => { kidsH += calcBand(c) + (i ? GAP_Y : 0); });
    subH[id] = Math.max(pos[id].h, kidsH);
    return subH[id];
  }
  calcBand(graph.rootId);

  function place(id, top) {
    const n = byId[id];
    const p = pos[id];
    p.x = colX[p.depth];
    p.y = top + (subH[id] - p.h) / 2;
    const kids = collapsed.has(id) ? [] : n.children;
    if (kids.length) {
      const total = kids.reduce((s, c, i) => s + subH[c] + (i ? GAP_Y : 0), 0);
      let cur = top + (subH[id] - total) / 2;
      for (const c of kids) {
        visibleEdges.push({ from: id, to: c });
        place(c, cur);
        cur += subH[c] + GAP_Y;
      }
    }
    if (collapsed.has(id)) {
      let count = 0;
      (function cnt(x) { for (const c of byId[x].children) { count++; cnt(c); } })(id);
      p.hiddenCount = count;
    }
  }
  place(graph.rootId, 0);

  // bbox
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id in pos) {
    const p = pos[id];
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + p.w); maxY = Math.max(maxY, p.y + p.h);
  }
  return { pos, visibleEdges, byId, bbox: { minX, minY, maxX, maxY } };
}

/* ================================================================
   TypeScript type generation
   ================================================================ */
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
// Best-effort singularization for deriving an element name from a collection key.
const singularize = (s) => {
  if (/ies$/i.test(s)) return s.slice(0, -3) + "y";
  if (/(ss|us|is)$/i.test(s)) return s; // status, bus, axis — leave alone
  if (/s$/i.test(s)) return s.slice(0, -1);
  return s;
};

function jsonToTs(value, rootName = "Root") {
  const out = [];
  const used = new Set();
  const bySignature = new Map(); // structural signature -> interface name
  const iface = (name) => {
    let n = name.replace(/[^A-Za-z0-9]/g, "");
    n = n.charAt(0).toUpperCase() + n.slice(1) || "Node";
    let final = n, i = 2;
    while (used.has(final)) final = n + i++;
    used.add(final);
    return final;
  };

  // Emit (or reuse) an interface for a merged object shape and return its name.
  // `objects` is a list of plain objects that should share a single interface.
  function ifaceFor(objects, hint) {
    const total = objects.length;
    const keys = [];
    const seen = new Set();
    for (const o of objects)
      for (const k of Object.keys(o))
        if (!seen.has(k)) { seen.add(k); keys.push(k); }

    const fields = keys.map((k) => {
      const present = objects.filter((o) => Object.prototype.hasOwnProperty.call(o, k));
      const optional = present.length < total;
      const type = typeForValues(present.map((o) => o[k]), k);
      return { k, optional, type };
    });

    // Structural signature so identical shapes collapse to one interface.
    const sig = fields.map((f) => `${f.k}${f.optional ? "?" : ""}:${f.type}`).join(";");
    if (bySignature.has(sig)) return bySignature.get(sig);

    const name = iface(hint);
    bySignature.set(sig, name);
    const lines = fields.map((f) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(f.k) ? f.k : JSON.stringify(f.k);
      return `  ${key}${f.optional ? "?" : ""}: ${f.type};`;
    });
    out.push(`export interface ${name} {\n${lines.join("\n")}\n}`);
    return name;
  }

  // Resolve a TypeScript type for a set of sibling values (e.g. all values a
  // given key takes across records, or all elements of an array). Objects are
  // merged into a single interface; other types are unioned.
  function typeForValues(values, hint) {
    if (!values.length) return "unknown";
    if (values.every(isPlainObject)) return ifaceFor(values, singularize(hint));
    const parts = [...new Set(values.map((v) => typeFor(v, hint)))];
    return parts.join(" | ");
  }

  function typeFor(v, hint) {
    if (v === null) return "null";
    if (Array.isArray(v)) {
      if (!v.length) return "unknown[]";
      const elem = typeForValues(v, hint);
      return elem.includes(" | ") ? `(${elem})[]` : `${elem}[]`;
    }
    if (typeof v === "object") return ifaceFor([v], hint);
    return typeof v;
  }

  // When the root is an array/primitive we emit `export type Root = ...`, so
  // reserve the root name first to stop a nested element interface (e.g. JSONL
  // records) from stealing it and creating a duplicate identifier.
  const rootAlias = isPrim(value) || Array.isArray(value);
  if (rootAlias) iface(rootName);
  const rootType = typeFor(value, rootName);
  if (rootAlias) out.push(`export type ${rootName} = ${rootType};`);
  return out.reverse().join("\n\n");
}

/* ================================================================
   Component
   ================================================================ */
export default function SchematicJsonVisualizer() {
  const [theme, setTheme] = useState("dark");
  const [text, setText] = useState(JSON.stringify(SAMPLE, null, 2));
  const [parsed, setParsed] = useState(SAMPLE);
  const [kind, setKind] = useState("json");
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const [closing, setClosing] = useState(new Set());
  const [query, setQuery] = useState("");
  const [view, setView] = useState({ x: 60, y: 60, k: 1 });
  const [tsOut, setTsOut] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const drag = useRef(null);
  const closeTimers = useRef({});
  const modalTimer = useRef(null);

  useEffect(() => () => {
    Object.values(closeTimers.current).forEach(clearTimeout);
    clearTimeout(modalTimer.current);
  }, []);

  // parse on edit
  useEffect(() => {
    try {
      const { value, kind: k } = parseInput(text);
      setParsed(value);
      setKind(k);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [text]);

  const graph = useMemo(
    () => buildGraph(parsed, kind === "jsonl" ? "records" : "root"),
    [parsed, kind]
  );
  const nodeById = useMemo(
    () => Object.fromEntries(graph.nodes.map((n) => [n.id, n])),
    [graph]
  );
  const laid = useMemo(() => layoutGraph(graph, collapsed), [graph, collapsed]);

  const matches = useMemo(() => {
    if (!query.trim()) return new Set();
    const q = query.toLowerCase();
    const s = new Set();
    for (const n of graph.nodes) {
      const hay = (n.label + " " + n.rows.map(rowText).join(" ")).toLowerCase();
      if (hay.includes(q)) s.add(n.id);
    }
    return s;
  }, [query, graph]);

  const maxDepth = useMemo(
    () => Math.max(0, ...Object.values(laid.pos).map((p) => p.depth)),
    [laid]
  );

  /* ---------- viewport ---------- */
  const fit = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const { minX, minY, maxX, maxY } = laid.bbox;
    const bw = maxX - minX + 80, bh = maxY - minY + 80;
    const k = Math.min(width / bw, height / bh, 1.4);
    setView({
      k,
      x: (width - (maxX - minX) * k) / 2 - minX * k,
      y: (height - (maxY - minY) * k) / 2 - minY * k,
    });
  }, [laid]);

  useEffect(() => { fit(); }, [graph.rootId]); // refit when data changes

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      setView((v) => {
        const k = Math.min(3, Math.max(0.15, v.k * Math.exp(-e.deltaY * 0.0012)));
        return { k, x: mx - ((mx - v.x) / v.k) * k, y: my - ((my - v.y) / v.k) * k };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    e.currentTarget.classList.add("panning");
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const { sx, sy, ox, oy } = drag.current;
    setView((v) => ({ ...v, x: ox + e.clientX - sx, y: oy + e.clientY - sy }));
  };
  const onPointerUp = (e) => {
    drag.current = null;
    e.currentTarget.classList.remove("panning");
  };

  const zoom = (f) =>
    setView((v) => ({ ...v, k: Math.min(3, Math.max(0.15, v.k * f)) }));

  /* ---------- actions ---------- */
  const toggle = (id) => {
    if (collapsed.has(id)) {
      setCollapsed((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      return;
    }
    // Play a close animation on the subtree before actually collapsing it.
    const desc = new Set();
    (function collect(x) {
      const node = nodeById[x];
      if (!node) return;
      for (const c of node.children) {
        desc.add(c);
        collect(c);
      }
    })(id);
    setClosing((s) => new Set([...s, ...desc]));
    clearTimeout(closeTimers.current[id]);
    closeTimers.current[id] = setTimeout(() => {
      setCollapsed((s) => new Set(s).add(id));
      setClosing((s) => {
        const n = new Set(s);
        desc.forEach((d) => n.delete(d));
        return n;
      });
      delete closeTimers.current[id];
    }, 240);
  };
  const expandAll = () => {
    Object.values(closeTimers.current).forEach(clearTimeout);
    closeTimers.current = {};
    setClosing(new Set());
    setCollapsed(new Set());
  };

  const format = () => {
    try {
      const { value, kind: k } = parseInput(text);
      setText(k === "jsonl"
        ? value.map((v) => JSON.stringify(v)).join("\n")
        : JSON.stringify(value, null, 2));
    } catch {}
  };
  const minify = () => {
    try {
      const { value, kind: k } = parseInput(text);
      setText(k === "jsonl"
        ? value.map((v) => JSON.stringify(v)).join("\n")
        : JSON.stringify(value));
    } catch {}
  };
  const loadSample = () => setText(JSON.stringify(SAMPLE, null, 2));
  const loadSampleJsonl = () => setText(SAMPLE_JSONL);
  const toJsonArray = () => {
    try {
      const { value, kind: k } = parseInput(text);
      if (k === "jsonl") setText(JSON.stringify(value, null, 2));
    } catch {}
  };
  const genTs = () => {
    clearTimeout(modalTimer.current);
    setModalClosing(false);
    setTsOut(jsonToTs(parsed));
  };
  const closeModal = () => {
    setModalClosing(true);
    clearTimeout(modalTimer.current);
    modalTimer.current = setTimeout(() => {
      setTsOut(null);
      setModalClosing(false);
    }, 220);
  };
  const copyTs = async () => {
    try { await navigator.clipboard.writeText(tsOut); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {}
  };

  const colorFor = (t) => `var(--t-${t === "array" || t === "object" ? "branch" : t})`;

  /* ---------- render ---------- */
  return (
    <div className="app" data-theme={theme}>
      <style>{THEME_CSS}</style>

      <header className="hdr">
        <div className="brand">
          <h1><span className="tick">//</span> Schematic</h1>
          <span>json → graph · alidevhub</span>
        </div>
        <div className="spacer" />
        <div className="stats">
          <span>nodes <b>{graph.nodes.length}</b></span>
          <span>depth <b>{maxDepth}</b></span>
          {query && <span>hits <b>{matches.size}</b></span>}
        </div>
        <button className="btn icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme">
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </header>

      <div className="main">
        <aside className="editor">
          <div className="bar">
            <button className="btn" onClick={format}>Format</button>
            <button className="btn" onClick={minify}>Minify</button>
            <button className="btn" onClick={loadSample}>Sample</button>
            <button className="btn" onClick={loadSampleJsonl}>Sample .jsonl</button>
            {kind === "jsonl" && (
              <button className="btn" onClick={toJsonArray}>→ JSON array</button>
            )}
            <button className="btn primary" onClick={genTs}>TS types</button>
          </div>
          <textarea
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="JSON input"
          />
          {error
            ? <div className="err">✕ {error}</div>
            : <div className="ok">
                ✓ valid {kind}
                {kind === "jsonl" ? ` · ${parsed.length} records` : ""}
                {" · "}{text.length.toLocaleString()} chars
              </div>}
        </aside>

        <div className="canvas-wrap" ref={wrapRef}>
          <svg
            ref={svgRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
              <defs>
                <filter id="glow-hit" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--hit)" floodOpacity="0.7" />
                </filter>
              </defs>
              {/* edges */}
              {laid.visibleEdges.map((e, i) => {
                const a = laid.pos[e.from], b = laid.pos[e.to];
                const x1 = a.x + a.w, y1 = a.y + a.h / 2;
                const x2 = b.x, y2 = b.y + b.h / 2;
                const dx = Math.max(30, (x2 - x1) / 2);
                return (
                  <path
                    key={i}
                    className={`edge-path${closing.has(e.to) ? " closing" : ""}`}
                    d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth={1.6 / view.k < 1 ? 1 : 1.6}
                  />
                );
              })}

              {/* nodes — beveled clip-card silhouette (bottom-right cut) */}
              {Object.entries(laid.pos).map(([id, p]) => {
                const n = laid.byId[id];
                const hasKids = n.children.length > 0;
                const isCollapsed = collapsed.has(id);
                const hit = matches.has(id);
                const c = 10; // corner cut size
                const bevel = `M 0 0 H ${p.w} V ${p.h - c} L ${p.w - c} ${p.h} H 0 Z`;
                const isClosing = closing.has(id);
                return (
                  <g key={id} className="node-g" transform={`translate(${p.x},${p.y})`}>
                    <g className={`node-inner${isClosing ? " closing" : ""}`}
                       filter={hit ? "url(#glow-hit)" : undefined}>
                      <path
                        d={bevel}
                        fill="var(--node-bg)"
                        stroke={hit ? "var(--hit)" : "var(--line)"}
                        strokeWidth={hit ? 1.6 : 1}
                      />
                      {/* header */}
                      <g
                        style={{ cursor: hasKids ? "pointer" : "default" }}
                        onClick={(ev) => { ev.stopPropagation(); if (hasKids) toggle(id); }}
                        onPointerDown={(ev) => ev.stopPropagation()}
                      >
                        <rect x={0.5} y={0.5} width={p.w - 1} height={HEAD_H} fill="var(--node-head)" />
                        {hasKids && <rect width={3} height={HEAD_H + 1} fill="var(--t-branch)" />}
                        <text
                          x={PAD_X + (hasKids ? 3 : 0)} y={HEAD_H / 2 + 4}
                          fontFamily="var(--font-data)" fontSize={11.5} fontWeight={600}
                          style={{ letterSpacing: "0.02em" }}
                          fill={colorFor(n.kind === "leaf" ? "key" : "object")}
                        >
                          {hasKids ? (isCollapsed ? "▸ " : "▾ ") : ""}
                          {trunc(n.label, MAX_CHARS)}
                          {isCollapsed ? `  ⋯ ${p.hiddenCount}` : ""}
                        </text>
                      </g>
                      {/* rows */}
                      {n.rows.map((r, i) => {
                        const y = HEAD_H + 6 + i * ROW_H + 8;
                        const keyStr = r.k === null ? "" : `${r.k}: `;
                        const valStr = trunc(r.v, MAX_CHARS - keyStr.length);
                        return (
                          <text key={i} x={PAD_X} y={y}
                            fontFamily="var(--font-data)" fontSize={11.5}>
                            {keyStr && <tspan fill="var(--t-key)">{trunc(keyStr, 24)}</tspan>}
                            <tspan fill={colorFor(r.t)} fontWeight={500}>{valStr}</tspan>
                          </text>
                        );
                      })}
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="toolbar">
            <input
              placeholder="Search keys & values…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search graph"
            />
            <button className="btn" onClick={expandAll}>Expand all</button>
          </div>

          <div className="legend">
            <span><i style={{ background: "var(--t-string)" }} />string</span>
            <span><i style={{ background: "var(--t-number)" }} />number</span>
            <span><i style={{ background: "var(--t-boolean)" }} />boolean</span>
            <span><i style={{ background: "var(--t-null)" }} />null</span>
            <span><i style={{ background: "var(--t-branch)" }} />branch</span>
          </div>

          <div className="zoomctl">
            <button className="btn icon" onClick={() => zoom(1.25)} aria-label="Zoom in">＋</button>
            <button className="btn icon" onClick={() => zoom(0.8)} aria-label="Zoom out">－</button>
            <button className="btn icon" onClick={fit} aria-label="Fit view">⤢</button>
          </div>
        </div>
      </div>

      {tsOut !== null && (
        <div className={`modal-backdrop${modalClosing ? " closing" : ""}`} onClick={closeModal}>
          <div className={`modal${modalClosing ? " closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="mh">
              <h2>Generated TypeScript</h2>
              <div className="spacer" style={{ flex: 1 }} />
              <button className="btn primary" onClick={copyTs}>{copied ? "Copied ✓" : "Copy"}</button>
              <button className="btn icon" style={{ marginLeft: 6 }} onClick={closeModal}>✕</button>
            </div>
            <pre>{tsOut}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
