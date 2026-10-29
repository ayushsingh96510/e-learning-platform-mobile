import { ScrollView, Text, View } from "react-native";

import { useAuth } from "../../auth/AuthContext";
import DashboardHeader from "../components/DashboardHeader";
import StatsGrid from "../components/StatsGrid";
// import NextClassCard from "../components/NextClassCard";
import RecentActivity from "../components/RecentActivity";
import { useDashboard } from "../hooks/useDashboard";
import { useNavigation } from "@react-navigation/native";
import ActiveLiveClasses from "../components/ActiveLiveClasses";
import MyStudyRooms from "../components/MyStudyRooms";
import NextUpcomingLiveClass from "../components/NextUpcomingLiveClass";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const {
    stats,
    liveClasses,
    contents,
    groupStudies,
    loading,
    error,
  } = useDashboard();
  console.log("groupStudies", JSON.stringify(groupStudies, null, 2));

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 px-4 pt-6">
        <View className="h-8 w-52 rounded-lg bg-gray-200" />

        <View className="mt-2 h-4 w-64 rounded bg-gray-200" />

        <View className="mt-6 gap-3">
          <View className="h-32 rounded-2xl bg-gray-200" />
          <View className="h-32 rounded-2xl bg-gray-200" />
        </View>

        <View className="mt-6 h-48 rounded-2xl bg-gray-200" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-center text-base text-red-600">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 pb-8 pt-6"
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader
        name={user?.personalInfo?.name}
        profileImage={user?.personalInfo?.profileImage}
        onProfilePress={() => {navigation.getParent()?.navigate("Profile");
        }}
      />

      <StatsGrid data={stats?.data?.counts} />

      <ActiveLiveClasses userName={user?.personalInfo?.name} />

      <MyStudyRooms
        rooms={groupStudies?.data ?? []}
      />

      <NextUpcomingLiveClass />

      {/* <View className="mt-6">
        <NextClassCard
          liveClass={
            liveClasses?.data?.status === "SCHEDULED"
              ? liveClasses.data
              : null
          }
          onPress={() => {
            // Live class navigation will be added later.
          }}
        />
      </View> */}

      <View className="mt-6">
        <RecentActivity contents={contents} />
      </View>
    </ScrollView>
  );
}