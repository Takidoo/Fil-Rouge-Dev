import { spawn } from "child_process";
import ffmpegStatic from "ffmpeg-static";
import { join, basename, extname } from "path";
import fs from "fs";
import { HLS_DIR } from "../config/paths.js";
import { createLogger } from "./logger.js";

const logger = createLogger("hls");
const FFMPEG = ffmpegStatic as string;

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

    fs.mkdirSync(outputDir, { recursive: true });

    // Each array element is a separate argv — paths with spaces are safe.
    const args = [
        "-i", inputPath,
        "-y",
        "-preset", "fast",
        "-g", "48",
        "-sc_threshold", "0",

        // 3 video + 3 audio streams (same input, different renditions)
        "-map", "0:v:0", "-map", "0:a:0",
        "-map", "0:v:0", "-map", "0:a:0",
        "-map", "0:v:0", "-map", "0:a:0",

        // 1080p
        "-s:v:0", "1920x1080", "-c:v:0", "libx264", "-b:v:0", "5000k",
        "-c:a:0", "aac", "-b:a:0", "192k",

        // 720p
        "-s:v:1", "1280x720", "-c:v:1", "libx264", "-b:v:1", "2800k",
        "-c:a:1", "aac", "-b:a:1", "128k",

        // 480p
        "-s:v:2", "854x480", "-c:v:2", "libx264", "-b:v:2", "1400k",
        "-c:a:2", "aac", "-b:a:2", "96k",

        // HLS muxer
        "-f", "hls",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-hls_flags", "independent_segments",
        "-hls_segment_type", "mpegts",
        // Option + value as separate args → spaces in path handled correctly
        "-hls_segment_filename", join(outputDir, "v%v_seq%03d.ts"),
        "-master_pl_name", "index.m3u8",
        // Value with internal spaces also safe as its own arg
        "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2",

        join(outputDir, "v%v_prog.m3u8"),
    ];

    return new Promise((resolve, reject) => {
        logger.info(`Starting HLS ABR conversion: ${videoName}`);

        const proc = spawn(FFMPEG, args);
        let stderr = "";

        proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

        proc.on("close", (code) => {
            if (code === 0) {
                logger.info(`HLS ABR conversion complete → ${playlistPath}`);
                resolve({ outputDir, playlistPath, hlsPath });
            } else {
                const msg = `HLS conversion failed (exit ${code})`;
                logger.error(`${msg}\n${stderr.slice(-1000)}`);
                reject(new Error(msg));
            }
        });

        proc.on("error", (err) => {
            logger.error(`Failed to spawn ffmpeg: ${err.message}`);
            reject(new Error(`Failed to spawn ffmpeg: ${err.message}`));
        });
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
