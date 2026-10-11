import { useMemo } from "react";
import { useConnectionState } from "@livekit/react-native";
import { ConnectionState } from "livekit-client";

import { useClassRoom } from "../ClassRoomContext";
import { usePresenterMediaState } from "./usePresenterMediaState";

export type StageState =
  | "CONNECTING"
  | "WAITING"
  | "REPLAY_PENDING"
  | "BUFFERING"
  | "PLAYING"
  | "ERROR";

export function useStageState() {
  const connectionState = useConnectionState();
  const { state } = useClassRoom();
  const presenterType = state.presenter?.type;

  const { isPresenterJoined, isCameraOn, stageSeats, screenShareTracks } =
    usePresenterMediaState();

  const hasStageContent = stageSeats.length > 0 || screenShareTracks.length > 0;

  const stageState = useMemo<StageState>(() => {
    if (connectionState === ConnectionState.Disconnected) return "ERROR";
    if (connectionState !== ConnectionState.Connected) return "CONNECTING";

    if (!isPresenterJoined && !hasStageContent) {
      if (presenterType === "REPLAY") return "REPLAY_PENDING";
      return "WAITING";
    }

    if (!hasStageContent) return "BUFFERING";
    return "PLAYING";
  }, [connectionState, presenterType, isPresenterJoined, hasStageContent]);

  return { stageState, isPresenterJoined, isCameraOn };
}