/* ================================================================
   Layout — tidy left→right tree. Pure geometry over a graph.
   Constants are exported so the node renderer stays in sync.
   ================================================================ */
import { rowText } from "./graph.js";

export const ROW_H = 19;
export const HEAD_H = 26;
export const PAD_X = 10;
export const GAP_Y = 16;
export const GAP_X = 72;
export const CH = 7.6;
export const MAX_CHARS = 42;

export function buildNodeIndex(graph) {
  return Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
}

export function layoutGraph(graph, collapsed, byId = buildNodeIndex(graph)) {
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
