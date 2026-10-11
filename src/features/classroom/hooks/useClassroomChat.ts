import { useCallback, useEffect, useRef } from "react";
import { useRoomContext } from "@livekit/react-native";
import { RoomEvent } from "livekit-client";

import { useClassRoom } from "@/features/classroom/ClassRoomContext";
import type { ChatMessage } from "@/features/classroom/types";

const MESSAGE_TYPES: ChatMessage["type"][] = ["message", "question", "announcement"];
const TYPING_TIMEOUT_MS = 1500;

function isChatMessage(value: any): value is ChatMessage {
  return (
    !!value &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.senderId === "string" &&
    typeof value.senderName === "string" &&
    typeof value.content === "string" &&
    typeof value.timestamp === "number" &&
    MESSAGE_TYPES.includes(value.type)
  );
}

// Message ids are only used as list keys, so a simple unique id is enough.
function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useClassroomChat() {
  const room = useRoomContext();
  const { state, dispatch } = useClassRoom();
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  // Receive chat, question and announcement messages.
  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      let data: unknown;
      try {
        data = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }
      // Control messages (toggle-mic, toggle-video, ...) fail this check and are ignored.
      if (isChatMessage(data)) {
        dispatch({ type: "addMessage", payload: data });
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, dispatch]);

  const setTyping = useCallback(
    async (value: boolean) => {
      try {
        await room.localParticipant.setAttributes({
          typing: value ? "true" : "false",
        });
      } catch {
        // Ignore typing status failures.
      }
    },
    [room]
  );

  const notifyTyping = useCallback(() => {
    if (!isTyping.current) {
      isTyping.current = true;
      setTyping(true);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTyping.current = false;
      setTyping(false);
    }, TYPING_TIMEOUT_MS);
  }, [setTyping]);

  const send = useCallback(
    async (content: string, type: ChatMessage["type"]) => {
      const trimmed = content.trim();
      if (!trimmed) return false;

      const message: ChatMessage = {
        id: createId(),
        senderId: state.participantIdentity,
        senderName: room.localParticipant.name || "You",
        content: trimmed,
        timestamp: Date.now(),
        type,
      };

      // Show the message locally, then reset the typing indicator.
      dispatch({ type: "addMessage", payload: message });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      isTyping.current = false;
      await setTyping(false);

      try {
        await room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify(message)),
          { reliable: true }
        );
      } catch {
        // Publish failed silently, same as the web app.
      }
      return true;
    },
    [state.participantIdentity, room, dispatch, setTyping]
  );

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  return { send, notifyTyping };
}