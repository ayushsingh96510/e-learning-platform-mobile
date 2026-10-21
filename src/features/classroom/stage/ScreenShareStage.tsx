import { Text, View } from "react-native";
import { VideoTrack } from "@livekit/react-native";
import type { TrackReference } from "@livekit/react-native";

export default function ScreenShareStage({ tracks }: { tracks: TrackReference[]; }) {
  const track = tracks[0];
  if (!track) return null;

  return (
    <View className="h-full w-full flex-1 min-w-0 overflow-hidden bg-black">
      <VideoTrack
        trackRef={track}
        style={{ width: "100%", height: "100%", flex: 1, }}
        objectFit="contain"
        zOrder={0}
      />
      <View className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1">
        <Text className="text-xs font-medium text-white">🖥 Screen Share</Text>
      </View>
    </View>
  );
}