/* ================================================================
   TypeScript type generation from a JSON value. Pure.
   ================================================================ */
import { isPrim } from "./json.js";

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// Best-effort singularization for deriving an element name from a collection key.
const singularize = (s) => {
  if (/ies$/i.test(s)) return s.slice(0, -3) + "y";
  if (/(ss|us|is)$/i.test(s)) return s; // status, bus, axis — leave alone
  if (/s$/i.test(s)) return s.slice(0, -1);
  return s;
};

export function jsonToTs(value, rootName = "Root") {
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
