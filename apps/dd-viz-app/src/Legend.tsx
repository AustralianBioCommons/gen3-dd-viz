import React from 'react';
import { getCategoryColors, REQUIRED_EDGE_COLOR, OPTIONAL_EDGE_COLOR } from '@gen3/dd-viz';
import { DDGraph } from '@gen3/dd-parser';

export default function Legend({ graph }: { graph: DDGraph | null }) {
  const catMap = graph ? getCategoryColors(graph) : {};
  const cats = React.useMemo(() => {
    if (!graph) return [];
    const set = new Set<string>();
    for (const n of graph.nodes) {
      if (n.category) set.add(n.category);
    }
    return Array.from(set).sort();
  }, [graph]);

  return (
    <div style={{
      position: 'absolute', right: 12, top: 64, width: 240,
      border: '1px solid #ddd', borderRadius: 8, padding: 12, background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 12
    }}>
      <div style={{fontWeight: 600, marginBottom: 8}}>Legend</div>
      <div style={{marginBottom: 10}}>
        <div style={{fontWeight: 600, marginBottom: 6}}>Node categories</div>
        {cats.length === 0 ? <div style={{color:'#777'}}>None</div> : cats.map(c => (
          <div key={c} style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
            <div style={{width:16, height:12, borderRadius:3, background: catMap[c] || catMap.default, border:'1px solid #ccc'}}/>
            <div>{c}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom: 10}}>
        <div style={{fontWeight: 600, marginBottom: 6}}>Special nodes</div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <svg width="28" height="20">
            <ellipse cx="14" cy="10" rx="11" ry="7" fill="none" stroke="#111" strokeWidth="1.5" />
            <ellipse cx="14" cy="10" rx="8" ry="4" fill="none" stroke="#111" strokeWidth="1.5" />
          </svg>
          <div>Submittable</div>
        </div>
      </div>
      <div>
        <div style={{fontWeight: 600, marginBottom: 6}}>Links</div>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
          <svg width="40" height="12"><line x1="2" y1="6" x2="38" y2="6" stroke={REQUIRED_EDGE_COLOR} strokeWidth="2" /></svg>
          <div>required</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <svg width="40" height="12"><line x1="2" y1="6" x2="38" y2="6" stroke={OPTIONAL_EDGE_COLOR} strokeWidth="2" strokeDasharray="4 3" /></svg>
          <div>optional</div>
        </div>
      </div>
    </div>
  );
}
