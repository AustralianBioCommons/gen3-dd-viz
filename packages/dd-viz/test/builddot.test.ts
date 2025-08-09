import { describe, it, expect } from 'vitest';
import { buildDot } from '../src/buildDot';

describe('buildDot', () => {
  const graph = {
    nodes: [{id:'project', title:'Project', category:'administrative', submittable:true},
            {id:'a', title:'A', category:'data_file'}],
    edges: [{source:'a', target:'project', label:'derived_from', required:true}]
  };
  it('uses BT for TB orientation (arrows upward)', () => {
    const dot = buildDot(graph as any, 'TB');
    expect(dot).toContain('rankdir=BT');
  });
  it('includes edge label', () => {
    const dot = buildDot(graph as any, 'TB');
    expect(dot).toContain('label="derived_from"');
  });
});
