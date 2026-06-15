export function normalizeForSearch(s: string): string {
    return s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}
