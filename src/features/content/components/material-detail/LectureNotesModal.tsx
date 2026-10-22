import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import {
  exportMaterialNotes,
} from "../../api/content.api";
import { NotesFormat, NotesSection } from "../../types/content.types";

interface Props {
  visible: boolean;
  materialId: string;
  materialTitle: string;
  onClose: () => void;
}

const SECTIONS: { id: NotesSection; label: string }[] = [
  { id: "TRANSCRIPT", label: "Full Transcript" },
  { id: "SUMMARY", label: "Summary" },
  { id: "KEY_POINTS", label: "Key Points" },
];

const FORMATS: NotesFormat[] = ["PDF", "DOCX", "TXT"];

const EXTENSIONS: Record<NotesFormat, string> = {
  PDF: "pdf",
  DOCX: "docx",
  TXT: "txt",
};

const MIME_TYPES: Record<NotesFormat, string> = {
  PDF: "application/pdf",
  DOCX:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  TXT: "text/plain",
};

function sanitizeFileName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .trim();

  return cleaned || "lecture-notes";
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  let result = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const hasB = i + 1 < bytes.length;
    const hasC = i + 2 < bytes.length;
    const b = hasB ? bytes[i + 1] : 0;
    const c = hasC ? bytes[i + 2] : 0;

    result += alphabet[a >> 2];
    result += alphabet[((a & 3) << 4) | (b >> 4)];
    result += hasB
      ? alphabet[((b & 15) << 2) | (c >> 6)]
      : "=";
    result += hasC ? alphabet[c & 63] : "=";
  }

  return result;
}

export default function LectureNotesModal({
  visible,
  materialId,
  materialTitle,
  onClose,
}: Props) {
  const [selectedSections, setSelectedSections] = useState<NotesSection[]>(
    SECTIONS.map((section) => section.id),
  );
  const [format, setFormat] = useState<NotesFormat>("PDF");
  const [exporting, setExporting] = useState(false);

  const toggleSection = (section: NotesSection) => {
    setSelectedSections((current) =>
      current.includes(section)
        ? current.filter((item) => item !== section)
        : [...current, section],
    );
  };

  const handleExport = async () => {
    if (selectedSections.length === 0 || exporting) return;

    setExporting(true);

    try {
      const data = await exportMaterialNotes(materialId, {
        sections: selectedSections,
        format,
      });

      const directory = FileSystem.documentDirectory;

      if (!directory) {
        throw new Error("App document storage is unavailable.");
      }

      const folder = `${directory}lecture-notes/`;

      await FileSystem.makeDirectoryAsync(folder, {
        intermediates: true,
      }).catch(() => undefined);

      const fileName =
        `${sanitizeFileName(materialTitle)}-notes.${EXTENSIONS[format]}`;
      const fileUri = `${folder}${fileName}`;

      const base64 = bytesToBase64(new Uint8Array(data));

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      onClose();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: MIME_TYPES[format],
          dialogTitle: fileName,
          UTI:
            format === "PDF"
              ? "com.adobe.pdf"
              : format === "DOCX"
                ? "org.openxmlformats.wordprocessingml.document"
                : "public.plain-text",
        });
      } else {
        Alert.alert(
          "Notes exported",
          `The file was saved in the app's documents folder as ${fileName}, but sharing is unavailable on this device.`,
        );
      }
    } catch (error: unknown) {
      console.error("Lecture notes export failed:", error);

      Alert.alert(
        "Export failed",
        "Unable to export lecture notes. Please check your connection and try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          className="flex-1"
          accessibilityLabel="Close lecture notes dialog"
          onPress={onClose}
        />

        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-bold text-gray-900">
                Lecture Notes
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                Choose sections and export format
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              disabled={exporting}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
          </View>

          <Text className="mb-3 text-sm font-semibold text-gray-800">
            Include sections
          </Text>

          {SECTIONS.map((section) => {
            const checked = selectedSections.includes(section.id);

            return (
              <Pressable
                key={section.id}
                disabled={exporting}
                onPress={() => toggleSection(section.id)}
                className="mb-2 flex-row items-center rounded-xl border border-gray-100 px-3 py-3"
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                <Ionicons
                  name={checked ? "checkbox" : "square-outline"}
                  size={22}
                  color={checked ? "#4F46E5" : "#9CA3AF"}
                />
                <Text className="ml-3 flex-1 text-sm text-gray-800">
                  {section.label}
                </Text>
              </Pressable>
            );
          })}

          <Text className="mb-3 mt-4 text-sm font-semibold text-gray-800">
            Export format
          </Text>

          <View className="mb-6 flex-row gap-3">
            {FORMATS.map((item) => {
              const active = format === item;

              return (
                <Pressable
                  key={item}
                  disabled={exporting}
                  onPress={() => setFormat(item)}
                  className={`flex-1 items-center rounded-xl border py-3 ${
                    active
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 bg-white"
                  }`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? "text-indigo-700" : "text-gray-600"
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleExport}
            disabled={exporting || selectedSections.length === 0}
            className={`min-h-12 flex-row items-center justify-center rounded-xl px-4 py-3 ${
              exporting || selectedSections.length === 0
                ? "bg-indigo-300"
                : "bg-indigo-600"
            }`}
          >
            {exporting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons
                name="download-outline"
                size={19}
                color="#FFFFFF"
              />
            )}

            <Text className="ml-2 text-sm font-semibold text-white">
              {exporting ? "Exporting..." : "Export Notes"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
