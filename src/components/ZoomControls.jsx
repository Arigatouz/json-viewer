export function ZoomControls({ onZoomIn, onZoomOut, onFit }) {
  return (
    <div className="zoomctl">
      <button className="btn icon" onClick={onZoomIn} aria-label="Zoom in">＋</button>
      <button className="btn icon" onClick={onZoomOut} aria-label="Zoom out">－</button>
      <button className="btn icon" onClick={onFit} aria-label="Fit view">⤢</button>
    </div>
  );
}
