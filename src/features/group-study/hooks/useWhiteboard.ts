import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoomContext } from "@livekit/react-native";
import { RoomEvent } from "livekit-client";
import type { RemoteParticipant } from "livekit-client";

import type {
  ActivityPing,
  Presenter,
  ViewportState,
  WhiteboardElement,
} from "../types";
import { isFiniteNumber } from "../utils/whiteboard";

// Redraw at most this often, however many messages arrive.
const FLUSH_MS = 80;
// An "is drawing" badge disappears after this long without a new ping.
const ACTIVITY_TTL_MS = 5000;

type StampedPing = ActivityPing & { updatedAt: number };

interface IncomingImage {
  chunks: (string | undefined)[];
  received: number;
}

/**
 * Receives the shared whiteboard (view only), using the same data messages as
 * the web app: whiteboard elements, image file chunks, presenter status,
 * presenter viewport and "is drawing" pings.
 */
export function useWhiteboard() {
  const room = useRoomContext();

  const elementsRef = useRef(new Map<string, WhiteboardElement>());
  const filesRef = useRef<Record<string, string>>({});
  const incomingImages = useRef<Record<string, IncomingImage>>({});
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tick, setTick] = useState(0);

  const [presenter, setPresenter] = useState<Presenter | null>(null);
  const presenterRef = useRef<Presenter | null>(null);
  const [following, setFollowing] = useState(false);
  const [pings, setPings] = useState<Record<string, StampedPing>>({});

  // Viewport updates arrive about 8 times a second while someone presents, so
  // they go straight to the board instead of through React state.
  const latestViewport = useRef<ViewportState | null>(null);
  const viewportListener = useRef<((viewport: ViewportState) => void) | null>(null);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return;
    flushTimer.current = setTimeout(() => {
      flushTimer.current = null;
      setTick((value) => value + 1);
    }, FLUSH_MS);
  }, []);

  // Asks the presenter to send their current viewport right away.
  const requestViewport = useCallback(() => {
    room.localParticipant
      .publishData(
        new TextEncoder().encode(
          JSON.stringify({
            type: "viewport-request",
            requesterIdentity: room.localParticipant.identity,
          })
        ),
        { reliable: true }
      )
      .catch(() => undefined);
  }, [room]);

  useEffect(() => {
    // Same rule as the web app: the higher version of an element always wins.
    const mergeElements = (incoming: unknown) => {
      if (!Array.isArray(incoming)) return;

      const map = elementsRef.current;
      let changed = false;

      for (const raw of incoming) {
        if (!raw || typeof raw.id !== "string") continue;

        const existing = map.get(raw.id);
        if (!existing || (raw.version ?? 0) > (existing.version ?? 0)) {
          map.set(raw.id, raw as WhiteboardElement);
          changed = true;
        }
      }

      if (changed) scheduleFlush();
    };

    const handleImageChunk = (msg: any) => {
      const { fileId, chunkIndex, totalChunks, data } = msg;
      if (
        typeof fileId !== "string" ||
        typeof data !== "string" ||
        !Number.isInteger(totalChunks) ||
        totalChunks <= 0 ||
        !Number.isInteger(chunkIndex) ||
        chunkIndex < 0 ||
        chunkIndex >= totalChunks ||
        filesRef.current[fileId]
      ) {
        return;
      }

      let entry = incomingImages.current[fileId];
      if (!entry) {
        entry = { chunks: new Array(totalChunks).fill(undefined), received: 0 };
        incomingImages.current[fileId] = entry;
      }

      if (entry.chunks[chunkIndex] === undefined) {
        entry.chunks[chunkIndex] = data;
        entry.received += 1;
      }

      if (entry.received < entry.chunks.length) return;

      filesRef.current[fileId] = entry.chunks.join("");
      delete incomingImages.current[fileId];
      scheduleFlush();
    };

    const handleData = (payload: Uint8Array) => {
      let msg: any;
      try {
        msg = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }

      switch (msg?.type) {
        case "whiteboard":
          mergeElements(msg.elements);
          break;

        case "file-chunk":
          handleImageChunk(msg);
          break;

        case "presenter-status": {
          const status = msg.status;
          if (!status || typeof status.identity !== "string") break;

          if (status.presenting) {
            const next: Presenter = {
              identity: status.identity,
              name: status.name || status.identity,
            };
            presenterRef.current = next;
            latestViewport.current = null;
            setPresenter(next);
            setFollowing(true);
            requestViewport();
          } else if (status.identity === presenterRef.current?.identity) {
            presenterRef.current = null;
            latestViewport.current = null;
            setPresenter(null);
            setFollowing(false);
          }
          break;
        }

        case "viewport": {
          const v = msg.viewport;
          if (!v || v.identity !== presenterRef.current?.identity) break;
          if (
            !isFiniteNumber(v.scrollX) ||
            !isFiniteNumber(v.scrollY) ||
            !isFiniteNumber(v.zoom)
          ) {
            break;
          }

          const viewport: ViewportState = {
            scrollX: v.scrollX,
            scrollY: v.scrollY,
            zoom: v.zoom,
          };
          latestViewport.current = viewport;
          viewportListener.current?.(viewport);
          break;
        }

        case "activity": {
          const a = msg.activity;
          if (
            !a ||
            typeof a.identity !== "string" ||
            !isFiniteNumber(a.scrollX) ||
            !isFiniteNumber(a.scrollY) ||
            !isFiniteNumber(a.zoom)
          ) {
            break;
          }

          setPings((prev) => ({
            ...prev,
            [a.identity]: {
              identity: a.identity,
              name: a.name || a.identity,
              scrollX: a.scrollX,
              scrollY: a.scrollY,
              zoom: a.zoom,
              updatedAt: Date.now(),
            },
          }));
          break;
        }

        default:
          break;
      }
    };

    const handleLeft = (participant: RemoteParticipant) => {
      if (presenterRef.current?.identity === participant.identity) {
        presenterRef.current = null;
        latestViewport.current = null;
        setPresenter(null);
        setFollowing(false);
      }

      setPings((prev) => {
        if (!(participant.identity in prev)) return prev;
        const next = { ...prev };
        delete next[participant.identity];
        return next;
      });
    };

    room.on(RoomEvent.DataReceived, handleData);
    room.on(RoomEvent.ParticipantDisconnected, handleLeft);

    // Badges expire on their own once someone stops drawing.
    const expiry = setInterval(() => {
      setPings((prev) => {
        const now = Date.now();
        let changed = false;
        const next: Record<string, StampedPing> = {};

        for (const [identity, ping] of Object.entries(prev)) {
          if (now - ping.updatedAt < ACTIVITY_TTL_MS) next[identity] = ping;
          else changed = true;
        }

        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      room.off(RoomEvent.DataReceived, handleData);
      room.off(RoomEvent.ParticipantDisconnected, handleLeft);
      clearInterval(expiry);
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
        flushTimer.current = null;
      }
    };
  }, [room, scheduleFlush, requestViewport]);

  // `tick` marks that the refs above have new data.
  /* eslint-disable react-hooks/exhaustive-deps */
  const elements = useMemo(
    () => Array.from(elementsRef.current.values()).filter((el) => !el.isDeleted),
    [tick]
  );
  const files = useMemo(() => ({ ...filesRef.current }), [tick]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Everyone who is drawing, except the presenter (who has the follow banner).
  const activity = useMemo(
    () => Object.values(pings).filter((ping) => ping.identity !== presenter?.identity),
    [pings, presenter]
  );

  const toggleFollow = useCallback(() => {
    const next = !following;
    setFollowing(next);
    if (next) requestViewport();
  }, [following, requestViewport]);

  return {
    elements,
    files,
    presenter,
    following,
    toggleFollow,
    activity,
    latestViewport,
    viewportListener,
  };
}

export type WhiteboardState = ReturnType<typeof useWhiteboard>;
