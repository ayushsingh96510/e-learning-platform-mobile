import type { Participant } from "livekit-client";

export function getInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "?";
}

/** The backend marks the room creator in the LiveKit participant metadata. */
export function isRoomCreator(participant: Participant): boolean {
  try {
    const metadata = JSON.parse(participant.metadata || "{}");
    return !!metadata?.roomCreator;
  } catch {
    return false;
  }
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
