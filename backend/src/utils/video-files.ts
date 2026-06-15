import fs from "fs";
import { isAbsolute } from "path";
import { resolveVideoPath } from "../config/paths.js";
import { deleteHlsFiles } from "./hls.js";
import { createLogger } from "./logger.js";

const logger = createLogger("video-files");

export interface VideoAssets {
    path?: string | null;
    hlsPath?: string | null;
    thumbnailPath?: string | null;
}

function removeFile(path: string): void {
    if (fs.existsSync(path)) fs.unlinkSync(path);
}

export function deleteVideoAssets(video: VideoAssets): void {
    if (video.hlsPath) {
        try {
            deleteHlsFiles(video.hlsPath);
        } catch (err) {
            logger.warn(`Failed to delete HLS files for ${video.hlsPath}`, err);
        }
    }

    if (video.thumbnailPath) {
        try {
            removeFile(resolveVideoPath(video.thumbnailPath));
        } catch (err) {
            logger.warn(`Failed to delete thumbnail ${video.thumbnailPath}`, err);
        }
    }

    if (video.path) {
        try {
            removeFile(isAbsolute(video.path) ? video.path : resolveVideoPath(video.path));
        } catch (err) {
            logger.warn(`Failed to delete original file ${video.path}`, err);
        }
    }
}
