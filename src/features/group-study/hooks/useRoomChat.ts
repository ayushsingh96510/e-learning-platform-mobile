import { useCallback, useEffect, useState } from "react";
import { useRoomContext } from "@livekit/react-native";
import { RoomEvent } from "livekit-client";
import type { ChatMessage } from "../types";
import { createId } from "../utils/participants";

function isChatMessage(value: any): value is ChatMessage {
  return (
    !!value &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.senderId === "string" &&
    typeof value.senderName === "string" &&
    typeof value.message === "string" &&
    typeof value.timestamp === "number"
  );
}

/**
 * Room chat over the LiveKit data channel, compatible with the web app:
 * { type: "chat", chat: { id, senderId, senderName, message, timestamp } }.
 * Messages are not stored, so people who join later do not see earlier ones.
 */
export function useRoomChat() {
  const room = useRoomContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data?.type !== "chat" || !isChatMessage(data.chat)) return;

        const chat: ChatMessage = data.chat;
        setMessages((prev) =>
          prev.some((m) => m.id === chat.id) ? prev : [...prev, chat]
        );
      } catch {
        // Ignore data that is not JSON (whiteboard and file messages, etc.).
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const chat: ChatMessage = {
        id: createId(),
        senderId: room.localParticipant.identity,
        senderName:
          room.localParticipant.name || room.localParticipant.identity,
        message: trimmed,
        timestamp: Date.now(),
      };

      // Show it right away; LiveKit does not echo our own data back to us.
      setMessages((prev) => [...prev, chat]);

      try {
        await room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify({ type: "chat", chat })),
          { reliable: true }
        );
      } catch {
        // Publish failed silently, same as the web app.
      }

      return true;
    },
    [room]
  );

  return { messages, send };
}
