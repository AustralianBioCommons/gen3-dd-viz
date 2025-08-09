import { getCategoryColors, REQUIRED_EDGE_COLOR, OPTIONAL_EDGE_COLOR, DEFAULT_CATEGORY_COLOR } from './palette';

/** Public graph types mirrored from the parser to avoid drift. */
export interface DDNode { id: string; title?: string; category?: string; submittable?: boolean; }
export interface DDEdge { source: string; target: string; label?: string; multiplicity?: string; required?: boolean; }
export interface DDGraph { nodes: DDNode[]; edges: DDEdge[]; }
export type Orientation = 'LR' | 'TB';

/** Build a Graphviz DOT document from the in-memory graph. */
export function buildDot(graph: DDGraph, orientation: Orientation, catMap?: Record<string, string>): string {
  const rankdir = orientation === 'TB' ? 'BT' : 'LR'; // TB UI => BT arrows up
  const header = [
    'digraph G {',
    `  graph [ranksep=1.1, nodesep=0.6, pad=0.2, splines=true, overlap=false, rankdir=${rankdir}];`,
    '  node [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=11];',
    '  edge [fontname="Helvetica", fontsize=9, arrowsize=0.7];',
  ].join('\n');
  const esc = (s: string) => s.replace(/\"/g, '\"').replace(/"/g, '\"');

  const nodes: string[] = [];
  const cmap = catMap || getCategoryColors(graph);
  for (const n of graph.nodes) {
    const label = esc(n.title || n.id);
    const cat = (n.category || '').trim();
    const fill = cat && cmap[cat] ? cmap[cat] : DEFAULT_CATEGORY_COLOR;
    const peripheries = n.submittable ? 2 : 1;
    nodes.push(`  "${n.id}" [label="${label}", fillcolor="${fill}", peripheries=${peripheries}];`);
  }

  const edges: string[] = [];
  for (const e of graph.edges) {
    const lab = e.label || e.multiplicity || '';
    const color = e.required ? REQUIRED_EDGE_COLOR : OPTIONAL_EDGE_COLOR;
    const style = e.required ? 'solid' : 'dashed';
    
    const attrs: string[] = [
      `color="${color}"`,
      `style="${style}"`,
    ];
    if (lab) attrs.push(`label="${esc(lab)}"`);
    
    // Many-to-one: crow’s-foot at the SOURCE side (tail)
    if (e.multiplicity === 'many_to_one') {
      attrs.push('dir=both', 'arrowtail=crow');
    }
    
    edges.push(`  "${e.source}" -> "${e.target}" [${attrs.join(', ')}];`);
  }

  return `${header}\n${nodes.join('\n')}\n${edges.join('\n')}\n}`;
}
