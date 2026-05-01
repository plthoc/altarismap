import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapControls } from "../components/MapControls";
import { SearchOverlay } from "../components/SearchOverlay";
import type { SearchResult } from "../components/SearchResultRow";
import { SettingsPopover } from "../components/SettingsPopover";
import { Sidebar } from "../components/Sidebar";
import { useClickOutside } from "../hooks/useClickOutside";
import {
  createMap,
  flyToSearchResult,
  isDarkStyle,
  onceMapEvent,
  resetView,
  setMapStyle,
  tuneMapPaint,
  updateLabelVisibility,
  type AnyMapInstance,
  type MapVisualStyle,
} from "../lib/map";

type SelectedLocation = {
  label: string;
  subtitle?: string;
};

export function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<AnyMapInstance | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsPopoverRef = useRef<HTMLDivElement | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mapStyle, setMapStyleChoice] = useState<MapVisualStyle>("dark");
  const [showLabels, setShowLabels] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    label: "Western Europe",
    subtitle: "Portugal, Spain, France, Italy, North Africa",
  });
  const [mapReady, setMapReady] = useState(false);
  const [pageBooted, setPageBooted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const skipNextStyleSyncRef = useRef(true);

  const mapToken = useMemo(() => import.meta.env.VITE_MAPBOX_TOKEN?.trim() || "", []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPageBooted(true);
    }, 850);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = createMap(mapContainerRef.current, mapToken, mapStyle);
    mapRef.current = map;

    const handleLoad = () => {
      tuneMapPaint(map, isDarkStyle(mapStyle));
      updateLabelVisibility(map, showLabels);
      setMapReady(true);
    };

    onceMapEvent(map, "load", handleLoad);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapStyle, mapToken, showLabels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (skipNextStyleSyncRef.current) {
      skipNextStyleSyncRef.current = false;
      return;
    }

    setMapStyle(map, mapStyle, mapToken);
    setMapReady(false);

    const onStyleData = () => {
      tuneMapPaint(map, isDarkStyle(mapStyle));
      updateLabelVisibility(map, showLabels);
      setMapReady(true);
    };

    onceMapEvent(map, "styledata", onStyleData);
  }, [mapStyle, mapToken, showLabels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    updateLabelVisibility(map, showLabels);
  }, [mapReady, showLabels]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      resetView(mapRef.current);
    }

    setSelectedLocation({
      label: "Western Europe",
      subtitle: "Portugal, Spain, France, Italy, North Africa",
    });
    setSettingsOpen(false);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  useClickOutside([searchPanelRef, searchButtonRef], searchOpen, () => {
    setSearchOpen(false);
  });

  useClickOutside([settingsPopoverRef, settingsButtonRef], settingsOpen, () => {
    setSettingsOpen(false);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (searchOpen) {
        setSearchOpen(false);
      }

      if (settingsOpen) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen, settingsOpen]);

  const handleToggleSearch = () => {
    setSearchOpen((current) => {
      const next = !current;
      if (next) {
        setSettingsOpen(false);
      }
      return next;
    });
  };

  const handleToggleSettings = () => {
    setSettingsOpen((current) => {
      const next = !current;
      if (next) {
        setSearchOpen(false);
      }
      return next;
    });
  };

  const handleSelectResult = (result: SearchResult) => {
    setSelectedLocation({
      label: result.title,
      subtitle: result.subtitle,
    });

    if (mapRef.current) {
      flyToSearchResult(mapRef.current, result);
    }

    setSearchOpen(false);
  };

  return (
    <main className="map-shell relative h-screen w-screen overflow-hidden bg-[#171717] text-white">
      <div ref={mapContainerRef} className="absolute inset-0" aria-label="Interactive dark map" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-none border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.035),transparent_22%),linear-gradient(180deg,rgba(2,2,2,0.18),rgba(2,2,2,0.34)_100%),radial-gradient(circle_at_20%_50%,rgba(0,0,0,0.18),transparent_32%),radial-gradient(circle_at_80%_40%,rgba(0,0,0,0.18),transparent_30%)] sm:border-white/12"
      />

      <div className="pointer-events-none absolute inset-0 z-20 rounded-none shadow-[inset_0_0_180px_rgba(0,0,0,0.36)]" />

      <div className="pointer-events-none absolute left-1/2 bottom-[34px] z-20 hidden -translate-x-1/2 rounded-[24px] border border-white/10 bg-black/72 px-4 py-3 shadow-panel backdrop-blur-panel sm:block">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-400">Selected</p>
        <p className="mt-1 text-sm font-medium text-white">{selectedLocation.label}</p>
        {selectedLocation.subtitle ? (
          <p className="mt-1 max-w-[240px] text-xs text-ink-300">{selectedLocation.subtitle}</p>
        ) : null}
      </div>

      <MapControls
        map={mapRef.current}
        mapReady={mapReady}
        activeStyle={mapStyle}
        onStyleChange={setMapStyleChoice}
        onLocateUnavailable={() => setToastMessage("Location access is unavailable.")}
      />

      <Sidebar
        searchOpen={searchOpen}
        settingsOpen={settingsOpen}
        onToggleSearch={handleToggleSearch}
        onToggleSettings={handleToggleSettings}
        onResetView={handleResetView}
        searchButtonRef={searchButtonRef}
        settingsButtonRef={settingsButtonRef}
      />

      <SearchOverlay
        open={searchOpen}
        panelRef={searchPanelRef}
        inputRef={searchInputRef}
        mapToken={mapToken}
        query={query}
        onQueryChange={setQuery}
        onClose={closeSearch}
        onSelectResult={handleSelectResult}
      />

      <SettingsPopover
        open={settingsOpen}
        anchorRef={settingsButtonRef}
        popoverRef={settingsPopoverRef}
        darkMapStyle={isDarkStyle(mapStyle)}
        showLabels={showLabels}
        onToggleDarkMapStyle={() => setMapStyleChoice((current) => (current === "dark" ? "standard" : "dark"))}
        onToggleShowLabels={() => setShowLabels((current) => !current)}
        onResetView={handleResetView}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-6 pt-8">
        <div className="rounded-full border border-white/10 bg-black/70 px-4 py-2 shadow-soft backdrop-blur-panel">
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
            Mapbox active
          </p>
        </div>
      </div>

      <div
        className={[
          "pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2 transition duration-300",
          toastMessage ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
        aria-live="polite"
      >
        <div className="rounded-full border border-white/10 bg-black/82 px-4 py-2 text-sm text-white shadow-panel backdrop-blur-panel">
          {toastMessage}
        </div>
      </div>

      <div
        className={[
          "pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-[#090909] transition duration-500",
          pageBooted && mapReady ? "opacity-0" : "opacity-100",
        ].join(" ")}
        aria-hidden={pageBooted && mapReady}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-panel">
            <p className="text-[11px] uppercase tracking-[0.32em] text-ink-300">Altaris Map</p>
          </div>
          <div className="h-[3px] w-[120px] overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full origin-left animate-loader-sweep bg-white/70" />
          </div>
        </div>
      </div>
    </main>
  );
}
