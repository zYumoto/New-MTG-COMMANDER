// client/src/hooks/useDisableZoom.js
import { useEffect } from "react";

export default function useDisableZoom() {
  useEffect(() => {
    function onKeyDown(e) {
      const key = String(e.key || "").toLowerCase();
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (!ctrlOrCmd) return;

      // Ctrl + / Ctrl - / Ctrl =
      if (key === "+" || key === "-" || key === "=") {
        e.preventDefault();
      }
    }

    function onWheel(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    }

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);
}
