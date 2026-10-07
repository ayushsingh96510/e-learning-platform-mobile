import { Text, View } from "react-native";
import { VideoTrack } from "@livekit/react-native";
import type { TrackReference } from "@livekit/react-native";

interface Props {
  trackRef: TrackReference;
  /** teacher | presenter | admin | student */
  type: string;
}

export default function VideoTile({ trackRef, type }: Props) {
  const name = trackRef.participant.name || trackRef.participant.identity;

  return (
    <View className="h-full w-full overflow-hidden rounded-xl bg-black">
      <VideoTrack
        trackRef={trackRef}
        style={{ width: "100%", height: "100%" }}
        objectFit="cover"
      />

      <View className="absolute bottom-2 left-2 max-w-[85%] flex-row items-center rounded-md bg-black/50 px-2 py-0.5">
        <Text className="shrink text-[11px] font-medium text-white" numberOfLines={1}>
          {name}
        </Text>
        <Text className="ml-1.5 text-[9px] font-semibold uppercase tracking-wide text-violet-300">
          {type}
        </Text>
      </View>
    </View>
  );
}