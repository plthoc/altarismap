import type { RefObject } from "react";
import { RotateCcw } from "lucide-react";

type SettingsPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  darkMapStyle: boolean;
  showLabels: boolean;
  onToggleDarkMapStyle: () => void;
  onToggleShowLabels: () => void;
  onResetView: () => void;
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs leading-4 text-ink-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={[
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          checked ? "border-white/30 bg-white/20" : "border-white/10 bg-white/5",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </label>
  );
}

export function SettingsPopover({
  open,
  anchorRef,
  popoverRef,
  darkMapStyle,
  showLabels,
  onToggleDarkMapStyle,
  onToggleShowLabels,
  onResetView,
}: SettingsPopoverProps) {
  if (!open) {
    return null;
  }

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const desiredTop = (anchorRect?.top ?? 120) + 8;
  const desiredLeft = (anchorRect?.right ?? 96) + 12;
  const top = Math.min(desiredTop, window.innerHeight - 252);
  const left = Math.min(desiredLeft, window.innerWidth - 296);

  return (
    <div
      ref={popoverRef as React.RefObject<HTMLDivElement>}
      className="absolute z-40 w-[292px] animate-panel-in rounded-[28px] border border-white/10 bg-[#0b0b0b]/95 p-3 shadow-panel backdrop-blur-panel"
      style={{ top, left }}
      role="dialog"
      aria-label="Map settings"
    >
      <div className="mb-3 px-1">
        <p className="text-sm font-semibold text-white">Map settings</p>
        <p className="mt-1 text-xs text-ink-400">Adjust the visual treatment and camera behavior.</p>
      </div>

      <div className="space-y-2">
        <ToggleRow
          label="Dark map style"
          description="Switch between the moody dark map and a lighter neutral style."
          checked={darkMapStyle}
          onChange={onToggleDarkMapStyle}
        />
        <ToggleRow
          label="Show labels"
          description="Toggle place names and map text while keeping the map interactive."
          checked={showLabels}
          onChange={onToggleShowLabels}
        />
        <button
          type="button"
          onClick={onResetView}
          className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <div>
            <p className="text-sm font-medium text-white">Reset map view</p>
            <p className="mt-1 text-xs leading-4 text-ink-400">Return to the original western Europe framing.</p>
          </div>
          <RotateCcw className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
