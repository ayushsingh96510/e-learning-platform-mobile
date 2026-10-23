
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../auth/AuthContext";
import { getProfile } from "../api/profile.api";
import type { Profile } from "../types/profile.types";

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const displayValue = (value?: string | null) =>
  value?.trim() || "—";

const getInitials = (name?: string) => {
  const cleanName = name?.trim();

  if (!cleanName) return "S";

  return cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getRoleLabel = (role?: string) => {
  switch (role?.toUpperCase()) {
    case "STUDENT":
      return "Student";
    case "TEACHER":
      return "Teacher";
    case "ADMIN":
      return "Administrator";
    default:
      return role || "User";
  }
};

const getStatusStyle = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return {
        container: "bg-emerald-50",
        text: "text-emerald-700",
        label: "Active",
      };
    case "BLOCKED":
      return {
        container: "bg-red-50",
        text: "text-red-700",
        label: "Blocked",
      };
    case "INACTIVE":
      return {
        container: "bg-gray-100",
        text: "text-gray-600",
        label: "Inactive",
      };
    default:
      return {
        container: "bg-gray-100",
        text: "text-gray-600",
        label: status || "Unknown",
      };
  }
};


interface InfoRowProps {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <View className="flex-row items-start py-3">
      {icon ? (
        <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </View>
      ) : null}

      <View className="flex-1 pt-0.5">
        <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </Text>

        <Text className="mt-1 text-sm font-medium leading-5 text-gray-900">
          {displayValue(value)}
        </Text>
      </View>
    </View>
  );
}



interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <View className="h-1 bg-blue-600" />

      <View className="flex-row items-center px-4 pb-3 pt-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          {icon}
        </View>

        <Text className="text-base font-bold text-gray-900">
          {title}
        </Text>
      </View>

      <View className="px-4 pb-2">
        {children}
      </View>
    </View>
  );
}


export default function ProfileScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProfile();
      setProfile(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const confirmLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout();
            } catch {
              Alert.alert(
                "Logout failed",
                "Please try again.",
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  const personalInfo = profile?.personalInfo;
  const roleInfo = profile?.roleInfo;
  const address = personalInfo?.address;

  const fullAddress = [
    address?.line1,
    address?.city,
    address?.state,
    address?.country,
    address?.zipCode,
  ]
    .filter((part) => part?.trim())
    .join(", ");

  const statusStyle = getStatusStyle(profile?.status);
  const displayName = personalInfo?.name?.trim() || "Student";
  const imageUrl = personalInfo?.profileImage?.trim();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-sm text-gray-500">
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <View className="mb-4 rounded-full bg-red-50 p-4">
          <UserRound size={32} color="#dc2626" />
        </View>

        <Text className="text-lg font-bold text-gray-900">
          Unable to load profile
        </Text>

        <Text className="mt-2 text-center text-sm text-gray-500">
          {error || "Profile information is unavailable."}
        </Text>

        <Pressable
          onPress={loadProfile}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3"
        >
          <Text className="font-semibold text-white">
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pb-4 pt-5">
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
            className="mr-3 rounded-xl bg-white p-2.5"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={21} color="#111827" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              My Profile
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              Your personal and academic details
            </Text>
          </View>
        </View>

        {/* Profile Hero */}
        <View className="mx-4 mb-5 overflow-hidden rounded-3xl bg-blue-600 p-5">
          <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <View className="absolute -bottom-12 right-20 h-28 w-28 rounded-full bg-white/10" />

          <View className="flex-row items-center">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="h-20 w-20 rounded-full border-2 border-white/70"
                onError={() => {
                  setProfile((current) =>
                    current
                      ? {
                          ...current,
                          personalInfo: {
                            ...current.personalInfo,
                            profileImage: "",
                          },
                        }
                      : current,
                  );
                }}
              />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-white/70 bg-white/20">
                <Text className="text-2xl font-bold text-white">
                  {getInitials(displayName)}
                </Text>
              </View>
            )}

            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-white">
                {displayName}
              </Text>

              <View className="mt-2 self-start rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-semibold text-white">
                  {getRoleLabel(profile.role)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 border-t border-white/20 pt-4">
            <View className="mb-3 flex-row items-center">
              <Mail size={17} color="#FFFFFF" strokeWidth={2} />
              <Text className="ml-2 flex-1 text-sm text-white">
                {profile.email}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Phone size={17} color="#FFFFFF" strokeWidth={2} />
              <Text className="ml-2 text-sm text-white">
                {displayValue(profile.phoneNumber)}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="px-4">
          <SectionCard
            title="Personal Information"
            icon={<UserRound size={20} color="#2563eb" />}
          >
            <InfoRow
              label="Full Name"
              value={personalInfo?.name}
            />

            <InfoRow
              label="Gender"
              value={personalInfo?.gender}
            />

            <InfoRow
              label="Date of Birth"
              value={formatDate(personalInfo?.dateOfBirth)}
              icon={<CalendarDays size={18} color="#64748B" strokeWidth={1.8} />}
            />

            <InfoRow
              label="Address"
              value={fullAddress}
              icon={<MapPin size={18} color="#64748B" strokeWidth={1.8} />}
            />
          </SectionCard>

          {/* Student Academic Information */}
          {profile.role.toUpperCase() === "STUDENT" && (
            <SectionCard
              title="Academic Information"
              icon={<GraduationCap size={21} color="#7c3aed" />}
            >
              <InfoRow
                label="Roll Number"
                value={roleInfo?.rollNumber}
              />

              <InfoRow
                label="Admission Date"
                value={formatDate(roleInfo?.admissionDate)}
              />

              <InfoRow
                label="Program"
                value={roleInfo?.program?.name}
              />

              <InfoRow
                label="Batch"
                value={roleInfo?.batch?.name}
              />

              <InfoRow
                label="Guardian Name"
                value={roleInfo?.guardianName}
              />

              <InfoRow
                label="Guardian Phone"
                value={roleInfo?.guardianPhoneNumber}
              />
            </SectionCard>
          )}

          {/* Account Information */}
          <SectionCard
            title="Account Information"
            icon={<ShieldCheck size={21} color="#475569" />}
          >
            <InfoRow
              label="Account Role"
              value={getRoleLabel(profile.role)}
            />

            <View className="py-3">
              <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Account Status
              </Text>

              <View
                className={`mt-2 self-start rounded-full px-3 py-1 ${statusStyle.container}`}
              >
                <Text
                  className={`text-xs font-semibold ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </Text>
              </View>
            </View>

            <InfoRow
              label="Email Address"
              value={profile.email}
              icon={<Mail size={18} color="#64748B" strokeWidth={1.8} />}
            />

            <InfoRow
              label="Phone Number"
              value={profile.phoneNumber}
              icon={<Phone size={18} color="#64748B" strokeWidth={1.8} />}
            />

            <InfoRow
              label="Member Since"
              value={formatDate(profile.createdAt)}
            />

            <InfoRow
              label="Last Updated"
              value={formatDate(profile.updatedAt)}
            />
          </SectionCard>

          {/* Logout */}
          <Pressable
            onPress={confirmLogout}
            disabled={loggingOut}
            className="mb-4 flex-row items-center justify-center rounded-2xl border border-red-100 bg-white px-4 py-4"
          >
            {loggingOut ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <>
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                  <LogOut size={18} color="#DC2626" strokeWidth={2} />
                </View>
                <Text className="ml-2 font-semibold text-red-600">
                  Log out
                </Text>
                <View className="absolute right-4">
                  <ChevronRight size={19} color="#dc2626" />
                </View>
              </>
            )}
          </Pressable>

          <View className="flex-row items-center justify-center">
            <CheckCircle2 size={14} color="#9ca3af" />
            <Text className="ml-2 text-xs text-gray-400">
              E-Learn · Student Account
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
