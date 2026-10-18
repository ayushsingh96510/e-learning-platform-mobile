import { Text, View } from "react-native";

import { TYPE_LABELS, type MaterialType } from "../../constants/material";
import MaterialInfoRow from "./MaterialInfoRow";
import { resolveMaterialType } from "../../utils/material";

interface OverviewMaterial {
  description: string | null;
  materialType: MaterialType;
  file: {
    originalFileName: string;
    mimeType: string;
    size: number;
  };
  createdAt: string;
  subject: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
}

interface OverviewTabProps {
  material: OverviewMaterial;
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** index).toFixed(
    index === 0 ? 0 : 1,
  )} ${units[index]}`;
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "--";

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OverviewTab({ material }: OverviewTabProps) {
  const materialType = resolveMaterialType(material);

  return (
    <>
      <View className="rounded-2xl border border-gray-100 bg-white p-4">
        <Text className="text-base font-bold text-gray-900">
          Description
        </Text>

        <Text className="mt-3 text-sm leading-6 text-gray-600">
          {material.description?.trim() || "No description provided."}
        </Text>
      </View>

      <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
        <Text className="mb-4 text-base font-bold text-gray-900">
          Content Information
        </Text>

        <MaterialInfoRow
          icon="book-outline"
          label="Subject"
          value={material.subject?.name || "--"}
        />

        <MaterialInfoRow
          icon="person-outline"
          label="Uploaded by"
          value={material.createdBy?.name || "Instructor"}
        />

        <MaterialInfoRow
          icon="document-outline"
          label="File name"
          value={material.file?.originalFileName || "--"}
        />

        <MaterialInfoRow
          icon="cloud-download-outline"
          label="File size"
          value={formatSize(material.file?.size ?? 0)}
        />

        <MaterialInfoRow
          icon="calendar-outline"
          label="Uploaded"
          value={formatDate(material.createdAt)}
        />

        <MaterialInfoRow
          icon="layers-outline"
          label="Content type"
          value={TYPE_LABELS[materialType]}
          last
        />
      </View>
    </>
  );
}