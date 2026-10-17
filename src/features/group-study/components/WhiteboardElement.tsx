import { memo } from "react";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import {
  Ellipse,
  G,
  Image as SvgImage,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import type { WhiteboardElement as Element } from "../types";
import { arrowheadPath, linePath } from "../utils/whiteboard";
import type { Point } from "../utils/whiteboard";

interface Props {
  element: Element;
  /** Image data URL, for image elements whose file has arrived. */
  imageData?: string;
}

const DEFAULT_STROKE = "#1e1e1e";

function strokeProps(el: Element) {
  const width = el.strokeWidth ?? 1;
  const dash =
    el.strokeStyle === "dashed"
      ? `8,${8 + width}`
      : el.strokeStyle === "dotted"
        ? `1.5,${6 + width}`
        : undefined;

  return {
    stroke: el.strokeColor ?? DEFAULT_STROKE,
    strokeWidth: width,
    strokeDasharray: dash,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

// The sketchy fill patterns are drawn as a lighter solid fill.
function fillProps(el: Element) {
  const color = el.backgroundColor;
  if (!color || color === "transparent") return { fill: "none" };
  return { fill: color, fillOpacity: el.fillStyle === "solid" ? 1 : 0.5 };
}

function fontFamilyFor(family?: number): string | undefined {
  // Family 3 is the monospace "code" font.
  if (family === 3) return Platform.select({ ios: "Courier", default: "monospace" });
  return undefined;
}

function renderBody(el: Element, imageData?: string): ReactNode {
  const width = el.width;
  const height = el.height;
  const stroke = strokeProps(el);

  switch (el.type) {
    case "rectangle": {
      const radius = el.roundness ? Math.min(Math.min(width, height) * 0.25, 32) : 0;
      return (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          {...fillProps(el)}
          {...stroke}
        />
      );
    }

    case "diamond":
      return (
        <Polygon
          points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`}
          {...fillProps(el)}
          {...stroke}
        />
      );

    case "ellipse":
      return (
        <Ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2}
          ry={height / 2}
          {...fillProps(el)}
          {...stroke}
        />
      );

    case "line":
    case "arrow": {
      const points = Array.isArray(el.points) ? el.points : [];
      if (points.length < 2) return null;

      const smooth = !!el.roundness && points.length > 2;
      const first = points[0];
      const last = points[points.length - 1];
      const closed =
        el.type === "line" &&
        points.length > 2 &&
        Math.hypot(first[0] - last[0], first[1] - last[1]) < 1;

      const heads: Arrowhead[] = [];
      if (el.type === "arrow") {
        if (el.endArrowhead) {
          heads.push(
            arrowheadPath(
              el.endArrowhead,
              last as Point,
              points[points.length - 2] as Point,
              stroke.strokeWidth
            )
          );
        }
        if (el.startArrowhead) {
          heads.push(
            arrowheadPath(
              el.startArrowhead,
              first as Point,
              points[1] as Point,
              stroke.strokeWidth
            )
          );
        }
      }

      return (
        <>
          <Path
            d={linePath(points, smooth)}
            {...(closed ? fillProps(el) : { fill: "none" })}
            {...stroke}
          />
          {heads.map((head, index) =>
            head ? (
              <Path
                key={index}
                d={head.d}
                {...stroke}
                strokeDasharray={undefined}
                fill={head.filled ? stroke.stroke : "none"}
              />
            ) : null
          )}
        </>
      );
    }

    case "freedraw": {
      const points = Array.isArray(el.points) ? el.points : [];
      if (points.length === 0) return null;

      return (
        <Path
          d={linePath(points, true)}
          fill="none"
          stroke={stroke.stroke}
          strokeWidth={stroke.strokeWidth * 1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }

    case "text": {
      const lines = (el.text ?? "").split("\n");
      const fontSize = el.fontSize ?? 20;
      const lineHeight = fontSize * (el.lineHeight ?? 1.25);
      const align = el.textAlign ?? "left";
      const x = align === "center" ? width / 2 : align === "right" ? width : 0;
      const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
      const family = fontFamilyFor(el.fontFamily);

      return lines.map((line, index) => (
        <SvgText
          key={index}
          x={x}
          y={index * lineHeight + (lineHeight - fontSize) / 2 + fontSize * 0.8}
          fontSize={fontSize}
          fontFamily={family}
          fill={stroke.stroke}
          textAnchor={anchor}
        >
          {line}
        </SvgText>
      ));
    }

    case "image":
      if (!imageData) {
        return (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth={1}
          />
        );
      }
      return (
        <SvgImage
          x={0}
          y={0}
          width={width}
          height={height}
          href={{ uri: imageData }}
          preserveAspectRatio="none"
        />
      );

    case "frame":
    case "magicframe":
      return (
        <>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="none"
            stroke="#BBBBBB"
            strokeWidth={1}
          />
          {!!el.name && (
            <SvgText x={0} y={-6} fontSize={12} fill="#888888">
              {el.name}
            </SvgText>
          )}
        </>
      );

    default:
      return null;
  }
}

type Arrowhead = ReturnType<typeof arrowheadPath>;

function WhiteboardElementBase({ element, imageData }: Props) {
  const body = renderBody(element, imageData);
  if (!body) return null;

  const degrees = ((element.angle ?? 0) * 180) / Math.PI;
  const transform = degrees
    ? `translate(${element.x}, ${element.y}) rotate(${degrees}, ${element.width / 2}, ${element.height / 2})`
    : `translate(${element.x}, ${element.y})`;

  return (
    <G transform={transform} opacity={(element.opacity ?? 100) / 100}>
      {body}
    </G>
  );
}

// An element is only redrawn when its version (a new object) or image changes.
export default memo(
  WhiteboardElementBase,
  (prev, next) =>
    prev.element === next.element && prev.imageData === next.imageData
);
