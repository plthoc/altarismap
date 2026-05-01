import { LoaderCircle, Search } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { SearchResultRow, type SearchResult } from "./SearchResultRow";

type SearchOverlayProps = {
  open: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  mapToken: string;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
};

const SUGGESTED_RESULTS: SearchResult[] = [
  {
    id: "barcelona",
    title: "Barcelona",
    subtitle: "Catalonia, Spain",
    category: "suggested",
    center: [2.1734, 41.3851],
  },
  {
    id: "madrid",
    title: "Madrid",
    subtitle: "Community of Madrid, Spain",
    category: "suggested",
    center: [-3.7038, 40.4168],
  },
  {
    id: "paris",
    title: "Paris",
    subtitle: "Ile-de-France, France",
    category: "suggested",
    center: [2.3522, 48.8566],
  },
];

type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  bbox?: [number, number, number, number];
};

export function SearchOverlay({
  open,
  panelRef,
  inputRef,
  mapToken,
  query,
  onQueryChange,
  onClose,
  onSelectResult,
}: SearchOverlayProps) {
  const [results, setResults] = useState<SearchResult[]>(SUGGESTED_RESULTS);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const normalizedQuery = query.trim();

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();
  }, [inputRef, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (normalizedQuery.length < 2) {
      setResults(SUGGESTED_RESULTS);
      setSearching(false);
      setSearchError(null);
      return;
    }

    if (!mapToken) {
      setSearching(false);
      setResults([]);
      setSearchError("Search is unavailable until the Mapbox token is configured.");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(null);

      try {
        const encodedQuery = encodeURIComponent(normalizedQuery);
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json` +
          `?access_token=${encodeURIComponent(mapToken)}` +
          "&autocomplete=true&limit=7&language=en&types=country,region,postcode,district,place,locality,neighborhood,address,poi";

        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }

        const data = (await response.json()) as { features?: MapboxFeature[] };
        const nextResults =
          data.features?.map((feature) => ({
            id: feature.id,
            title: feature.text,
            subtitle: feature.place_name,
            category: "place" as const,
            center: feature.center,
            bbox: feature.bbox,
          })) ?? [];

        setResults(nextResults);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setSearchError("Search is temporarily unavailable.");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [mapToken, normalizedQuery, open]);

  if (!open) {
    return null;
  }

  const selectAtIndex = (index: number) => {
    const result = results[index];
    if (!result) {
      return;
    }

    onSelectResult(result);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center bg-[linear-gradient(180deg,rgba(5,5,5,0.28),rgba(5,5,5,0.12)_24%,rgba(5,5,5,0))] px-4 pt-20 sm:px-6 sm:pt-24">
      <section
        ref={panelRef as React.RefObject<HTMLDivElement>}
        className="pointer-events-auto w-full max-w-[680px] animate-panel-in"
        aria-label="Search overlay"
      >
        <div className="rounded-[30px] border border-white/12 bg-[#0e0e0e]/96 px-5 shadow-panel backdrop-blur-panel">
          <div className="flex h-[72px] items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-white/8 bg-white/[0.03]">
              <Search className="h-5 w-5 text-ink-400" aria-hidden="true" />
            </div>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              aria-label="Search"
              placeholder="Search for any place"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  onClose();
                  return;
                }

                if (results.length === 0) {
                  return;
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setHighlightedIndex((current) => (current + 1) % results.length);
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHighlightedIndex((current) => (current - 1 + results.length) % results.length);
                }

                if (event.key === "Enter") {
                  event.preventDefault();
                  selectAtIndex(highlightedIndex);
                }
              }}
              className="h-full w-full border-0 bg-transparent text-[21px] font-medium leading-[28px] text-white outline-none placeholder:text-ink-500 sm:text-[24px] sm:leading-[32px]"
            />
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              {searching ? <LoaderCircle className="h-4.5 w-4.5 animate-spin text-ink-400" aria-hidden="true" /> : null}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-[30px] border border-white/10 bg-[#0e0e0e]/90 p-4 shadow-panel backdrop-blur-panel">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium leading-4 text-ink-500">
              {normalizedQuery.length >= 2 ? "Search results" : "Suggested places"}
            </p>
            {normalizedQuery.length >= 2 ? (
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-500">Powered by Mapbox</p>
            ) : null}
          </div>

          <div className="mt-3 max-h-[360px] space-y-1 overflow-y-auto pr-1">
            {results.map((result, index) => (
              <SearchResultRow
                key={result.id}
                result={result}
                highlighted={index === highlightedIndex}
                onClick={() => onSelectResult(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
              />
            ))}
          </div>

          {searchError ? (
            <div className="mt-3 rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-ink-400">
              {searchError}
            </div>
          ) : null}

          {!searching && !searchError && results.length === 0 ? (
            <div className="mt-3 rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-ink-400">
              No places found. Try a city, address, landmark, or country.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
