import { useEffect } from "react";

export function useClickOutside(
  refs: Array<React.RefObject<HTMLElement | null>>,
  enabled: boolean,
  onOutside: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      const isInside = refs.some((ref) => {
        const current = ref.current;
        return current ? current.contains(target) : false;
      });

      if (!isInside) {
        onOutside(event);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [enabled, onOutside, refs]);
}
