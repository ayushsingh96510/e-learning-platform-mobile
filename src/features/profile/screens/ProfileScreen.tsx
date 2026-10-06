import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-xl text-gray-900">‹</Text>
          </Pressable>

          <Text className="text-2xl font-bold text-gray-900">
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View className="rounded-2xl border border-gray-100 bg-white p-5">
          <View className="items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <Text className="text-3xl">👤</Text>
            </View>

            <Text className="mt-4 text-xl font-bold text-gray-900">
              {user?.name || "Student"}
            </Text>

            <Text className="mt-1 text-sm text-gray-500">
              {user?.email || ""}
            </Text>

            <View className="mt-3 rounded-full bg-primary-50 px-4 py-2">
              <Text className="text-sm font-semibold text-primary-600">
                {user?.role || "STUDENT"}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <Text className="text-lg font-bold text-gray-900">
            Account Information
          </Text>

          <View className="mt-4 border-b border-gray-100 pb-4">
            <Text className="text-xs font-medium uppercase text-gray-400">
              Name
            </Text>

            <Text className="mt-1 text-base text-gray-900">
              {user?.name || "-"}
            </Text>
          </View>

          <View className="mt-4 border-b border-gray-100 pb-4">
            <Text className="text-xs font-medium uppercase text-gray-400">
              Email
            </Text>

            <Text className="mt-1 text-base text-gray-900">
              {user?.email || "-"}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-xs font-medium uppercase text-gray-400">
              Role
            </Text>

            <Text className="mt-1 text-base text-gray-900">
              {user?.role || "-"}
            </Text>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          className="mt-6 items-center rounded-xl bg-red-50 py-4"
        >
          <Text className="font-semibold text-red-600">
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}