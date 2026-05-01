import { LocateFixed } from "lucide-react";

type LocateUserButtonProps = {
  disabled: boolean;
  locating: boolean;
  onLocate: () => void;
};

export function LocateUserButton({ disabled, locating, onLocate }: LocateUserButtonProps) {
  return (
    <button
      type="button"
      aria-label="Locate my position"
      disabled={disabled}
      onClick={onLocate}
      className={[
        "grid h-11 w-11 place-items-center rounded-[18px] border border-white/10 bg-black/76 text-white shadow-panel backdrop-blur-panel transition duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        disabled
          ? "cursor-not-allowed opacity-45"
          : "hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]",
      ].join(" ")}
    >
      <LocateFixed
        className={[
          "h-5 w-5 transition",
          locating ? "scale-110 text-white" : "text-ink-300",
        ].join(" ")}
      />
    </button>
  );
}
