import { Image, Text, View } from "react-native";

import { getAvatarInitials } from "@/features/classroom/utils";

interface Props {
  name: string;
  uri?: string;
  size?: number;
}

export default function Avatar({ name, uri, size = 36 }: Props) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-gray-100"
      style={{ width: size, height: size }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
      ) : (
        <Text
          className="font-medium text-gray-700"
          style={{ fontSize: Math.round(size * 0.33) }}
        >
          {getAvatarInitials(name)}
        </Text>
      )}
    </View>
  );
}