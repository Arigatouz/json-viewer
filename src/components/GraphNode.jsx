import { memo } from "react";
import { trunc } from "../lib/json.js";
import { HEAD_H, ROW_H, PAD_X, MAX_CHARS } from "../lib/layout.js";

const colorFor = (t) => `var(--t-${t === "array" || t === "object" ? "branch" : t})`;

/* One node box: a beveled clip-card silhouette with a clickable header and
   primitive rows. Memoized so panning/zooming doesn't re-render every node. */
function GraphNodeImpl({ id, node, pos: p, isCollapsed, isClosing, hit, onToggle }) {
  const hasKids = node.children.length > 0;
  const c = 10; // corner cut size
  const bevel = `M 0 0 H ${p.w} V ${p.h - c} L ${p.w - c} ${p.h} H 0 Z`;

  const activate = (ev) => { ev.stopPropagation(); if (hasKids) onToggle(id); };

  return (
    <g className="node-g" transform={`translate(${p.x},${p.y})`}>
      <g className={`node-inner${isClosing ? " closing" : ""}`}
         filter={hit ? "url(#glow-hit)" : undefined}>
        <path
          d={bevel}
          fill="var(--node-bg)"
          stroke={hit ? "var(--hit)" : "var(--line)"}
          strokeWidth={hit ? 1.6 : 1}
        />
        {/* header */}
        <g
          style={{ cursor: hasKids ? "pointer" : "default" }}
          onClick={activate}
          onPointerDown={(ev) => ev.stopPropagation()}
          role={hasKids ? "button" : undefined}
          tabIndex={hasKids ? 0 : undefined}
          aria-expanded={hasKids ? !isCollapsed : undefined}
          aria-label={hasKids ? `${node.label}, ${isCollapsed ? "collapsed" : "expanded"}` : undefined}
          onKeyDown={hasKids ? (ev) => {
            if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onToggle(id); }
          } : undefined}
        >
          <rect x={0.5} y={0.5} width={p.w - 1} height={HEAD_H} fill="var(--node-head)" />
          {hasKids && <rect width={3} height={HEAD_H + 1} fill="var(--t-branch)" />}
          <text
            x={PAD_X + (hasKids ? 3 : 0)} y={HEAD_H / 2 + 4}
            fontFamily="var(--font-data)" fontSize={11.5} fontWeight={600}
            style={{ letterSpacing: "0.02em" }}
            fill={colorFor(node.kind === "leaf" ? "key" : "object")}
          >
            {hasKids ? (isCollapsed ? "▸ " : "▾ ") : ""}
            {trunc(node.label, MAX_CHARS)}
            {isCollapsed ? `  ⋯ ${p.hiddenCount}` : ""}
          </text>
        </g>
        {/* rows */}
        {node.rows.map((r, i) => {
          const y = HEAD_H + 6 + i * ROW_H + 8;
          const keyStr = r.k === null ? "" : `${r.k}: `;
          const valStr = trunc(r.v, MAX_CHARS - keyStr.length);
          return (
            <text key={i} x={PAD_X} y={y}
              fontFamily="var(--font-data)" fontSize={11.5}>
              {keyStr && <tspan fill="var(--t-key)">{trunc(keyStr, 24)}</tspan>}
              <tspan fill={colorFor(r.t)} fontWeight={500}>{valStr}</tspan>
            </text>
          );
        })}
      </g>
    </g>
  );
}

export const GraphNode = memo(GraphNodeImpl);
