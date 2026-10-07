import { useMemo } from "react";
import { useParticipants, useTracks } from "@livekit/react-native";
import type { TrackReference } from "@livekit/react-native";
import { Track } from "livekit-client";

import { useClassRoom } from "../ClassRoomContext";
import { extractAvatar } from "../utils";

export type StageRole = "TEACHER" | "ADMIN" | "STUDENT";

export interface StageSeat {
  /** LiveKit identity. Null only for the teacher placeholder. */
  identity: string | null;
  name: string;
  profileImage?: string;
  role: StageRole;
  trackReference: TrackReference | null;
  isCameraOn: boolean;
  isTeacherPlaceholder: boolean;
  isSpeaking: boolean;
  cameraOnAt: number;
}

export interface PresenterMediaState {
  isPresenterJoined: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  screenShareTracks: TrackReference[];
  stageSeats: StageSeat[];
}

const EMPTY: PresenterMediaState = {
  isPresenterJoined: false,
  isCameraOn: false,
  isMicOn: false,
  screenShareTracks: [],
  stageSeats: [],
};

const ROLE_ORDER: Record<StageRole, number> = {
  TEACHER: 0,
  ADMIN: 1,
  STUDENT: 2,
};

export function usePresenterMediaState(): PresenterMediaState {
  const { state } = useClassRoom();
  const {
    presenter,
    participantRole: myRole,
    participantIdentity: myIdentity,
  } = state;
  const presenterIdentity = presenter?.identity ?? null;

  const participants = useParticipants();
  const mediaTracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: true },
    ],
    { onlySubscribed: false }
  );

  return useMemo(() => {
    if (!presenterIdentity) return EMPTY;

    const isPresenterJoined = participants.some(
      (p) => p.identity === presenterIdentity
    );

    const isAdminParticipant = (p: {
      identity?: string;
      metadata?: string;
      attributes?: Record<string, string>;
    }) => {
      if (p.identity === myIdentity && myRole === "ADMIN") return true;
      if (p.attributes?.role === "ADMIN") return true;
      if (!p.metadata) return false;
      try {
        return JSON.parse(p.metadata).role === "ADMIN";
      } catch {
        return false;
      }
    };

    const cameraRefById = new Map<string, TrackReference>();
    for (const track of mediaTracks) {
      if (
        track.source === Track.Source.Camera &&
        track.publication !== undefined &&
        track.participant.identity
      ) {
        cameraRefById.set(track.participant.identity, track as TrackReference);
      }
    }

    const realSeats: StageSeat[] = [];
    for (const p of participants) {
      if (!p.identity) continue;

      const isTeacher =
        p.identity === presenterIdentity ||
        (p.identity === myIdentity && myRole === "TEACHER");
      const isAdmin = isAdminParticipant(p);

      let role: StageRole = "STUDENT";
      let hasSeat: boolean;
      if (isTeacher) {
        role = "TEACHER";
        hasSeat = p.isCameraEnabled || p.isMicrophoneEnabled;
      } else if (isAdmin) {
        role = "ADMIN";
        hasSeat = p.isCameraEnabled || p.isMicrophoneEnabled;
      } else {
        hasSeat = p.isCameraEnabled;
      }
      if (!hasSeat) continue;

      realSeats.push({
        identity: p.identity,
        name: p.name || p.identity,
        profileImage: extractAvatar(p.metadata),
        role,
        trackReference: cameraRefById.get(p.identity) ?? null,
        isCameraOn: p.isCameraEnabled,
        isTeacherPlaceholder: false,
        isSpeaking: p.isSpeaking,
        cameraOnAt: Number(p.attributes?.cameraOnAt || 0),
      });
    }

    realSeats.sort((a, b) => {
      if (ROLE_ORDER[a.role] !== ROLE_ORDER[b.role]) {
        return ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
      }
      return b.cameraOnAt - a.cameraOnAt;
    });

    // The teacher placeholder only exists when someone else is already on stage.
    const teacherPlaceholder: StageSeat | null =
      !isPresenterJoined && realSeats.length > 0
        ? {
            identity: null,
            name: presenter?.name || "Teacher",
            profileImage: presenter?.profileImage,
            role: "TEACHER",
            trackReference: null,
            isCameraOn: false,
            isTeacherPlaceholder: true,
            isSpeaking: false,
            cameraOnAt: 0,
          }
        : null;

    const stageSeats = teacherPlaceholder
      ? [teacherPlaceholder, ...realSeats]
      : realSeats;

    const screenShareTracks = mediaTracks.filter(
      (t): t is TrackReference =>
        t.source === Track.Source.ScreenShare && t.publication !== undefined
    );

    const cameraTracks = mediaTracks.filter(
      (t): t is TrackReference =>
        t.participant.identity === presenterIdentity &&
        t.source === Track.Source.Camera &&
        t.publication !== undefined
    );
    const micTracks = mediaTracks.filter(
      (t) =>
        t.participant.identity === presenterIdentity &&
        t.source === Track.Source.Microphone
    );
    const cameraPublication = cameraTracks[0]?.publication;
    const micPublication = micTracks[0]?.publication;

    return {
      isPresenterJoined,
      isCameraOn:
        cameraTracks.length > 0 &&
        !cameraPublication?.isMuted &&
        !cameraPublication?.trackInfo?.muted,
      isMicOn:
        micTracks.length > 0 &&
        !micPublication?.isMuted &&
        !micPublication?.trackInfo?.muted,
      screenShareTracks,
      stageSeats,
    };
  }, [participants, mediaTracks, presenter, presenterIdentity, myRole, myIdentity]);
}