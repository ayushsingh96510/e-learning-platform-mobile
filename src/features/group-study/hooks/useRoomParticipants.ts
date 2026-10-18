import { useEffect, useState } from "react";
import { useRoomContext } from "@livekit/react-native";
import { RoomEvent } from "livekit-client";
import type { Participant, Room } from "livekit-client";

// Everything that can change what the participant list shows.
const REFRESH_EVENTS: RoomEvent[] = [
  RoomEvent.Connected,
  RoomEvent.ConnectionStateChanged,
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.ParticipantMetadataChanged,
  RoomEvent.ParticipantNameChanged,
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
  RoomEvent.TrackMuted,
  RoomEvent.TrackUnmuted,
  RoomEvent.LocalTrackPublished,
  RoomEvent.LocalTrackUnpublished,
  RoomEvent.ActiveSpeakersChanged,
];

function snapshot(room: Room): Participant[] {
  return [room.localParticipant, ...Array.from(room.remoteParticipants.values())];
}

/** Local participant first, then everyone else. Re-renders on any change. */
export function useRoomParticipants(): Participant[] {
  const room = useRoomContext();
  const [participants, setParticipants] = useState<Participant[]>(() =>
    snapshot(room)
  );

  useEffect(() => {
    const refresh = () => setParticipants(snapshot(room));
    const listener = refresh as (...args: any[]) => void;

    REFRESH_EVENTS.forEach((event) => room.on(event, listener));
    refresh();

    return () => {
      REFRESH_EVENTS.forEach((event) => room.off(event, listener));
    };
  }, [room]);

  return participants;
}
