/* JSON/JSONL text editor: action bar, textarea, and a status line. */
export function Editor({ text, onChange, kind, error, recordCount, actions }) {
  return (
    <aside className="editor">
      <div className="bar">
        <button className="btn" onClick={actions.format}>Format</button>
        <button className="btn" onClick={actions.minify}>Minify</button>
        <button className="btn" onClick={actions.loadSample}>Sample</button>
        <button className="btn" onClick={actions.loadSampleJsonl}>Sample .jsonl</button>
        {kind === "jsonl" && (
          <button className="btn" onClick={actions.toJsonArray}>→ JSON array</button>
        )}
        <button className="btn primary" onClick={actions.genTs}>TS types</button>
      </div>
      <textarea
        spellCheck={false}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        aria-label="JSON input"
      />
      {error
        ? <div className="err">✕ {error}</div>
        : <div className="ok">
            ✓ valid {kind}
            {kind === "jsonl" ? ` · ${recordCount} records` : ""}
            {" · "}{text.length.toLocaleString()} chars
          </div>}
    </aside>
  );
}
