import { useMemo, useRef } from "react";
import { parseInput } from "../lib/json.js";

/* Derive the parsed value from raw text during render (no effect-driven state
   sync). On a parse error we keep the last successfully parsed value so the
   graph stays put while the editor shows the error. */
export function useParsedInput(text) {
  const lastGood = useRef(null);
  return useMemo(() => {
    try {
      const { value, kind } = parseInput(text);
      lastGood.current = { value, kind };
      return { parsed: value, kind, error: null };
    } catch (e) {
      const prev = lastGood.current;
      return { parsed: prev ? prev.value : null, kind: prev ? prev.kind : "json", error: e.message };
    }
  }, [text]);
}
