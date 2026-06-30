export function normalizeHotkey(value: string): string {
  return value
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("+");
}

export function isLikelyHotkey(value: string): boolean {
  const parts = normalizeHotkey(value).split("+");
  return parts.length >= 2 && parts.every((part) => part.length > 0);
}
