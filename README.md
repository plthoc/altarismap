# ALTARIS MAP

Production-ready React + TypeScript + Tailwind implementation of the dark cinematic map UI.

## Stack

- React
- TypeScript
- Tailwind CSS
- Vite
- Mapbox GL JS

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your Mapbox token:

```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

3. Start the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Preview the production build locally:

```bash
npm run preview
```

## Behavior

- Search overlay is hidden on first load and opens from the sidebar search button.
- Escape, outside click, arrow key navigation, and Enter selection all work.
- Settings popover includes working toggles for dark style, label visibility, and reset view.
- Clicking a recommended result closes the overlay, updates selection state, and flies the map toward Barcelona.

## Notes

- The map now uses Mapbox only.
- Attribution stays visible at the bottom-left to satisfy provider requirements.
