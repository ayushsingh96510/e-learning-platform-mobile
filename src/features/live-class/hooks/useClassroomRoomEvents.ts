import { useEffect } from "react";
import { useRoomContext } from "@livekit/react-native";
import { RoomEvent } from "livekit-client";

export function useClassroomRoomEvents(onClassEnded: () => void) {
  const room = useRoomContext();

  useEffect(() => {
    const handleData = async (payload: Uint8Array) => {
      let data: any;
      try {
        data = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }

      const me = room.localParticipant.identity;

      if (data.type === "CAMERA_OFF_ALL" && data.targetStudentId === me) {
        await room.localParticipant.setCameraEnabled(false);
      }

      if (data.type === "toggle-mic" && data.targetId === me) {
        await room.localParticipant.setMicrophoneEnabled(!!data.enabled);
      }

      if (data.type === "toggle-video" && data.targetId === me) {
        await Promise.all([
          room.localParticipant.setCameraEnabled(!!data.enabled),
          room.localParticipant.setAttributes({
            cameraOnAt: Date.now().toString(),
          }),
        ]);
      }
    };

    const handleMetadata = (metadata: string) => {
      try {
        const data = JSON.parse(metadata);
        if (data.status === "ENDED") {
          room.disconnect();
          onClassEnded();
        }
      } catch {
        // Ignore metadata that is not JSON.
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    room.on(RoomEvent.RoomMetadataChanged, handleMetadata);

    return () => {
      room.off(RoomEvent.DataReceived, handleData);
      room.off(RoomEvent.RoomMetadataChanged, handleMetadata);
    };
  }, [room, onClassEnded]);
}