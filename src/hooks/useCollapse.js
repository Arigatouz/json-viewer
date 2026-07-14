import { useCallback, useEffect, useRef, useState } from "react";

const CLOSE_MS = 240;

/* Owns the collapsed/closing node sets and the subtree close animation.
   `nodeById` is the id -> node map used to walk descendants. */
export function useCollapse(nodeById) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [closing, setClosing] = useState(() => new Set());
  const closeTimers = useRef({});

  // Clear any pending close timers on unmount.
  useEffect(() => () => {
    Object.values(closeTimers.current).forEach(clearTimeout);
  }, []);

  const toggle = useCallback((id) => {
    if (collapsed.has(id)) {
      setCollapsed((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      return;
    }
    // Play a close animation on the subtree before actually collapsing it.
    const desc = new Set();
    (function collect(x) {
      const node = nodeById[x];
      if (!node) return;
      for (const c of node.children) {
        desc.add(c);
        collect(c);
      }
    })(id);
    setClosing((s) => new Set([...s, ...desc]));
    clearTimeout(closeTimers.current[id]);
    closeTimers.current[id] = setTimeout(() => {
      setCollapsed((s) => new Set(s).add(id));
      setClosing((s) => {
        const n = new Set(s);
        desc.forEach((d) => n.delete(d));
        return n;
      });
      delete closeTimers.current[id];
    }, CLOSE_MS);
  }, [collapsed, nodeById]);

  const expandAll = useCallback(() => {
    Object.values(closeTimers.current).forEach(clearTimeout);
    closeTimers.current = {};
    setClosing(new Set());
    setCollapsed(new Set());
  }, []);

  return { collapsed, closing, toggle, expandAll };
}
