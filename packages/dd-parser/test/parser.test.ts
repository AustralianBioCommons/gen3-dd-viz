import { describe, it, expect } from 'vitest';
import { parseGen3Dictionary } from '../src';

describe('parseGen3Dictionary', () => {
  it('produces nodes and edges, and removes edges with missing endpoints', () => {
    // Compiled-schema style input (each schema at top-level; edges from `links`)
    const input = {
      project: {
        id: 'project',
        category: 'administrative',
        submittable: true,
        // no links here; others will point to project
      },
      a: {
        id: 'a',
        category: 'data_file',
        links: [
          // valid edge to existing node
          { target_type: 'project', required: true, multiplicity: 'many_to_one' },
          // invalid edge to a missing node -> should be dropped
          { target_type: 'nonexist', required: false },
        ],
      },
      // This node exists but its link points to a missing target; that edge should be dropped
      x: {
        id: 'x',
        links: [{ target_type: 'also_missing', required: false }],
      },
    } as any;

    const g = parseGen3Dictionary(input);

    // Nodes exist (taken from top-level keys / schema.id)
    expect(g.nodes.find(n => n.id === 'project')).toBeTruthy();
    expect(g.nodes.find(n => n.id === 'a')).toBeTruthy();
    expect(g.nodes.find(n => n.id === 'x')).toBeTruthy();

    // Keeps only edges whose endpoints exist
    expect(
      g.edges.some(e => e.source === 'a' && e.target === 'project' && e.required === true),
    ).toBe(true);

    // These should be dropped (targets do not exist)
    expect(g.edges.some(e => e.target === 'nonexist')).toBe(false);
    expect(g.edges.some(e => e.target === 'also_missing')).toBe(false);
  });

  it('supports subgroup links within a schema', () => {
    const input = {
      project: { id: 'project' },
      a: {
        id: 'a',
        links: [
          {
            // group-level required defaults that may be overridden per subgroup
            required: true,
            subgroup: [
              { target_type: 'project', multiplicity: 'many_to_one' },
              { target_type: 'nonexist', required: false }, // should be dropped later
            ],
          },
        ],
      },
    } as any;

    const g = parseGen3Dictionary(input);

    expect(g.nodes.find(n => n.id === 'project')).toBeTruthy();
    expect(g.nodes.find(n => n.id === 'a')).toBeTruthy();

    // subgroup -> project retained
    expect(
      g.edges.some(e => e.source === 'a' && e.target === 'project' && e.required === true),
    ).toBe(true);

    // subgroup -> nonexist dropped
    expect(g.edges.some(e => e.target === 'nonexist')).toBe(false);
  });
});

