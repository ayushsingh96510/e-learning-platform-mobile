import { ActivityIndicator, Text, View } from "react-native";

interface Props {
  title: string;
  subtitle?: string;
  loading?: boolean;
}

export default function StageMessage({ title, subtitle, loading }: Props) {
  return (
    <View className="h-full w-full items-center justify-center gap-2 p-4">
      {loading ? <ActivityIndicator color="#8B5CF6" /> : null}
      <Text className="text-center text-sm font-medium text-slate-700">{title}</Text>
      {subtitle ? (
        <Text className="text-center text-xs text-slate-400">{subtitle}</Text>
      ) : null}
    </View>
  );
}