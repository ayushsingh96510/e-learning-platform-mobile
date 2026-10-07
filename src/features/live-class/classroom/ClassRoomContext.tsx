import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  ChatMessage,
  ChatTab,
  ITeacherIdentity,
  ParticipantRole,
  PresenterIdentity,
} from "./types";

export interface ClassRoomState {
  roomName: string;
  title: string | null;
  classId: string;
  participantRole: ParticipantRole;
  participantIdentity: string;
  teacherIdentity: ITeacherIdentity | null;
  /** The participant currently occupying the main stage. */
  presenter: PresenterIdentity | null;
  recordedVideoId: string | null;
  isConnected: boolean;
  activeTab: ChatTab;
  handRaised: boolean;
  messages: ChatMessage[];
  isRecording: boolean;
  participantCount: number;
  isChatEnabled: boolean;
}

export type ClassRoomAction =
  | { type: "setConnected"; payload: boolean }
  | { type: "setActiveTab"; payload: ChatTab }
  | { type: "setHandRaised"; payload: boolean }
  | { type: "addMessage"; payload: ChatMessage }
  | { type: "setRecording"; payload: boolean }
  | { type: "setPresenter"; payload: PresenterIdentity }
  | { type: "clearPresenter" }
  | { type: "setParticipantCount"; payload: number };

export interface ClassRoomInit {
  roomName: string;
  title: string | null;
  classId: string;
  participantRole: ParticipantRole;
  participantIdentity: string;
  deliveryMode: string;
  teacher: ITeacherIdentity | null;
  recordedVideoId: string | null;
  isChatEnabled: boolean;
}

// Same rule as the web useLiveClassRoom hook.
function buildPresenter(
  deliveryMode: string,
  teacher: ITeacherIdentity | null
): PresenterIdentity | null {
  if (deliveryMode === "REPLAY") {
    return { identity: null, type: "REPLAY", name: "Replay Session" };
  }
  if (teacher) {
    return {
      identity: teacher.id,
      type: "TEACHER",
      name: teacher.name,
      profileImage: teacher.profileImage,
    };
  }
  return null;
}

function createInitialState(init: ClassRoomInit): ClassRoomState {
  return {
    roomName: init.roomName,
    title: init.title,
    classId: init.classId,
    participantRole: init.participantRole,
    participantIdentity: init.participantIdentity,
    teacherIdentity: init.teacher,
    presenter: buildPresenter(init.deliveryMode, init.teacher),
    recordedVideoId: init.recordedVideoId,
    isConnected: false,
    activeTab: "chat",
    handRaised: false,
    messages: [],
    isRecording: false,
    participantCount: 0,
    isChatEnabled: init.isChatEnabled,
  };
}

function reducer(state: ClassRoomState, action: ClassRoomAction): ClassRoomState {
  switch (action.type) {
    case "setConnected":
      return { ...state, isConnected: action.payload };
    case "setActiveTab":
      return { ...state, activeTab: action.payload };
    case "setHandRaised":
      return { ...state, handRaised: action.payload };
    case "addMessage":
        if (state.messages.some((m) => m.id === action.payload.id)) return state;
    return { ...state, messages: [...state.messages, action.payload] };
    case "setRecording":
      return { ...state, isRecording: action.payload };
    case "setPresenter":
      return { ...state, presenter: action.payload };
    case "clearPresenter":
      return { ...state, presenter: null };
    case "setParticipantCount":
      return { ...state, participantCount: action.payload };
    default:
      return state;
  }
}

interface ClassRoomContextValue {
  state: ClassRoomState;
  dispatch: Dispatch<ClassRoomAction>;
}

const ClassRoomContext = createContext<ClassRoomContextValue | null>(null);

export function ClassRoomProvider({
  init,
  children,
}: {
  init: ClassRoomInit;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, init, createInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <ClassRoomContext.Provider value={value}>
      {children}
    </ClassRoomContext.Provider>
  );
}

export function useClassRoom() {
  const ctx = useContext(ClassRoomContext);
  if (!ctx) {
    throw new Error("useClassRoom must be used inside ClassRoomProvider");
  }
  return ctx;
}