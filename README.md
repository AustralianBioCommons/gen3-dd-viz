# Gen3 Data Dictionary Visualizer (standalone)

A lightweight, standalone visualizer for bundled **Gen3** data dictionaries.

## What’s inside

- **`@gen3/dd-parser`** — TS library that normalizes a compiled Gen3 dictionary into a simple graph model.
- **`@gen3/dd-viz`** — React component that renders the graph into SVG.
- **`dd-viz-app`** — zero-backend Vite app: drag & drop your JSON or load via URL.

> Node 18+ recommended.

## Quick start

```bash
# at repo root
npm install

# run the app
npm run dev

# build all packages + app
npm run build
```

Then open the URL shown by Vite (http://localhost:5173).

## Workspace scripts

- `npm run dev` — launches `apps/dd-viz-app` in dev mode
- `npm run build` — builds parser, viz, and the app
- `npm run typecheck` — type checks packages and app

## Notes

- Layout is layered (ELK) and rendered to **SVG** for crisp export.
- Modern evergreen browsers only.


## Testing
Run unit tests:

```bash
npm run -w @gen3/dd-parser test
npm run -w @gen3/dd-viz test
```

## Example Dictionaries

This repository includes example Gen3 dictionary JSON files in [`examples/`](./examples/):

- [`dcf.json`](./examples/dcf.json)
- [`ega.json`](./examples/ega.json)
- [`gdc.json`](./examples/gdc.json)

These can be used to test the parser or to explore the visualization without needing to source your own schema.

