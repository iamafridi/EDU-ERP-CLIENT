import { useEffect } from "react";

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
};

export function useKeyboardShortcut(
  combo: KeyCombo | string,
  callback: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      const spec = typeof combo === "string" ? { key: combo } : combo;
      const match =
        e.key.toLowerCase() === spec.key.toLowerCase() &&
        !!e.ctrlKey === !!spec.ctrl &&
        !!e.metaKey === !!spec.meta &&
        !!e.shiftKey === !!spec.shift;

      if (match) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [combo, callback, enabled]);
}
