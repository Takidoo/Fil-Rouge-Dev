import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { join, basename, extname } from "path";
import fs from "fs";
import { HLS_DIR } from "../config/paths.js";
import { createLogger } from "./logger.js";

const logger = createLogger("hls");

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export type HlsResult = {
    outputDir: string;
    playlistPath: string;
    hlsPath: string;
};

export async function convertToHls(inputPath: string): Promise<HlsResult> {
    const videoName = basename(inputPath, extname(inputPath));
    const outputDir = join(HLS_DIR, videoName);
    const playlistPath = join(outputDir, "index.m3u8");
    const hlsPath = `hls/${videoName}/index.m3u8`;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const segmentPattern = join(outputDir, "segment%03d.ts");

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                "-c:v", "libx264",
                "-c:a", "aac",
                "-b:a", "128k",
                "-vf", "scale=w=1280:h=720:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "-crf", "23",
                "-preset", "fast",
                "-hls_time", "6",
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", segmentPattern,
                "-start_number", "0",
                "-hls_flags", "independent_segments",
            ])
            .output(playlistPath)
            .on("start", (cmd) => {
                logger.info(`Starting HLS conversion: ${cmd}`);
            })
            .on("end", () => {
                logger.info(`HLS conversion complete → ${playlistPath}`);
                resolve({ outputDir, playlistPath, hlsPath });
            })
            .on("error", (err, _stdout, stderr) => {
                logger.error(`Conversion error: ${err.message}`);
                reject(new Error(`HLS conversion failed: ${err.message}${stderr ? `\n--- ffmpeg stderr ---\n${stderr}` : ""}`));
            })
            .run();
    });
}

export function deleteHlsFiles(hlsPath: string): void {
    const videoName = hlsPath.split("/")[1];
    if (!videoName) return;

    const dir = join(HLS_DIR, videoName);
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        logger.info(`Deleted HLS directory: ${dir}`);
    }
}
