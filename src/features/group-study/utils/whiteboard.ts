import type { ViewportState, WhiteboardElement } from "../types";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;

export type Camera = ViewportState;
export type Point = [number, number];

export interface Size {
  width: number;
  height: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Bounding box of everything that is drawn, or null if the board is empty. */
export function computeBounds(elements: WhiteboardElement[]): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const include = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  for (const el of elements) {
    if (Array.isArray(el.points) && el.points.length > 0) {
      for (const point of el.points) include(el.x + point[0], el.y + point[1]);
    } else {
      include(el.x, el.y);
      include(el.x + el.width, el.y + el.height);
    }
  }

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

/** Camera that shows the whole drawing, centered in the view. */
export function fitCamera(
  bounds: Bounds,
  size: Size,
  padding = 24,
  maxZoom = 1.5
): Camera {
  const width = Math.max(bounds.maxX - bounds.minX, 1);
  const height = Math.max(bounds.maxY - bounds.minY, 1);

  const zoom = clamp(
    Math.min(
      (size.width - padding * 2) / width,
      (size.height - padding * 2) / height,
      maxZoom
    ),
    MIN_ZOOM,
    MAX_ZOOM
  );

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return {
    zoom,
    scrollX: size.width / (2 * zoom) - centerX,
    scrollY: size.height / (2 * zoom) - centerY,
  };
}

/** Changes the zoom while keeping the center of the view where it is. */
export function zoomAroundCenter(camera: Camera, factor: number, size: Size): Camera {
  const zoom = clamp(camera.zoom * factor, MIN_ZOOM, MAX_ZOOM);

  return {
    zoom,
    scrollX: camera.scrollX + (size.width / 2) * (1 / zoom - 1 / camera.zoom),
    scrollY: camera.scrollY + (size.height / 2) * (1 / zoom - 1 / camera.zoom),
  };
}

/** SVG path through the points. Smooth paths use quadratic curves through midpoints. */
export function linePath(points: number[][], smooth: boolean): string {
  if (points.length === 0) return "";

  const [startX, startY] = points[0];
  if (points.length === 1) return `M ${startX} ${startY} l 0 0`;

  if (!smooth || points.length < 3) {
    return `M ${points.map((p) => `${p[0]} ${p[1]}`).join(" L ")}`;
  }

  let d = `M ${startX} ${startY}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i][0] + points[i + 1][0]) / 2;
    const midY = (points[i][1] + points[i + 1][1]) / 2;
    d += ` Q ${points[i][0]} ${points[i][1]} ${midX} ${midY}`;
  }

  const last = points[points.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

export type Arrowhead = { d: string; filled: boolean } | null;

/** Shape of an arrowhead at `tip`, for a line that comes from `from`. */
export function arrowheadPath(
  kind: string,
  tip: Point,
  from: Point,
  strokeWidth: number
): Arrowhead {
  const dx = tip[0] - from[0];
  const dy = tip[1] - from[1];
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return null;

  // Unit vector pointing to the tip, and its normal.
  const ux = dx / distance;
  const uy = dy / distance;
  const nx = -uy;
  const ny = ux;

  const size = Math.min(14 + strokeWidth * 2, distance);
  const baseX = tip[0] - ux * size;
  const baseY = tip[1] - uy * size;
  const half = size * 0.45;

  const ax = baseX + nx * half;
  const ay = baseY + ny * half;
  const bx = baseX - nx * half;
  const by = baseY - ny * half;

  switch (kind) {
    case "triangle":
    case "triangle_outline":
      return {
        d: `M ${ax} ${ay} L ${tip[0]} ${tip[1]} L ${bx} ${by} Z`,
        filled: kind === "triangle",
      };

    case "bar":
      return {
        d: `M ${tip[0] + nx * half} ${tip[1] + ny * half} L ${tip[0] - nx * half} ${tip[1] - ny * half}`,
        filled: false,
      };

    case "dot":
    case "circle":
    case "circle_outline": {
      const r = size * 0.3;
      const cx = tip[0] - ux * r;
      const cy = tip[1] - uy * r;
      return {
        d: `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`,
        filled: kind !== "circle_outline",
      };
    }

    case "diamond":
    case "diamond_outline": {
      const r = size * 0.35;
      const cx = tip[0] - ux * r;
      const cy = tip[1] - uy * r;
      return {
        d: `M ${tip[0]} ${tip[1]} L ${cx + nx * r} ${cy + ny * r} L ${cx - ux * r} ${cy - uy * r} L ${cx - nx * r} ${cy - ny * r} Z`,
        filled: kind === "diamond",
      };
    }

    default:
      // Open "V" arrowhead, also used for kinds that are not drawn specially.
      return { d: `M ${ax} ${ay} L ${tip[0]} ${tip[1]} L ${bx} ${by}`, filled: false };
  }
}

/**
 * Returns a camera that brings `bounds` into view, or null if it is already
 * fully visible. It scrolls to the area and only zooms out when the area is
 * bigger than the view, never zooms in.
 */
export function ensureVisible(
  camera: Camera,
  size: Size,
  bounds: Bounds,
  margin = 32
): Camera | null {
  if (size.width === 0 || size.height === 0) return null;

  const left = -camera.scrollX;
  const top = -camera.scrollY;
  const right = left + size.width / camera.zoom;
  const bottom = top + size.height / camera.zoom;
  const inset = margin / camera.zoom;

  const visible =
    bounds.minX >= left + inset &&
    bounds.maxX <= right - inset &&
    bounds.minY >= top + inset &&
    bounds.maxY <= bottom - inset;

  if (visible) return null;

  return fitCamera(bounds, size, margin, camera.zoom);
}
