import { View } from "react-native";

import { useStageState } from "./useStageState";
import StagePlaying from "./StagePlaying";
import StageWaiting from "./StageWaiting";
import {
  StageBuffering,
  StageConnecting,
  StageError,
  StageReplayPending,
} from "./StageStates";

export default function MainStage({ onRetry }: { onRetry: () => void }) {
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
      className="w-full overflow-hidden rounded-xl border border-violet-200 bg-white"
      style={{ aspectRatio: 16 / 9 }}
    >
      {content}
    </View>
  );
}