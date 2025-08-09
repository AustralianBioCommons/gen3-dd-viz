import React, { useEffect, useRef } from 'react';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render';
import { getCategoryColors } from '../palette';
import { buildDot, type DDGraph, type Orientation } from '../buildDot';
import { useSvgPanZoom } from './useSvgPanZoom';

/** Public props */
export interface GraphvizDDGraphViewProps {
  graph: DDGraph | null;
  orientation?: Orientation;
  style?: React.CSSProperties;
  /** Optional error callback */
  onError?: (err: unknown) => void;
}

/** Fit the outer <svg> to its content bbox with a margin. */
function fitToContent(svgEl: SVGSVGElement, margin = 32) {
  const bbox = svgEl.getBBox();
  const x = bbox.x - margin;
  const y = bbox.y - margin;
  const w = Math.max(1, bbox.width + margin * 2);
  const h = Math.max(1, bbox.height + margin * 2);
  svgEl.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  return { x, y, w, h };
}

export function GraphvizDDGraphView({
  graph,
  orientation = 'TB',
  style,
  onError,
}: GraphvizDDGraphViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // Wire up interactions (wheel + left-drag pan). No CTM; zooms around viewBox center.
  useSvgPanZoom(containerRef, svgRef, viewBoxRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset container
    container.style.overflow = 'hidden'; // we control scroll via viewBox
    container.innerHTML = '';
    svgRef.current = null;
    viewBoxRef.current = null;

    // Empty state
    if (!graph || graph.nodes.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText =
        'display:grid;place-items:center;height:100%;color:#777;font:12px Helvetica,Arial,sans-serif;';
      empty.textContent = 'No nodes to display';
      container.appendChild(empty);
      return;
    }

    // Render DOT -> <svg> using viz.js
    const viz = new Viz({ Module, render });
    const dot = buildDot(graph, orientation, getCategoryColors(graph));

    viz
      .renderSVGElement(dot)
      .then((svgEl: SVGSVGElement) => {
        // Normalize sizing to use viewBox-based scaling
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';

        container.appendChild(svgEl);
        svgRef.current = svgEl;

        // Ensure we start fitted to all content
        const vb = fitToContent(svgEl, 32);
        viewBoxRef.current = vb;

        // Remove any native scroll offsets, if present
        container.scrollTop = 0;
        container.scrollLeft = 0;
      })
      .catch((err: unknown) => {
        if (typeof onError === 'function') onError(err);
        // Fallback inline error
        const pre = document.createElement('pre');
        pre.style.cssText = 'color:#b00020;white-space:pre-wrap;font:12px/1.4 monospace;padding:8px;';
        pre.textContent = `Failed to render graph: ${String((err as any)?.message || err)}`;
        container.appendChild(pre);
      });

    // No cleanup for viz.js promise needed; the next effect run resets DOM.

  }, [graph, orientation, onError]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: 'default', ...style }}
      tabIndex={0}
    />
  );
}

export default GraphvizDDGraphView;

