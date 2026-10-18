import { PanResponder, Pressable, Text, View } from "react-native";
import type { GestureResponderEvent, NativeTouchEvent } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Svg, { G } from "react-native-svg";

import WhiteboardElement from "./WhiteboardElement";
import type { WhiteboardState } from "../hooks/useWhiteboard";
import type { ActivityPing, ViewportState } from "../types";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  clamp,
  computeBounds,
  ensureVisible,
  fitCamera,
  isFiniteNumber,
  zoomAroundCenter,
} from "../utils/whiteboard";
import type { Bounds, Camera, Size } from "../utils/whiteboard";

interface Props {
  whiteboard: WhiteboardState;
}

interface GestureBase {
  /** Number of fingers (1 or 2) the baseline was taken with. */
  fingers: number;
  camera: Camera;
  centerX: number;
  centerY: number;
  distance: number;
}

// How far a finger has to move before it counts as "moving the board".
// Smaller movements are taps and do not interrupt following.
const MOVE_THRESHOLD = 8;

function centerOf(touches: readonly NativeTouchEvent[]) {
  const x = touches.reduce((sum, t) => sum + t.locationX, 0) / touches.length;
  const y = touches.reduce((sum, t) => sum + t.locationY, 0) / touches.length;
  return { x, y };
}

function distanceOf(touches: readonly NativeTouchEvent[]) {
  if (touches.length < 2) return 0;
  return Math.hypot(
    touches[0].locationX - touches[1].locationX,
    touches[0].locationY - touches[1].locationY
  );
}

/** View-only whiteboard. Students can pan and zoom, but not draw. */
export default function WhiteboardView({ whiteboard }: Props) {
  const {
    elements,
    files,
    presenter,
    following,
    toggleFollow,
    stopFollowing,
    activity,
    latestViewport,
    viewportListener,
    focusListener,
    getLastEdit,
  } = whiteboard;

  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [camera, setCamera] = useState<Camera>({ scrollX: 0, scrollY: 0, zoom: 1 });

  const cameraRef = useRef(camera);
  const sizeRef = useRef(size);
  const followingRef = useRef(following);
  const elementsRef = useRef(elements);
  const autoFitted = useRef(false);
  const gesture = useRef<GestureBase | null>(null);
  const presenterZoom = useRef(1);
  // True when the presenter's web version sends its canvas size.
  const presenterHasSize = useRef(false);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    followingRef.current = following;
  }, [following]);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const updateCamera = useCallback((next: Camera) => {
    cameraRef.current = next;
    setCamera(next);
  }, []);

  // Stops following right away, before React state has updated.
  const pauseFollowing = useCallback(() => {
    followingRef.current = false;
    stopFollowing();
  }, [stopFollowing]);

  // The presenter's screen is much bigger than a phone, so copying their
  // scroll and zoom would show only a corner of what they see. Instead, scale
  // everything they can see to fit this screen.
  const followViewport = useCallback(
    (viewport: ViewportState) => {
      presenterZoom.current = viewport.zoom;

      const width = viewport.width;
      const height = viewport.height;
      if (!isFiniteNumber(width) || !isFiniteNumber(height) || width <= 0 || height <= 0) {
        presenterHasSize.current = false;
        return;
      }
      presenterHasSize.current = true;

      const view = sizeRef.current;
      if (view.width === 0 || view.height === 0) return;

      const visible: Bounds = {
        minX: -viewport.scrollX,
        minY: -viewport.scrollY,
        maxX: -viewport.scrollX + width / viewport.zoom,
        maxY: -viewport.scrollY + height / viewport.zoom,
      };

      autoFitted.current = true;
      updateCamera(fitCamera(visible, view, 8, MAX_ZOOM));
    },
    [updateCamera]
  );

  // When the presenter's screen size is not known, follow what they write:
  // scroll (or zoom out) whenever their latest change is not fully visible.
  const followFocus = useCallback(
    (bounds: Bounds) => {
      const next = ensureVisible(cameraRef.current, sizeRef.current, bounds);
      if (!next) return;
      autoFitted.current = true;
      updateCamera(next);
    },
    [updateCamera]
  );

  useEffect(() => {
    viewportListener.current = (viewport) => {
      if (followingRef.current) followViewport(viewport);
    };
    focusListener.current = (bounds) => {
      if (followingRef.current && !presenterHasSize.current) followFocus(bounds);
    };

    return () => {
      viewportListener.current = null;
      focusListener.current = null;
    };
  }, [viewportListener, focusListener, followViewport, followFocus]);

  // When following starts (or resumes), jump to the presenter's view.
  useEffect(() => {
    if (!following) return;

    const latest = latestViewport.current;
    if (latest) followViewport(latest);

    // Without the presenter's screen size, start from an overview of the board.
    if (!presenterHasSize.current) {
      const bounds = computeBounds(elementsRef.current);
      const view = sizeRef.current;
      if (bounds && view.width > 0 && view.height > 0) {
        autoFitted.current = true;
        updateCamera(
          fitCamera(bounds, view, 24, Math.min(presenterZoom.current, 1.5))
        );
      }
    }
  }, [following, latestViewport, followViewport, updateCamera]);

  // Show the whole drawing the first time it appears.
  useEffect(() => {
    if (autoFitted.current || following) return;
    if (elements.length === 0 || size.width === 0 || size.height === 0) return;

    const bounds = computeBounds(elements);
    if (!bounds) return;

    autoFitted.current = true;
    updateCamera(fitCamera(bounds, size));
  }, [elements, size, following, updateCamera]);

  // One finger pans, two fingers pan and zoom. The point under the fingers
  // stays under the fingers (screen = (point + scroll) * zoom).
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          gesture.current = null;
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          const touches = event.nativeEvent.touches;
          if (touches.length === 0) return;

          const fingers = Math.min(touches.length, 2);
          const center = centerOf(touches);
          const distance = distanceOf(touches);
          const base = gesture.current;

          // New baseline whenever a finger is added or lifted.
          if (!base || base.fingers !== fingers) {
            gesture.current = {
              fingers,
              camera: cameraRef.current,
              centerX: center.x,
              centerY: center.y,
              distance,
            };
            return;
          }

          const factor =
            fingers === 2 && base.distance > 0 ? distance / base.distance : 1;

          // While following, a tap or a small wobble must not interrupt it.
          // A real drag or pinch pauses following, and "Follow" resumes it.
          if (followingRef.current) {
            const moved =
              Math.hypot(center.x - base.centerX, center.y - base.centerY) >
                MOVE_THRESHOLD || Math.abs(factor - 1) > 0.05;
            if (!moved) return;

            pauseFollowing();
            gesture.current = {
              fingers,
              camera: cameraRef.current,
              centerX: center.x,
              centerY: center.y,
              distance,
            };
            return;
          }

          autoFitted.current = true;

          const start = base.camera;
          const zoom = clamp(start.zoom * factor, MIN_ZOOM, MAX_ZOOM);
          const startPointX = base.centerX / start.zoom - start.scrollX;
          const startPointY = base.centerY / start.zoom - start.scrollY;

          updateCamera({
            zoom,
            scrollX: center.x / zoom - startPointX,
            scrollY: center.y / zoom - startPointY,
          });
        },
        onPanResponderRelease: () => {
          gesture.current = null;
        },
        onPanResponderTerminate: () => {
          gesture.current = null;
        },
      }),
    [updateCamera, pauseFollowing]
  );

  const handleFit = () => {
    const bounds = computeBounds(elements);
    if (!bounds || size.width === 0) return;
    autoFitted.current = true;
    pauseFollowing();
    updateCamera(fitCamera(bounds, size));
  };

  const handleZoom = (factor: number) => {
    autoFitted.current = true;
    pauseFollowing();
    updateCamera(zoomAroundCenter(cameraRef.current, factor, sizeRef.current));
  };

  // Jump to the area this person changed last (their viewport would only show
  // the top-left corner of what they see on a bigger screen).
  const handleJump = (ping: ActivityPing) => {
    pauseFollowing();
    autoFitted.current = true;

    const area = getLastEdit(ping.identity);
    if (area) {
      updateCamera(fitCamera(area, sizeRef.current, 32, cameraRef.current.zoom));
      return;
    }

    updateCamera({
      scrollX: ping.scrollX,
      scrollY: ping.scrollY,
      zoom: clamp(ping.zoom, MIN_ZOOM, MAX_ZOOM),
    });
  };

  // Elements only re-render when they change; panning just moves the group.
  const scene = useMemo(
    () =>
      elements.map((element) => (
        <WhiteboardElement
          key={element.id}
          element={element}
          imageData={element.fileId ? files[element.fileId] : undefined}
        />
      )),
    [elements, files]
  );

  return (
    <View
      className="flex-1 overflow-hidden bg-white"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      {/* Drawing area. The SVG ignores touches so this view receives them. */}
      <View className="absolute inset-0" {...responder.panHandlers}>
        <Svg width={size.width} height={size.height} pointerEvents="none">
          <G
            transform={`scale(${camera.zoom}) translate(${camera.scrollX}, ${camera.scrollY})`}
          >
            {scene}
          </G>
        </Svg>
      </View>

      {elements.length === 0 && (
        <View className="absolute inset-0 items-center justify-center px-8" pointerEvents="none">
          <Text className="text-center text-sm font-semibold text-gray-500">
            The whiteboard is empty
          </Text>
          <Text className="mt-1 text-center text-xs text-gray-400">
            Drawings made by other students will appear here. If someone has
            already drawn, it shows up after their next change.
          </Text>
        </View>
      )}

      {/* View-only note */}
      <View className="absolute left-3 top-3 rounded-full bg-gray-900/70 px-3 py-1" pointerEvents="none">
        <Text className="text-[11px] font-medium text-white">View only</Text>
      </View>

      {/* Presenter banner */}
      {!!presenter && (
        <View className="absolute left-0 right-0 top-3 items-center" pointerEvents="box-none">
          <View className="flex-row items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow">
            <Text className="mr-2 text-xs text-gray-700">
              {following ? "Following " : ""}
              <Text className="font-semibold">{presenter.name}</Text>
              {following ? "" : " is presenting"}
            </Text>

            <Pressable
              onPress={toggleFollow}
              className="rounded-full bg-primary-50 px-2.5 py-1"
            >
              <Text className="text-xs font-semibold text-primary-600">
                {following ? "Stop" : "Follow"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Someone is drawing elsewhere on the board */}
      {activity.length > 0 && (
        <View className="absolute bottom-3 right-3 items-end gap-2" pointerEvents="box-none">
          {activity.map((ping) => (
            <Pressable
              key={ping.identity}
              onPress={() => handleJump(ping)}
              className="flex-row items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow"
            >
              <View className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
              <Text className="text-xs font-medium text-gray-900">{ping.name}</Text>
              <Text className="ml-1 text-xs text-gray-500">is drawing</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Zoom controls. Using them while following pauses following. */}
      {elements.length > 0 && (
        <View className="absolute bottom-3 left-3 flex-row items-center rounded-full border border-gray-200 bg-white px-1 shadow">
          <Pressable onPress={() => handleZoom(1 / 1.25)} hitSlop={6} className="h-9 w-9 items-center justify-center">
            <Text className="text-lg text-gray-700">−</Text>
          </Pressable>

          <Text className="w-12 text-center text-xs text-gray-600">
            {Math.round(camera.zoom * 100)}%
          </Text>

          <Pressable onPress={() => handleZoom(1.25)} hitSlop={6} className="h-9 w-9 items-center justify-center">
            <Text className="text-lg text-gray-700">+</Text>
          </Pressable>

          <Pressable onPress={handleFit} hitSlop={6} className="ml-1 h-9 items-center justify-center rounded-full bg-primary-50 px-3">
            <Text className="text-xs font-semibold text-primary-600">Fit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
