import { View } from "react-native";

import { useStageState } from "./useStageState";
import StageMessage from "./StageMessage";
import StagePlaying from "./StagePlaying";
import StageWaiting from "./StageWaiting";

export default function MainStage() {
  const { stageState } = useStageState();

  let content: React.ReactNode = null;
  switch (stageState) {
    case "CONNECTING":
      content = <StageMessage title="Connecting to the class..." loading />;
      break;
    case "WAITING":
      content = <StageWaiting />;
      break;
    case "REPLAY_PENDING":
      content = <StageMessage title="Waiting for the replay to start" loading />;
      break;
    case "BUFFERING":
      content = <StageMessage title="Loading video..." loading />;
      break;
    case "ERROR":
      content = <StageMessage title="Disconnected from the class" />;
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