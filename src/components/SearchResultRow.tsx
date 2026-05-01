import type { KeyboardEventHandler, MouseEventHandler } from "react";

export type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  category: "place" | "suggested";
  center?: [number, number];
  bbox?: [number, number, number, number];
};

type SearchResultRowProps = {
  result: SearchResult;
  highlighted: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onMouseEnter: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
};

export function SearchResultRow({
  result,
  highlighted,
  onClick,
  onMouseEnter,
  onKeyDown,
}: SearchResultRowProps) {
  const isSuggested = result.category === "suggested";

  return (
    <button
      type="button"
      role="option"
      aria-selected={highlighted}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onKeyDown={onKeyDown}
      className={[
        "group flex w-full items-start justify-between gap-3 rounded-[20px] border text-left transition duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        isSuggested
          ? "min-h-[58px] flex-row items-center border-white/8 bg-white/[0.045] px-4 py-3"
          : "min-h-[64px] flex-row items-center border-white/8 bg-white/[0.03] px-4 py-3.5",
        highlighted
          ? "border-white/20 bg-white/[0.09] shadow-soft"
          : "hover:border-white/12 hover:bg-white/[0.07]",
      ].join(" ")}
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium leading-5 text-white">{result.title}</span>
        {result.subtitle ? (
          <span className="mt-1 block truncate text-[11px] font-medium leading-[14px] text-ink-400">{result.subtitle}</span>
        ) : null}
      </span>
      <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-400">
        {isSuggested ? "Quick" : "Place"}
      </span>
    </button>
  );
}
