import mapboxgl from "mapbox-gl";

export type AnyMapInstance = mapboxgl.Map;
type StyleSpecification = ReturnType<mapboxgl.Map["getStyle"]>;
export type MapVisualStyle = "standard" | "satellite" | "hybrid" | "dark";

export const INITIAL_VIEW = {
  center: [3.5, 39.8] as [number, number],
  zoom: 4.2,
  bearing: 0,
  pitch: 0,
};

const MAPBOX_STYLE_IDS: Record<MapVisualStyle, string> = {
  standard: "streets-v12",
  satellite: "satellite-v9",
  hybrid: "satellite-streets-v12",
  dark: "dark-v11",
};

function getMapboxStyle(token: string, style: MapVisualStyle): string {
  return `https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE_IDS[style]}?access_token=${token}`;
}

export function isDarkStyle(style: MapVisualStyle): boolean {
  return style === "dark";
}

export function getStyleUrl(style: MapVisualStyle, token: string): string {
  return getMapboxStyle(token, style);
}

export function createMap(
  container: HTMLElement,
  token: string,
  style: MapVisualStyle,
): AnyMapInstance {
  mapboxgl.accessToken = token;
  mapboxgl.prewarm();
  const map = new mapboxgl.Map({
    container,
    style: getStyleUrl(style, token),
    center: INITIAL_VIEW.center,
    zoom: INITIAL_VIEW.zoom,
    bearing: INITIAL_VIEW.bearing,
    pitch: INITIAL_VIEW.pitch,
    attributionControl: false,
    antialias: true,
    fadeDuration: 150,
    pitchWithRotate: false,
  });

  map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
  return map;
}

export function setMapStyle(map: AnyMapInstance, style: MapVisualStyle, token: string) {
  map.setStyle(getStyleUrl(style, token));
}

function getLayerIds(map: AnyMapInstance): string[] {
  const style = map.getStyle() as StyleSpecification | undefined;
  return style?.layers?.map((layer) => layer.id) ?? [];
}

export function updateLabelVisibility(map: AnyMapInstance, showLabels: boolean) {
  const ids = getLayerIds(map);

  ids.forEach((layerId) => {
    const layer = map.getLayer(layerId);
    if (!layer || layer.type !== "symbol") {
      return;
    }

    try {
      map.setLayoutProperty(layerId, "visibility", showLabels ? "visible" : "none");
    } catch {
      // Some styles do not expose symbol layers uniformly.
    }
  });
}

export function tuneMapPaint(map: AnyMapInstance, dark: boolean) {
  const ids = getLayerIds(map);

  ids.forEach((layerId) => {
    const layer = map.getLayer(layerId);
    if (!layer) {
      return;
    }

    if (layer.type === "symbol") {
      try {
        map.setPaintProperty(layerId, "text-color", dark ? "#9b9b9b" : "#4c4c4c");
        map.setPaintProperty(layerId, "text-halo-color", dark ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.85)");
        map.setPaintProperty(layerId, "text-halo-width", dark ? 1.1 : 0.8);
      } catch {
        // Ignore unsupported layer paint overrides.
      }
    }

    if (layer.type === "line") {
      try {
        map.setPaintProperty(layerId, "line-color", dark ? "rgba(150,150,150,0.28)" : "rgba(90,90,90,0.25)");
      } catch {
        // Ignore unsupported line overrides.
      }
    }
  });
}

export function setMapStyleAndPaint(map: AnyMapInstance, style: MapVisualStyle, showLabels: boolean, token: string) {
  setMapStyle(map, style, token);
  const dark = isDarkStyle(style);

  onceMapEvent(map, "styledata", () => {
    tuneMapPaint(map, dark);
    updateLabelVisibility(map, showLabels);
  });
}

export function resetView(map: AnyMapInstance) {
  map.flyTo({
    center: INITIAL_VIEW.center,
    zoom: INITIAL_VIEW.zoom,
    bearing: INITIAL_VIEW.bearing,
    pitch: INITIAL_VIEW.pitch,
    duration: 1400,
    essential: true,
  });
}

export function flyToBarcelona(map: AnyMapInstance) {
  map.flyTo({
    center: [2.154007, 41.390205],
    zoom: 11.7,
    bearing: -7,
    pitch: 24,
    duration: 1800,
    essential: true,
  });
}

export function flyToSearchResult(map: AnyMapInstance, result: { center?: [number, number]; bbox?: [number, number, number, number] }) {
  if (result.bbox) {
    map.fitBounds(
      [
        [result.bbox[0], result.bbox[1]],
        [result.bbox[2], result.bbox[3]],
      ],
      {
        padding: { top: 120, right: 120, bottom: 140, left: 120 },
        duration: 1600,
        essential: true,
      },
    );
    return;
  }

  if (result.center) {
    map.flyTo({
      center: result.center,
      zoom: 13.8,
      speed: 0.85,
      curve: 1.28,
      duration: 1600,
      essential: true,
    });
  }
}

export function zoomMapIn(map: AnyMapInstance) {
  map.zoomIn({ duration: 300 });
}

export function zoomMapOut(map: AnyMapInstance) {
  map.zoomOut({ duration: 300 });
}

export function resetMapBearing(map: AnyMapInstance) {
  map.easeTo({
    bearing: 0,
    duration: 700,
    essential: true,
  });
}

export function flyToUserLocation(map: AnyMapInstance, center: [number, number]) {
  map.flyTo({
    center,
    zoom: Math.max(map.getZoom(), 14.8),
    duration: 1500,
    curve: 1.2,
    essential: true,
  });
}

export function onceMapEvent(map: AnyMapInstance, event: "load" | "styledata", handler: () => void) {
  (map as { once: (eventName: "load" | "styledata", callback: () => void) => void }).once(event, handler);
}
