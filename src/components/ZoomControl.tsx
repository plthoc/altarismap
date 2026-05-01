import { Minus, Plus } from "lucide-react";

type ZoomControlProps = {
  disabled: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function ZoomButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "grid h-11 w-11 place-items-center text-white transition duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        disabled ? "cursor-not-allowed opacity-45" : "hover:bg-white/[0.08] active:scale-[0.98]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function ZoomControl({ disabled, onZoomIn, onZoomOut }: ZoomControlProps) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/76 shadow-panel backdrop-blur-panel">
      <ZoomButton label="Zoom in" disabled={disabled} onClick={onZoomIn}>
        <Plus className="h-5 w-5" />
      </ZoomButton>
      <div className="h-px w-full bg-white/10" aria-hidden="true" />
      <ZoomButton label="Zoom out" disabled={disabled} onClick={onZoomOut}>
        <Minus className="h-5 w-5" />
      </ZoomButton>
    </div>
  );
}
