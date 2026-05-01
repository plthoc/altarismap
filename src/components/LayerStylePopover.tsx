import type { RefObject } from "react";
import type { MapVisualStyle } from "../lib/map";

type LayerStylePopoverProps = {
  open: boolean;
  popoverRef: RefObject<HTMLDivElement | null>;
  activeStyle: MapVisualStyle;
  onSelectStyle: (style: MapVisualStyle) => void;
};

const STYLE_OPTIONS: Array<{ value: MapVisualStyle; label: string; description: string }> = [
  { value: "standard", label: "Standard", description: "Balanced streets and landmarks." },
  { value: "satellite", label: "Satellite", description: "Clean aerial imagery." },
  { value: "hybrid", label: "Hybrid", description: "Imagery with map labels." },
  { value: "dark", label: "Dark", description: "Low-glare night map." },
];

export function LayerStylePopover({
  open,
  popoverRef,
  activeStyle,
  onSelectStyle,
}: LayerStylePopoverProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      ref={popoverRef as React.RefObject<HTMLDivElement>}
      className="absolute right-0 top-[58px] z-40 w-[236px] rounded-[24px] border border-white/10 bg-[#0b0b0b]/94 p-2.5 shadow-panel backdrop-blur-panel"
      role="menu"
      aria-label="Map style options"
    >
      <div className="mb-1 px-2 py-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink-500">Map Mode</p>
      </div>

      <div className="space-y-1">
        {STYLE_OPTIONS.map((option) => {
          const selected = option.value === activeStyle;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => onSelectStyle(option.value)}
              className={[
                "flex w-full items-start justify-between rounded-[18px] border px-3 py-3 text-left transition duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                selected
                  ? "border-white/20 bg-white/[0.08] shadow-soft"
                  : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <span>
                <span className="block text-sm font-medium text-white">{option.label}</span>
                <span className="mt-1 block text-[11px] leading-4 text-ink-400">{option.description}</span>
              </span>
              <span
                className={[
                  "mt-1 h-2.5 w-2.5 rounded-full transition",
                  selected ? "bg-white" : "bg-white/15",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
