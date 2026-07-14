/* Modal that displays generated TypeScript with a copy-to-clipboard action.
   Open/close animation is driven by the `closing` flag from the parent. */
export function TsModal({ code, closing, copied, onCopy, onClose }) {
  return (
    <div className={`modal-backdrop${closing ? " closing" : ""}`} onClick={onClose}>
      <div className={`modal${closing ? " closing" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <h2>Generated TypeScript</h2>
          <div className="spacer" style={{ flex: 1 }} />
          <button className="btn primary" onClick={onCopy}>{copied ? "Copied ✓" : "Copy"}</button>
          <button className="btn icon" style={{ marginLeft: 6 }} onClick={onClose}>✕</button>
        </div>
        <pre>{code}</pre>
      </div>
    </div>
  );
}
