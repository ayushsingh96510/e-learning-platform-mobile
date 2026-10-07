export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function extractAvatar(metadata?: string): string | undefined {
  if (!metadata) return undefined;
  try {
    return JSON.parse(metadata).avatar;
  } catch {
    return undefined;
  }
}