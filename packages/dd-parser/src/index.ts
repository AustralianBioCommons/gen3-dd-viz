export type Multiplicity = 'one_to_one'|'one_to_many'|'many_to_one'|'many_to_many'|string;

export interface DDNode {
  id: string;
  title?: string;
  category?: string;
  submittable?: boolean;
}

export interface DDEdge {
  source: string;
  target: string;
  label?: string;
  multiplicity?: Multiplicity;
  required?: boolean;
}


function isBool(x: any): x is boolean {
  return x === true || x === false;
}

export interface DDGraph {
  nodes: DDNode[];
  edges: DDEdge[];
  meta?: Record<string, unknown>;
}

/**
 * Parse a compiled Gen3 dictionary JSON into a DDGraph.
 * - Nodes: entries with an `id` field.
 * - Edges: for each schema's `links[*]` or `links[*].subgroup[]`, create edges to `target_type`.
 *   `required` is taken from subgroup item; otherwise from wrapper link; otherwise false.
 */

export function parseGen3Dictionary(dict: Record<string, any>): DDGraph {
  const nodes: Map<string, DDNode> = new Map();
  const edges: DDEdge[] = [];

  for (const [k, v] of Object.entries(dict)) {
    if (!v || typeof v !== 'object') continue;
    const keyStr = String(k);
    const id: string = (v as any).id || keyStr.replace(/\.yaml$/, '');
    if (keyStr.startsWith('_') || String(id).startsWith('_')) continue;

    nodes.set(id, {
      id,
      title: (v as any).title,
      category: (v as any).category,
      submittable: !!(v as any).submittable,
    });

    const links = Array.isArray((v as any).links) ? (v as any).links : [];
    for (const ln of links) {
      if (!ln || typeof ln !== 'object') continue;

      const linkRequired = typeof ln.required === 'boolean' ? ln.required : undefined;

      if (Array.isArray(ln.subgroup)) {
        for (const sub of ln.subgroup) {
          if (!sub || typeof sub !== 'object') continue;
          const target = sub.target_type;
          if (!target) continue;
          const subRequired = typeof sub.required === 'boolean' ? sub.required : undefined;
          const required = (subRequired !== undefined) ? subRequired : ((linkRequired !== undefined) ? linkRequired : false);
          edges.push({
            source: id,
            target: String(target),
            label: sub.label ? String(sub.label) : undefined,
            multiplicity: sub.multiplicity ? String(sub.multiplicity) as Multiplicity : undefined,
            required
          });
        }
      } else if (ln.target_type) {
        const required = (linkRequired !== undefined) ? linkRequired : false;
        edges.push({
          source: id,
          target: String(ln.target_type),
          label: ln.label ? String(ln.label) : undefined,
          multiplicity: ln.multiplicity ? String(ln.multiplicity) as Multiplicity : undefined,
          required
        });
      }
    }
  }

  // Clean edges where both endpoints exist
  const ids = new Set(Array.from(nodes.keys()));
  const cleanEdges = edges.filter(e => ids.has(e.source) && ids.has(e.target));

  return {
    nodes: Array.from(nodes.values()),
    edges: cleanEdges,
    meta: {},
  };
}
