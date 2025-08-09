import { describe, it, expect } from 'vitest';
import { parseGen3Dictionary } from '../src/index';

describe('parseGen3Dictionary', () => {
  it('produces nodes and edges, and removes edges with missing endpoints', () => {
    const input = {
      nodes: {
        project: { id: 'project', category: 'administrative', submittable: true },
        a: { id: 'a', category: 'data_file' },
      },
      links: {
        a: { project: { required: true, multiplicity: 'many_to_one' } },
        // orphan link to a missing node should be dropped:
        missing: { nonexist: { required: false } }
      }
    } as any;

    const g = parseGen3Dictionary(input);
    expect(g.nodes.find(n => n.id==='project')).toBeTruthy();
    expect(g.nodes.find(n => n.id==='a')).toBeTruthy();
    expect(g.edges.some(e => e.source==='a' && e.target==='project' && e.required===true)).toBe(true);
    // no edges referencing absent nodes
    expect(g.edges.some(e => e.source==='missing' || e.target==='nonexist')).toBe(false);
  });
});
