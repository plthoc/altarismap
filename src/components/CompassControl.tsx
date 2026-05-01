type CompassControlProps = {
  bearing: number;
  disabled: boolean;
  onResetNorth: () => void;
};

function getCardinalLabel(bearing: number) {
  const normalized = ((bearing % 360) + 360) % 360;
  if (normalized >= 45 && normalized < 135) {
    return "E";
  }
  if (normalized >= 135 && normalized < 225) {
    return "S";
  }
  if (normalized >= 225 && normalized < 315) {
    return "W";
  }
  return "N";
}

export function CompassControl({ bearing, disabled, onResetNorth }: CompassControlProps) {
  const cardinal = getCardinalLabel(bearing);

  return (
    <button
      type="button"
      aria-label="Reset map orientation to north"
      disabled={disabled}
      onClick={onResetNorth}
      className={[
        "grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-black/76 text-white shadow-panel backdrop-blur-panel transition duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        disabled
          ? "cursor-not-allowed opacity-45"
          : "hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]",
      ].join(" ")}
    >
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div
          className="absolute inset-[7px] transition-transform duration-300"
          style={{ transform: `rotate(${bearing}deg)` }}
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-0 h-4 w-[2px] -translate-x-1/2 rounded-full bg-white" />
          <div className="absolute bottom-[2px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[9px] border-l-transparent border-r-transparent border-t-white/20" />
        </div>
        <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold tracking-[0.18em] text-ink-300">
          {cardinal}
        </div>
      </div>
    </button>
  );
}
