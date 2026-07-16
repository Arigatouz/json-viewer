import { memo } from "react";

/* One bezier edge between two node boxes. Memoized: during a pan only the
   parent <g> transform changes, so edges skip re-rendering. */
function GraphEdgeImpl({ a, b, closing, k }) {
  const x1 = a.x + a.w, y1 = a.y + a.h / 2;
  const x2 = b.x, y2 = b.y + b.h / 2;
  const dx = Math.max(30, (x2 - x1) / 2);
  return (
    <path
      className={`edge-path${closing ? " closing" : ""}`}
      d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
      fill="none"
      stroke="var(--line)"
      strokeWidth={1.6 / k < 1 ? 1 : 1.6}
    />
  );
}

export const GraphEdge = memo(GraphEdgeImpl);
