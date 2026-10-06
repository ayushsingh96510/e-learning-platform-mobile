import { View } from "react-native";

import StatCard from "./StatCard";

interface StatsGridProps {
  data?: {
    contentCount?: number;
    groupStudyCount?: number;
    liveClassCount?: number;
    subjectCount?: number;
  };
}

export default function StatsGrid({
  data,
}: StatsGridProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatCard
          title="Study Material"
          value={data?.contentCount ?? 0}
          icon="📚"
        />

        <StatCard
          title="Study Groups"
          value={data?.groupStudyCount ?? 0}
          icon="👥"
        />
      </View>

      <View className="flex-row gap-3">
        <StatCard
          title="Live Classes"
          value={data?.liveClassCount ?? 0}
          icon="🎥"
        />

        <StatCard
          title="Subjects"
          value={data?.subjectCount ?? 0}
          icon="📖"
        />
      </View>
    </View>
  );
}