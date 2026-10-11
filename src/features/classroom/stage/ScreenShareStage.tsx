import { Text, View } from "react-native";
import { VideoTrack } from "@livekit/react-native";
import type { TrackReference } from "@livekit/react-native";

export default function ScreenShareStage({ tracks }: { tracks: TrackReference[] }) {
  const track = tracks[0];
  if (!track) return null;

  return (
    <View className="h-full w-full bg-black/40">
      <VideoTrack
        trackRef={track}
        style={{ width: "100%", height: "100%" }}
        objectFit="contain"
      />
      <View className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1">
        <Text className="text-xs font-medium text-white">🖥 Screen Share</Text>
      </View>
    </View>
  );
}