import { useCallback, useEffect, useRef, useState } from "react";
import { getLiveClassByRoomName, joinLiveClass } from "../api/classroom.api";
import type { JoinLiveClassResponse } from "../types";
import type { LiveSession } from "@/features/live-class/types";

export type JoinStep =
  | "fetching_session"
  | "fetching_token"
  | "ready"
  | "error";

export function useClassRoomConnection(roomName: string) {
  const [step, setStep] = useState<JoinStep>("fetching_session");
  const [session, setSession] = useState<LiveSession | null>(null);
  const [joinData, setJoinData] = useState<JoinLiveClassResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | undefined>();
  const runId = useRef(0);

  const start = useCallback(async () => {
    const id = ++runId.current;
    setStep("fetching_session");
    setError(null);
    setStatusCode(undefined);
    setSession(null);
    setJoinData(null);

    try {
      // Same order as the web app: session (teacher identity) first, then join.
      const sessionData = await getLiveClassByRoomName(roomName);
      if (id !== runId.current) return;
      setSession(sessionData);
      setStep("fetching_token");

      const data = await joinLiveClass(roomName);
      if (id !== runId.current) return;
      setJoinData(data);
      setStep("ready");
    } catch (e: any) {
      if (id !== runId.current) return;
      setStatusCode(e?.response?.status);
      setError(
        e?.response?.data?.message ??
          "Could not connect to the live class. Please try again."
      );
      setStep("error");
    }
  }, [roomName]);

  useEffect(() => {
    start();
    return () => {
      runId.current += 1; // ignore results after unmount
    };
  }, [start]);

  return {
    step,
    session,
    teacher: session?.teacher ?? null,
    joinData,
    connection: joinData
      ? {
          token: joinData.liveKit.token,
          serverUrl: joinData.liveKit.serverURL,
          roomName: joinData.liveKit.roomName,
        }
      : null,
    participantRole: joinData?.liveClass.participantRole ?? null,
    classId: joinData?.liveClass.id ?? null,
    error,
    statusCode,
    retry: start,
  };
}