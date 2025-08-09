/**
 * Color palette and category color mapping for the viewer.
 * - REQUIRED_EDGE_COLOR: blue for required edges
 * - OPTIONAL_EDGE_COLOR: gray, dashed for optional edges
 * - DEFAULT_CATEGORY_COLOR: fallback fill for nodes without a category
 *
 * getCategoryColors(): stable mapping from category -> fill color.
 *   - Uses a curated Tableau-like palette, then golden-angle HSL fallback.
 */
export const REQUIRED_EDGE_COLOR = '#4a6cf7';
export const OPTIONAL_EDGE_COLOR = '#a0a0a0';
export const DEFAULT_CATEGORY_COLOR = '#e0e0e0';

const GOLDEN_ANGLE = 137.508;
const CURATEDCOLORS = [
  // Tableau 10
  '#4E79A7','#F28E2B','#E15759','#76B7B2','#59A14F',
  '#EDC948','#B07AA1','#FF9DA7','#9C755F','#BAB0AC',
];

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export interface DDGraphLike {
  nodes: { category?: string }[];
}

/** Build a color map for any categories present in the graph. */
export function getCategoryColors(graph: DDGraphLike | null): Record<string, string> {
  const map: Record<string, string> = {};
  if (!graph) return map;
  const cats = Array.from(new Set(graph.nodes.map(n => (n.category || '').trim()).filter(Boolean)))
    .sort((a,b) => a.localeCompare(b));

  for (let i = 0; i < cats.length; i++) {
    if (i < CURATEDCOLORS.length) {
      map[cats[i]] = CURATEDCOLORS[i];
    } else {
      // golden-angle fallback (alternate saturation/lightness for contrast)
      const h = ((18 + i * GOLDEN_ANGLE) % 360 + 360) % 360;
      const s = i % 2 ? 54 : 62;
      const l = i % 2 ? 68 : 58;
      map[cats[i]] = hslToHex(h, s, l);
    }
  }
  return map;
}
