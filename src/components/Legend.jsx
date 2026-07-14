const ITEMS = [
  ["string", "var(--t-string)"],
  ["number", "var(--t-number)"],
  ["boolean", "var(--t-boolean)"],
  ["null", "var(--t-null)"],
  ["branch", "var(--t-branch)"],
];

export function Legend() {
  return (
    <div className="legend">
      {ITEMS.map(([label, color]) => (
        <span key={label}><i style={{ background: color }} />{label}</span>
      ))}
    </div>
  );
}
