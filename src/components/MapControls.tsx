import mapboxgl from "mapbox-gl";
import { Layers3 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import {
  flyToUserLocation,
  resetMapBearing,
  zoomMapIn,
  zoomMapOut,
  type AnyMapInstance,
  type MapVisualStyle,
} from "../lib/map";
import { CompassControl } from "./CompassControl";
import { LayerStylePopover } from "./LayerStylePopover";
import { LocateUserButton } from "./LocateUserButton";
import { ZoomControl } from "./ZoomControl";

type MapControlsProps = {
  map: AnyMapInstance | null;
  mapReady: boolean;
  activeStyle: MapVisualStyle;
  onStyleChange: (style: MapVisualStyle) => void;
  onLocateUnavailable: () => void;
};

function createUserLocationElement() {
  const marker = document.createElement("div");
  marker.className = "user-location-marker";
  marker.style.width = "26px";
  marker.style.height = "26px";
  marker.style.position = "relative";
  marker.style.transformOrigin = "50% 50%";

  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.inset = "0";
  pulse.style.borderRadius = "999px";
  pulse.style.background = "rgba(255,255,255,0.16)";
  pulse.style.border = "1px solid rgba(255,255,255,0.22)";

  const core = document.createElement("div");
  core.style.position = "absolute";
  core.style.left = "50%";
  core.style.top = "50%";
  core.style.width = "10px";
  core.style.height = "10px";
  core.style.borderRadius = "999px";
  core.style.background = "#ffffff";
  core.style.transform = "translate(-50%, -50%)";
  core.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.18)";

  const heading = document.createElement("div");
  heading.style.position = "absolute";
  heading.style.left = "50%";
  heading.style.top = "-1px";
  heading.style.width = "0";
  heading.style.height = "0";
  heading.style.transform = "translateX(-50%)";
  heading.style.borderLeft = "5px solid transparent";
  heading.style.borderRight = "5px solid transparent";
  heading.style.borderBottom = "10px solid rgba(255,255,255,0.9)";

  marker.append(pulse, core, heading);
  return { marker, heading };
}

export function MapControls({
  map,
  mapReady,
  activeStyle,
  onStyleChange,
  onLocateUnavailable,
}: MapControlsProps) {
  const styleButtonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerArrowRef = useRef<HTMLDivElement | null>(null);
  const [styleOpen, setStyleOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [bearing, setBearing] = useState(0);

  const disabled = !mapReady || !map;

  useClickOutside([styleButtonRef, popoverRef], styleOpen, () => {
    setStyleOpen(false);
  });

  useEffect(() => {
    if (!styleOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStyleOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [styleOpen]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const syncBearing = () => {
      setBearing(map.getBearing());
    };

    syncBearing();
    map.on("rotate", syncBearing);
    return () => {
      map.off("rotate", syncBearing);
    };
  }, [map]);

  useEffect(() => {
    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      userMarkerArrowRef.current = null;
    };
  }, []);

  const handleLocate = useCallback(() => {
    if (!map || !mapReady || !navigator.geolocation) {
      onLocateUnavailable();
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center: [number, number] = [position.coords.longitude, position.coords.latitude];
        const { marker, heading } = createUserLocationElement();

        if (typeof position.coords.heading === "number" && !Number.isNaN(position.coords.heading)) {
          heading.style.transform = `translateX(-50%) rotate(${position.coords.heading}deg)`;
        }

        if (!userMarkerRef.current) {
          userMarkerRef.current = new mapboxgl.Marker({
            element: marker,
            rotationAlignment: "map",
            pitchAlignment: "map",
          })
            .setLngLat(center)
            .addTo(map);
        } else {
          userMarkerRef.current.setLngLat(center);
          userMarkerRef.current.getElement().replaceChildren(...Array.from(marker.childNodes));
        }

        userMarkerArrowRef.current = heading;
        flyToUserLocation(map, center);
        setLocating(false);
      },
      () => {
        setLocating(false);
        onLocateUnavailable();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 20_000,
        timeout: 10_000,
      },
    );
  }, [map, mapReady, onLocateUnavailable]);

  const topGroupClasses = "overflow-visible rounded-[22px] border border-white/10 bg-black/76 p-1.5 shadow-panel backdrop-blur-panel";

  return (
    <>
      <div className="absolute right-4 top-4 z-30 flex flex-col gap-3 sm:right-6 sm:top-6">
        <div className={topGroupClasses}>
          <div className="relative flex flex-col gap-1">
            <button
              ref={styleButtonRef}
              type="button"
              aria-label="Open map style menu"
              aria-expanded={styleOpen}
              aria-haspopup="menu"
              onClick={() => setStyleOpen((current) => !current)}
              className={[
                "grid h-11 w-11 place-items-center rounded-[18px] border border-transparent text-white transition duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                styleOpen
                  ? "bg-white/[0.08] border-white/15"
                  : "hover:bg-white/[0.08] hover:border-white/10 active:scale-[0.98]",
              ].join(" ")}
            >
              <Layers3 className="h-5 w-5" />
            </button>

            <LocateUserButton disabled={disabled} locating={locating} onLocate={handleLocate} />

            <LayerStylePopover
              open={styleOpen}
              popoverRef={popoverRef}
              activeStyle={activeStyle}
              onSelectStyle={(style) => {
                onStyleChange(style);
                setStyleOpen(false);
              }}
            />
          </div>
        </div>

        <CompassControl disabled={disabled} bearing={bearing} onResetNorth={() => map && resetMapBearing(map)} />
      </div>

      <div className="absolute bottom-[34px] right-4 z-30 sm:right-6">
        <ZoomControl
          disabled={disabled}
          onZoomIn={() => map && zoomMapIn(map)}
          onZoomOut={() => map && zoomMapOut(map)}
        />
      </div>
    </>
  );
}
