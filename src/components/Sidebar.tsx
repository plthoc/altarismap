import { Compass, Search, Settings2 } from "lucide-react";
import type { ReactNode, RefObject } from "react";

type SidebarProps = {
  searchOpen: boolean;
  settingsOpen: boolean;
  onToggleSearch: () => void;
  onToggleSettings: () => void;
  onResetView: () => void;
  searchButtonRef: RefObject<HTMLButtonElement | null>;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
};

function LogoMark() {
  return (
    <svg viewBox="0 0 67 48" className="h-6 w-[34px]" aria-hidden="true">
      <path
        d="M0 6.964V0H67V6.964H38.789L51.168 36V15.189H67V48H51.168L38.308 47.986L27.43 24.737L22.525 37.111L18.154 47.986H1.787L12.342 20.676L17.979 6.964H0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SidebarButton({
  active,
  label,
  onClick,
  children,
  buttonRef,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement> | undefined}
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "grid h-12 w-12 place-items-center rounded-xl border border-transparent text-white transition duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        active
          ? "bg-[#232323] shadow-soft"
          : "bg-transparent hover:border-white/10 hover:bg-white/[0.06]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function Sidebar({
  searchOpen,
  settingsOpen,
  onToggleSearch,
  onToggleSettings,
  onResetView,
  searchButtonRef,
  settingsButtonRef,
}: SidebarProps) {
  return (
    <aside className="pointer-events-auto absolute left-4 top-4 bottom-4 z-30 w-16 rounded-[28px] border border-white/10 bg-black/76 p-3 shadow-panel backdrop-blur-xl sm:left-6 sm:top-6 sm:bottom-6 sm:w-[72px] sm:p-4">
      <div className="flex h-full flex-col items-center">
        <button
          type="button"
          aria-label="Reset map view"
          onClick={onResetView}
          className="grid h-12 w-12 place-items-center rounded-xl text-white transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <LogoMark />
        </button>

        <div className="mt-4 h-px w-10 bg-white/10 sm:w-11" aria-hidden="true" />

        <div className="mt-4 flex flex-col gap-2">
          <SidebarButton
            active={searchOpen}
            label="Toggle search"
            onClick={onToggleSearch}
            buttonRef={searchButtonRef}
          >
            <Search className="h-6 w-6 stroke-[2px]" />
          </SidebarButton>

          <SidebarButton
            active={settingsOpen}
            label="Toggle settings"
            onClick={onToggleSettings}
            buttonRef={settingsButtonRef}
          >
            <Settings2 className="h-6 w-6 stroke-[2px]" />
          </SidebarButton>

          <SidebarButton active={false} label="Reset camera" onClick={onResetView}>
            <Compass className="h-6 w-6 stroke-[2px]" />
          </SidebarButton>
        </div>
      </div>
    </aside>
  );
}
