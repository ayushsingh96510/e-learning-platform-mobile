import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useStageState } from "./useStageState";
import StagePlaying from "./StagePlaying";
import StageWaiting from "./StageWaiting";
import {
  StageBuffering,
  StageConnecting,
  StageError,
  StageReplayPending,
} from "./StageStates";

interface Props {
  onRetry: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function MainStage({ onRetry, fullscreen, onToggleFullscreen }: Props) {
  const { stageState } = useStageState();

  let content: React.ReactNode = null;
  switch (stageState) {
    case "CONNECTING":
      content = <StageConnecting />;
      break;
    case "WAITING":
      content = <StageWaiting />;
      break;
    case "REPLAY_PENDING":
      content = <StageReplayPending />;
      break;
    case "BUFFERING":
      content = <StageBuffering />;
      break;
    case "ERROR":
      content = <StageError onRetry={onRetry} />;
      break;
    case "PLAYING":
      content = <StagePlaying />;
      break;
  }

  return (
    <View
      className={`w-full flex-1 overflow-hidden bg-white ${
        fullscreen ? "" : "rounded-xl border border-violet-200"
      }`}
    >
      {content}

      <Pressable
        onPress={onToggleFullscreen}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        className="absolute right-2 top-2 z-10 h-8 w-8 items-center justify-center rounded-lg bg-black/40"
      >
        <Ionicons name={fullscreen ? "contract" : "expand"} size={15} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}