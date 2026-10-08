import { useEffect, useRef, useState } from "react";
import type { LocalParticipant, RemoteParticipant } from "livekit-client";

const SPEAK_START_THRESHOLD = 0.05; // audioLevel above this counts as speaking
const SPEAK_STOP_DELAY = 900; // ms of silence before a speaker is dropped
const SWITCH_COOLDOWN = 600; // ms before the active speaker can change
const FADE_DURATION = 300;
const TICK_MS = 100;

export function useSingleSpeakerSystem(
  participants: (RemoteParticipant | LocalParticipant)[],
  teacherId?: string
) {
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  const lastAudioRef = useRef<Map<string, number>>(new Map());
  const lastSwitchRef = useRef(0);
  const activeSpeakerRef = useRef<string | null>(null);
  const participantsRef = useRef(participants);
  const teacherIdRef = useRef(teacherId);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    teacherIdRef.current = teacherId;
  }, [teacherId]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const tid = teacherIdRef.current;
      const canSwitch = now - lastSwitchRef.current > SWITCH_COOLDOWN;

      // 1. Update last-active timestamps.
      for (const p of participantsRef.current) {
        if (!p.identity) continue;
        const speaking = p.isSpeaking || (p.audioLevel ?? 0) > SPEAK_START_THRESHOLD;
        if (speaking) lastAudioRef.current.set(p.identity, now);
      }

      // 2. Drop speakers who have been silent for too long.
      for (const [id, time] of lastAudioRef.current.entries()) {
        if (now - time > SPEAK_STOP_DELAY) lastAudioRef.current.delete(id);
      }

      // 3. Teacher first, then the most recent speaker.
      const speakers = [...lastAudioRef.current.keys()].sort((a, b) => {
        if (a === tid) return -1;
        if (b === tid) return 1;
        return (
          (lastAudioRef.current.get(b) ?? 0) - (lastAudioRef.current.get(a) ?? 0)
        );
      });
      const next = speakers[0] ?? null;
      const current = activeSpeakerRef.current;

      // The teacher can override the cooldown.
      const isTeacherOverride = next === tid && current !== tid;
      if (next !== current && (isTeacherOverride || canSwitch)) {
        activeSpeakerRef.current = next;
        setActiveSpeaker(next);
        lastSwitchRef.current = now;
      }
    };

    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return { activeSpeaker, fadeDuration: FADE_DURATION };
}