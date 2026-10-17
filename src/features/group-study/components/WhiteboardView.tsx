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
  fitCamera,
  zoomAroundCenter,
} from "../utils/whiteboard";
import type { Camera, Size } from "../utils/whiteboard";

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
    activity,
    latestViewport,
    viewportListener,
  } = whiteboard;

  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [camera, setCamera] = useState<Camera>({ scrollX: 0, scrollY: 0, zoom: 1 });

  const cameraRef = useRef(camera);
  const sizeRef = useRef(size);
  const followingRef = useRef(following);
  const autoFitted = useRef(false);
  const gesture = useRef<GestureBase | null>(null);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    followingRef.current = following;
  }, [following]);

  const updateCamera = useCallback((next: Camera) => {
    cameraRef.current = next;
    setCamera(next);
  }, []);

  const applyViewport = useCallback(
    (viewport: ViewportState) => {
      autoFitted.current = true;
      updateCamera({
        scrollX: viewport.scrollX,
        scrollY: viewport.scrollY,
        zoom: clamp(viewport.zoom, MIN_ZOOM, MAX_ZOOM),
      });
    },
    [updateCamera]
  );

  // Follow the presenter's view while "following" is on.
  useEffect(() => {
    viewportListener.current = (viewport) => {
      if (followingRef.current) applyViewport(viewport);
    };
    return () => {
      viewportListener.current = null;
    };
  }, [viewportListener, applyViewport]);

  useEffect(() => {
    if (following && latestViewport.current) applyViewport(latestViewport.current);
  }, [following, latestViewport, applyViewport]);

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
        onStartShouldSetPanResponder: () => !followingRef.current,
        onMoveShouldSetPanResponder: () => !followingRef.current,
        onPanResponderGrant: () => {
          autoFitted.current = true;
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

          const start = base.camera;
          const factor = fingers === 2 && base.distance > 0 ? distance / base.distance : 1;
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
    [updateCamera]
  );

  const handleFit = () => {
    const bounds = computeBounds(elements);
    if (!bounds || size.width === 0) return;
    autoFitted.current = true;
    updateCamera(fitCamera(bounds, size));
  };

  const handleZoom = (factor: number) => {
    autoFitted.current = true;
    updateCamera(zoomAroundCenter(cameraRef.current, factor, sizeRef.current));
  };

  const handleJump = (ping: ActivityPing) => {
    applyViewport({ scrollX: ping.scrollX, scrollY: ping.scrollY, zoom: ping.zoom });
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
              {following ? "Following" : "Not following"}{" "}
              <Text className="font-semibold">{presenter.name}</Text>
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

      {/* Zoom controls (not shown while following, because the presenter controls the view) */}
      {!following && elements.length > 0 && (
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
