import { useCallback, useEffect, useRef, useState } from "react";

const clampK = (k) => Math.min(3, Math.max(0.15, k));

/* Owns pan/zoom viewport state and the interactions that drive it:
   wheel-to-zoom, drag-to-pan, zoom buttons, and fit-to-content. */
export function useViewport({ svgRef, wrapRef, bbox }) {
  const [view, setView] = useState({ x: 60, y: 60, k: 1 });
  const drag = useRef(null);

  const fit = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const { minX, minY, maxX, maxY } = bbox;
    const bw = maxX - minX + 80, bh = maxY - minY + 80;
    const k = Math.min(width / bw, height / bh, 1.4);
    setView({
      k,
      x: (width - (maxX - minX) * k) / 2 - minX * k,
      y: (height - (maxY - minY) * k) / 2 - minY * k,
    });
  }, [wrapRef, bbox]);

  // Native wheel listener so we can call preventDefault (React's onWheel is passive).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      setView((v) => {
        const k = clampK(v.k * Math.exp(-e.deltaY * 0.0012));
        return { k, x: mx - ((mx - v.x) / v.k) * k, y: my - ((my - v.y) / v.k) * k };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [svgRef]);

  const onPointerDown = useCallback((e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    e.currentTarget.classList.add("panning");
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [view.x, view.y]);

  const onPointerMove = useCallback((e) => {
    if (!drag.current) return;
    const { sx, sy, ox, oy } = drag.current;
    setView((v) => ({ ...v, x: ox + e.clientX - sx, y: oy + e.clientY - sy }));
  }, []);

  const onPointerUp = useCallback((e) => {
    drag.current = null;
    e.currentTarget.classList.remove("panning");
  }, []);

  const zoom = useCallback((f) => setView((v) => ({ ...v, k: clampK(v.k * f) })), []);

  return { view, fit, zoom, panHandlers: { onPointerDown, onPointerMove, onPointerUp } };
}
