import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const VIDEOS_ROOT = join(__dirname, "../../videos");
export const ORIGINALS_DIR = join(VIDEOS_ROOT, "originals");
export const THUMBNAILS_DIR = join(VIDEOS_ROOT, "thumbnails");
export const HLS_DIR = join(VIDEOS_ROOT, "hls");

export function resolveVideoPath(relativePath: string): string {
    return join(VIDEOS_ROOT, relativePath);
}
