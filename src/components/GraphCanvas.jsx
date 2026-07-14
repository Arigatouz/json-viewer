import { useMemo } from "react";
import { GraphEdge } from "./GraphEdge.jsx";
import { GraphNode } from "./GraphNode.jsx";
import { Toolbar } from "./Toolbar.jsx";
import { Legend } from "./Legend.jsx";
import { ZoomControls } from "./ZoomControls.jsx";

/* The pan/zoom SVG surface plus its floating overlays. Edge and node layers
   are memoized against `view` so a pan only re-applies the group transform. */
export function GraphCanvas({
  laid, collapsed, closing, matches, onToggle,
  view, panHandlers, svgRef, wrapRef,
  query, onQueryChange, onExpandAll, onZoomIn, onZoomOut, onFit,
}) {
  const edges = useMemo(
    () => laid.visibleEdges.map((e) => (
      <GraphEdge
        key={`${e.from}-${e.to}`}
        a={laid.pos[e.from]}
        b={laid.pos[e.to]}
        closing={closing.has(e.to)}
        k={view.k}
      />
    )),
    [laid, closing, view.k]
  );

  const nodes = useMemo(
    () => Object.entries(laid.pos).map(([id, p]) => (
      <GraphNode
        key={id}
        id={id}
        node={laid.byId[id]}
        pos={p}
        isCollapsed={collapsed.has(id)}
        isClosing={closing.has(id)}
        hit={matches.has(id)}
        onToggle={onToggle}
      />
    )),
    [laid, collapsed, closing, matches, onToggle]
  );

  return (
    <div className="canvas-wrap" ref={wrapRef}>
      <svg ref={svgRef} {...panHandlers}>
        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          <defs>
            <filter id="glow-hit" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--hit)" floodOpacity="0.7" />
            </filter>
          </defs>
          {edges}
          {nodes}
        </g>
      </svg>

      <Toolbar query={query} onQueryChange={onQueryChange} onExpandAll={onExpandAll} />
      <Legend />
      <ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFit={onFit} />
    </div>
  );
}
