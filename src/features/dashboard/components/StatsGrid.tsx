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

export default function StatsGrid({ data }: StatsGridProps) {
  return (
    <View className="gap-5">
      <View className="flex-row gap-5">
        <StatCard
          title="Study Material"
          value={data?.contentCount ?? 0}
          icon="book"
        />

        <StatCard
          title="Study Groups"
          value={data?.groupStudyCount ?? 0}
          icon="users"
        />
      </View>

      <View className="flex-row gap-5">
        <StatCard
          title="Live Classes"
          value={data?.liveClassCount ?? 0}
          icon="video"
        />

        <StatCard
          title="Subjects"
          value={data?.subjectCount ?? 0}
          icon="layers"
        />
      </View>
    </View>
  );
}
