export function Toolbar({ query, onQueryChange, onExpandAll }) {
  return (
    <div className="toolbar">
      <input
        placeholder="Search keys & values…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        aria-label="Search graph"
      />
      <button className="btn" onClick={onExpandAll}>Expand all</button>
    </div>
  );
}
