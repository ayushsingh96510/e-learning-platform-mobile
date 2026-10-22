import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { WebView } from "react-native-webview";
import { useState } from "react";
import Slider from "@react-native-community/slider";

import { type MaterialType } from "../../constants/material";

interface ViewerMaterial {
  title: string;
  materialType: MaterialType;
  objectKey: string;
  file: {
    originalFileName: string;
    mimeType: string;
    size: number;
  };
}

interface MaterialViewerProps {
  material: ViewerMaterial;
  onPdfTouchChange?: (isInteracting: boolean) => void;
}

function VideoMaterialPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);

  return (
    <View className="overflow-hidden rounded-xl bg-black">
      <VideoView
        player={player}
        style={{ width: "100%", height: 230 }}
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function AudioMaterialPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const duration = Number.isFinite(status.duration)
    ? Math.max(0, status.duration)
    : 0;

  const currentTime = Math.min(
    duration,
    Math.max(0, status.currentTime || 0),
  );

  const progress = isSeeking ? seekPosition : currentTime;
  const canSeek = status.isLoaded && duration > 0;

  const handleSeek = async (value: number) => {
    setSeekPosition(value);
    await player.seekTo(value);
    setIsSeeking(false);
  };

  const handleSpeedChange = (speed: number) => {
    player.setPlaybackRate(speed);
  };

  return (
    <View className="rounded-2xl border border-blue-100 bg-white p-5">
      {/* Audio heading */}
      <View className="mb-5 flex-row items-center">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <Ionicons
            name="musical-notes"
            size={27}
            color="#2563EB"
          />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-gray-900">
            Audio material
          </Text>

          <Text className="mt-1 text-xs text-gray-500">
            Listen and learn at your own pace
          </Text>
        </View>

        {status.isBuffering && (
          <Ionicons name="sync-outline" size={20} color="#2563EB" />
        )}
      </View>

      {/* Playback progress */}
      <View>
        <Slider
          style={{ width: "100%", height: 36 }}
          minimumValue={0}
          maximumValue={duration || 1}
          value={Math.min(progress, duration || 1)}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#DBEAFE"
          thumbTintColor="#2563EB"
          disabled={!canSeek}
          onSlidingStart={(value) => {
            setSeekPosition(value);
            setIsSeeking(true);
          }}
          onValueChange={(value) => {
            setSeekPosition(value);
          }}
          onSlidingComplete={handleSeek}
          accessibilityLabel="Audio progress"
        />

        <View className="-mt-1 flex-row items-center justify-between">
          <Text className="text-xs font-medium text-gray-600">
            {formatTime(progress)}
          </Text>

          <Text className="text-xs font-medium text-gray-500">
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Main playback controls */}
      <View className="mt-5 flex-row items-center justify-center">
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!status.isLoaded}
          onPress={() => {
            void player.seekTo(Math.max(0, currentTime - 10));
          }}
          accessibilityRole="button"
          accessibilityLabel="Rewind 10 seconds"
          className="h-12 w-12 items-center justify-center"
        >
          <Ionicons
            name="play-back"
            size={24}
            color={status.isLoaded ? "#374151" : "#9CA3AF"}
          />
          <Text className="text-[10px] text-gray-500">10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (status.playing) {
              player.pause();
            } else {
              if (duration > 0 && currentTime >= duration) {
                void player.seekTo(0);
              }

              player.play();
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={status.playing ? "Pause audio" : "Play audio"}
          className="mx-5 h-14 w-14 items-center justify-center rounded-full bg-blue-600"
        >
          <Ionicons
            name={status.playing ? "pause" : "play"}
            size={27}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!canSeek}
          onPress={() => {
            void player.seekTo(Math.min(duration, currentTime + 10));
          }}
          accessibilityRole="button"
          accessibilityLabel="Forward 10 seconds"
          className="h-12 w-12 items-center justify-center"
        >
          <Ionicons
            name="play-forward"
            size={24}
            color={canSeek ? "#374151" : "#9CA3AF"}
          />
          <Text className="text-[10px] text-gray-500">10s</Text>
        </TouchableOpacity>
      </View>

      {/* Playback speed */}
      <View className="mt-5 border-t border-gray-100 pt-4">
        <Text className="mb-3 text-xs font-semibold text-gray-500">
          PLAYBACK SPEED
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {PLAYBACK_SPEEDS.map((speed) => {
            const selected = status.playbackRate === speed;

            return (
              <TouchableOpacity
                key={speed}
                activeOpacity={0.75}
                onPress={() => handleSpeedChange(speed)}
                accessibilityRole="button"
                accessibilityLabel={`Playback speed ${speed} times`}
                accessibilityState={{ selected }}
                className={`min-w-[52px] items-center rounded-lg px-3 py-2 ${selected
                    ? "bg-blue-600"
                    : "border border-gray-200 bg-white"
                  }`}
              >
                <Text
                  className={`text-xs font-semibold ${selected ? "text-white" : "text-gray-600"
                    }`}
                >
                  {speed}x
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function ViewerMessage({ message }: { message: string }) {
  return (
    <View className="items-center rounded-xl border border-gray-200 bg-white p-6">
      <Ionicons name="document-outline" size={32} color="#6B7280" />
      <Text className="mt-3 text-center text-sm text-gray-600">
        {message}
      </Text>
    </View>
  );
}

function PdfMaterialViewer({
  uri,
  onTouchChange,
}: {
  uri: string;
  onTouchChange?: (isInteracting: boolean) => void;
}) {
  const viewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(uri)}`;

  return (
    <View
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      style={{ height: 400 }}
    >
      <WebView
        source={{ uri: viewerUrl }}
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scrollEnabled
        nestedScrollEnabled
        onTouchStart={() => onTouchChange?.(true)}
        onTouchEnd={() => onTouchChange?.(false)}
        onTouchCancel={() => onTouchChange?.(false)}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="mt-2 text-sm text-gray-500">
              Loading PDF...
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export default function MaterialViewer({ material, onPdfTouchChange, }: MaterialViewerProps) {
  const uri = material.objectKey;
  const mimeType = material.file?.mimeType?.toLowerCase() ?? "";
  const fileName = material.file?.originalFileName?.toLowerCase() ?? "";

  const rawType = String(material.materialType ?? "").toUpperCase();

  let type: MaterialType | undefined;

  if (["VIDEO", "AUDIO", "IMAGE", "PDF", "DOCUMENT"].includes(rawType)) {
    type = rawType as MaterialType;
  } else if (
    mimeType.startsWith("video/") ||
    /\.(mp4|mov|webm|m4v|mkv)$/.test(fileName)
  ) {
    type = "VIDEO";
  } else if (
    mimeType.startsWith("audio/") ||
    /\.(mp3|wav|m4a|aac|ogg)$/.test(fileName)
  ) {
    type = "AUDIO";
  } else if (
    mimeType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/.test(fileName)
  ) {
    type = "IMAGE";
  } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    type = "PDF";
  } else if (
    mimeType.startsWith("text/") ||
    /\.(doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv)$/.test(fileName)
  ) {
    type = "DOCUMENT";
  }

  if (!uri || !/^https?:\/\//i.test(uri)) {
    return (
      <ViewerMessage message="The material URL is invalid or unavailable." />
    );
  }

  switch (type) {
    case "VIDEO":
      return <VideoMaterialPlayer uri={uri} />;

    case "AUDIO":
      return <AudioMaterialPlayer uri={uri} />;

    case "IMAGE":
      return (
        <View className="overflow-hidden rounded-xl bg-gray-100 p-2">
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ width: "100%", height: 280 }}
            accessibilityLabel={material.title}
          />
        </View>
      );

    case "PDF":
      return (
        <PdfMaterialViewer
          uri={uri}
          onTouchChange={onPdfTouchChange}
        />
      );

    case "DOCUMENT":
      return (
        <ViewerMessage message="The embedded document viewer will be added in the next step." />
      );

    default:
      return (
        <ViewerMessage message="We couldn't identify this material's file format." />
      );
  }
}