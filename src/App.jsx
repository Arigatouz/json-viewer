import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./theme.css";

import { parseInput } from "./lib/json.js";
import { buildGraph, rowText } from "./lib/graph.js";
import { layoutGraph, buildNodeIndex } from "./lib/layout.js";
import { jsonToTs } from "./lib/tsgen.js";
import { SAMPLE, SAMPLE_JSONL } from "./lib/samples.js";

import { useParsedInput } from "./hooks/useParsedInput.js";
import { useCollapse } from "./hooks/useCollapse.js";
import { useViewport } from "./hooks/useViewport.js";

import { Header } from "./components/Header.jsx";
import { Editor } from "./components/Editor.jsx";
import { GraphCanvas } from "./components/GraphCanvas.jsx";
import { TsModal } from "./components/TsModal.jsx";

const MODAL_CLOSE_MS = 220;

/* ================================================================
   SCHEMATIC — a JSON → graph visualizer.
   This component is the composition root: it wires the derived data
   (graph → layout → matches) to the viewport, collapse, and modal
   concerns, each of which lives in its own hook or component.
   ================================================================ */
export default function SchematicJsonVisualizer() {
  const [theme, setTheme] = useState("dark");
  const [text, setText] = useState(() => JSON.stringify(SAMPLE, null, 2));
  const [query, setQuery] = useState("");

  // --- derived data (no effect-driven state sync) ---
  const { parsed, kind, error } = useParsedInput(text);
  const graph = useMemo(
    () => buildGraph(parsed, kind === "jsonl" ? "records" : "root"),
    [parsed, kind]
  );
  const nodeById = useMemo(() => buildNodeIndex(graph), [graph]);

  const { collapsed, closing, toggle, expandAll } = useCollapse(nodeById);

  const laid = useMemo(
    () => layoutGraph(graph, collapsed, nodeById),
    [graph, collapsed, nodeById]
  );

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

  // --- viewport ---
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const { view, fit, zoom, panHandlers } = useViewport({ svgRef, wrapRef, bbox: laid.bbox });
  useEffect(() => { fit(); }, [graph, fit]); // refit when the data changes

  // --- TypeScript modal ---
  const [tsOut, setTsOut] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalTimer = useRef(null);
  const copyTimer = useRef(null);
  useEffect(() => () => {
    clearTimeout(modalTimer.current);
    clearTimeout(copyTimer.current);
  }, []);

  const genTs = useCallback(() => {
    clearTimeout(modalTimer.current);
    setModalClosing(false);
    setTsOut(jsonToTs(parsed));
  }, [parsed]);

  const closeModal = useCallback(() => {
    setModalClosing(true);
    clearTimeout(modalTimer.current);
    modalTimer.current = setTimeout(() => {
      setTsOut(null);
      setModalClosing(false);
    }, MODAL_CLOSE_MS);
  }, []);

  const copyTs = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(tsOut);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard permission denied — leave the button label unchanged.
    }
  }, [tsOut]);

  // --- editor actions ---
  const editorActions = useMemo(() => {
    // Re-serialize the current text if it parses; silently no-op if it doesn't,
    // since the editor already surfaces the parse error.
    const reserialize = (toJson) => {
      try {
        const { value, kind: k } = parseInput(text);
        setText(k === "jsonl"
          ? value.map((v) => JSON.stringify(v)).join("\n")
          : toJson(value));
      } catch {
        // invalid input — nothing to reformat
      }
    };
    return {
      format: () => reserialize((v) => JSON.stringify(v, null, 2)),
      minify: () => reserialize((v) => JSON.stringify(v)),
      loadSample: () => setText(JSON.stringify(SAMPLE, null, 2)),
      loadSampleJsonl: () => setText(SAMPLE_JSONL),
      toJsonArray: () => {
        try {
          const { value, kind: k } = parseInput(text);
          if (k === "jsonl") setText(JSON.stringify(value, null, 2));
        } catch {
          // invalid input — nothing to convert
        }
      },
      genTs,
    };
  }, [text, genTs]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <div className="app" data-theme={theme}>
      <Header
        nodeCount={graph.nodes.length}
        depth={maxDepth}
        hits={matches.size}
        hasQuery={Boolean(query)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="main">
        <Editor
          text={text}
          onChange={setText}
          kind={kind}
          error={error}
          recordCount={kind === "jsonl" && Array.isArray(parsed) ? parsed.length : 0}
          actions={editorActions}
        />

        <GraphCanvas
          laid={laid}
          collapsed={collapsed}
          closing={closing}
          matches={matches}
          onToggle={toggle}
          view={view}
          panHandlers={panHandlers}
          svgRef={svgRef}
          wrapRef={wrapRef}
          query={query}
          onQueryChange={setQuery}
          onExpandAll={expandAll}
          onZoomIn={() => zoom(1.25)}
          onZoomOut={() => zoom(0.8)}
          onFit={fit}
        />
      </div>

      {tsOut !== null && (
        <TsModal
          code={tsOut}
          closing={modalClosing}
          copied={copied}
          onCopy={copyTs}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
