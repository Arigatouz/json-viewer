export function Header({ nodeCount, depth, hits, hasQuery, theme, onToggleTheme }) {
  return (
    <header className="hdr">
      <div className="brand">
        <h1><span className="tick">//</span> Schematic</h1>
        <span>json → graph · alidevhub</span>
      </div>
      <div className="spacer" />
      <div className="stats">
        <span>nodes <b>{nodeCount}</b></span>
        <span>depth <b>{depth}</b></span>
        {hasQuery && <span>hits <b>{hits}</b></span>}
      </div>
      <button className="btn icon" onClick={onToggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? "☀" : "☾"}
      </button>
    </header>
  );
}
