/* ================================================================
   Graph building — turn a parsed JSON value into nodes + edges.
   Pure: no React, no layout, no rendering concerns.
   ================================================================ */
import { isPrim, typeOf, fmtVal } from "./json.js";

export function rowText(r) {
  return r.k === null ? r.v : `${r.k}: ${r.v}`;
}

export function buildGraph(data, rootLabel = "root") {
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
