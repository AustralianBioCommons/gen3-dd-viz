import { useEffect, RefObject, MutableRefObject } from 'react';

type VB = { x: number; y: number; w: number; h: number };

/**
 * Pan (left mouse button drag) and zoom (wheel) for an SVG.
 * - Zoom is always around the current viewBox center.
 * - No clientToSvg, no CTM math; everything in viewBox units.
 * - Listeners are attached to the CONTAINER so they are present before the SVG is mounted.
 */
export function useSvgPanZoom(
  containerRef: RefObject<HTMLDivElement>,
  svgRef: RefObject<SVGSVGElement>,
  viewBoxRef: MutableRefObject<VB | null>
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isPanning = false;
    let lastClient: { x: number; y: number } | null = null;

    const getScale = () => {
      const svg = svgRef.current;
      const vb = viewBoxRef.current;
      if (!svg || !vb) return { sx: 1, sy: 1 };
      const w = svg.clientWidth || 1;
      const h = svg.clientHeight || 1;
      return { sx: vb.w / w, sy: vb.h / h };
    };

    const onWheel = (e: WheelEvent) => {
      const svg = svgRef.current;
      const vb = viewBoxRef.current;
      if (!svg || !vb) return;
      e.preventDefault();

      const factor = e.deltaY > 0 ? 1.1 : 0.9;

      const cx = vb.x + vb.w / 2;
      const cy = vb.y + vb.h / 2;

      const newW = Math.max(1e-6, vb.w * factor);
      const newH = Math.max(1e-6, vb.h * factor);

      const nx = cx - newW / 2;
      const ny = cy - newH / 2;

      svg.setAttribute('viewBox', `${nx} ${ny} ${newW} ${newH}`);
      viewBoxRef.current = { x: nx, y: ny, w: newW, h: newH };
    };

    const onMouseDown = (e: MouseEvent) => {
      // Start panning on left mouse button
      if (e.button != 0) return;
      if (!viewBoxRef.current) return;
      e.preventDefault();
      isPanning = true;
      lastClient = { x: e.clientX, y: e.clientY };
      container.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      const vb = viewBoxRef.current;
      if (!isPanning || !svg || !vb) return;
      e.preventDefault();

      const { sx, sy } = getScale();
      const dx = (e.clientX - (lastClient?.x ?? e.clientX)) * sx;
      const dy = (e.clientY - (lastClient?.y ?? e.clientY)) * sy;

      const nx = vb.x - dx;
      const ny = vb.y - dy;

      svg.setAttribute('viewBox', `${nx} ${ny} ${vb.w} ${vb.h}`);
      viewBoxRef.current = { x: nx, y: ny, w: vb.w, h: vb.h };
      lastClient = { x: e.clientX, y: e.clientY };
    };

    const endPan = () => {
      isPanning = false;
      lastClient = null;
      container.style.cursor = 'default';
    };

    // Attach to container so they exist even if SVG mounts later.
    container.addEventListener('wheel', onWheel as any, { passive: false });
    container.addEventListener('mousedown', onMouseDown as any);
    window.addEventListener('mousemove', onMouseMove as any);
    window.addEventListener('mouseup', endPan as any);

    return () => {
      container.removeEventListener('wheel', onWheel as any);
      container.removeEventListener('mousedown', onMouseDown as any);
      window.removeEventListener('mousemove', onMouseMove as any);
      window.removeEventListener('mouseup', endPan as any);
    };
  }, [containerRef]); // run once for this container
}
