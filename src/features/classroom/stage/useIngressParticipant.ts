import { useEffect } from "react";
import { useParticipants } from "@livekit/react-native";

import { useClassRoom } from "../ClassRoomContext";

/**
 * For REPLAY classes the presenter starts with a null identity.
 * Find the ingress participant (metadata type "REPLAY") and make it the presenter.
 */
export function useIngressParticipant() {
  const participants = useParticipants();
  const { state, dispatch } = useClassRoom();
  const presenter = state.presenter;

  useEffect(() => {
    if (presenter?.type !== "REPLAY" || presenter?.identity) return;

    const ingress = participants.find((p) => {
      try {
        if (!p.metadata) return false;
        return JSON.parse(p.metadata).type === "REPLAY";
      } catch {
        return false;
      }
    });

    if (ingress) {
      dispatch({
        type: "setPresenter",
        payload: {
          identity: ingress.identity,
          type: "REPLAY",
          name: ingress.name || "Replay Session",
        },
      });
    }
  }, [participants, presenter?.type, presenter?.identity, dispatch]);
}