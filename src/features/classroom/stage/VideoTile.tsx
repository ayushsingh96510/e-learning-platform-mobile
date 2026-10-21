import { Text, View } from "react-native";
import { VideoTrack } from "@livekit/react-native";
import type { TrackReference } from "@livekit/react-native";

interface Props {
  trackRef: TrackReference;
  type: string;
}

export default function VideoTile({ trackRef, type }: Props) {
  const name = trackRef.participant.name || trackRef.participant.identity;

  return (
    <View className="h-full w-full min-w-0 overflow-hidden rounded-xl bg-black">
      <VideoTrack
        trackRef={trackRef}
        style={{ flex: 1, width: "100%", height: "100%" }}
        objectFit="cover"
        zOrder={1}
      />

      <View pointerEvents="none" className="absolute bottom-2 left-2 max-w-[85%] flex-row items-center rounded-md bg-black/60 px-2 py-1">
        <Text numberOfLines={1} className="shrink text-[11px] font-medium text-white"> {name} </Text>
        <Text className="ml-1.5 text-[9px] font-semibold uppercase text-violet-300"> {type} </Text>
      </View>
    </View>
  );
}
