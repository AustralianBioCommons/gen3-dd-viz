import React, { useMemo, useRef, useState } from 'react';
import { parseGen3Dictionary, DDGraph } from '@gen3/dd-parser';
import { GraphvizDDGraphView } from '@gen3/dd-viz';
import Legend from './Legend';

export default function App() {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const canvasRef = React.useRef<HTMLDivElement | null>(null);
  const [graph, setGraph] = useState<DDGraph | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [orientation, setOrientation] = useState<'LR'|'TB'>('TB');
  
  const fileInput = useRef<HTMLInputElement | null>(null);

  
  const onFile = async (f: File) => {
    setFileName(f.name);
    const text = await f.text();
    const json = JSON.parse(text);
    setGraph(parseGen3Dictionary(json));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', position: 'relative'}} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <div className="toolbar">
        <button onClick={() => fileInput.current?.click()}>Load dictionary…</button>
        <div style={{marginLeft:12, color:'#555'}}>{fileName && (`Loaded: ${fileName}`)}</div>
        <input ref={fileInput} type="file" accept="application/json" style={{display: 'none'}} onChange={e => {
          const f = e.target.files?.[0]; if (f) onFile(f);
        }} />
                <div className="spacer" />
        <select value={orientation} onChange={e => setOrientation(e.target.value as any)}>
          <option value="LR">Left→Right</option>
          <option value="TB">Top→Bottom</option>
        </select>
        <button onClick={() => {
          if (!graph) return;
          const svg = canvasRef.current?.querySelector('svg');
          if (!svg) return;
          const s = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'gen3-dd-graph.svg';
          a.click();
          URL.revokeObjectURL(url);
        }}>Export SVG</button>
        <div style={{marginLeft:12, color:'#555'}}>{fileName && (`Loaded: ${fileName}`)}</div>
      </div>
      <div style={{display:'flex', height:'calc(100% - 48px)'}}>
        <div style={{flex:1, minWidth:0}} className="canvas">
        {graph ? (
          <div ref={canvasRef} style={{position:'relative', height:'100%'}}>
            <GraphvizDDGraphView graph={graph} orientation={orientation} />
            <div style={{position:'absolute', right:16, bottom:16, background:'#fff', border:'1px solid #ddd', borderRadius:6, padding:'8px 10px', fontSize:12, boxShadow:'0 2px 6px rgba(0,0,0,0.08)', pointerEvents:'none'}}>
              <div><strong>Tips</strong></div>
              <div>Scroll: zoom</div>
              <div>Left-click + drag: pan</div>
            </div>
          </div>) : (
          <div style={{display:'grid',placeItems:'center',height:'100%',color:'#777'}}>
            <div>Drop a compiled Gen3 dictionary JSON here, or click “Load dictionary…”.</div>
          </div>
        )}
        </div>
        <Legend graph={graph} />
      </div>
    </div>
  );
}