const LOCALE = "fr-FR";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMonthYear(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(LOCALE, {
    month: "long",
    year: "numeric",
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
