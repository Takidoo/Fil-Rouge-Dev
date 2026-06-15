import { videoRepository, SearchVideosParams } from "../repositories/video.repo.js";
import { convertToHls } from "../utils/hls.js";
import { deleteVideoAssets } from "../utils/video-files.js";
import { AppError } from "../utils/errors.js";
import { createLogger } from "../utils/logger.js";
import { assertOwnerOrAdmin } from "./permissions.js";

const logger = createLogger("video.service");

export interface UploadVideoInput {
    title: string;
    description: string;
    userId: string;
    originalPath: string;
    thumbnailPath?: string;
    genreIds: string[];
}

export const videoService = {
    upload: async ({ title, description, userId, originalPath, thumbnailPath, genreIds }: UploadVideoInput) => {
        // 1. Save the record first so the upload survives a conversion failure
        const video = await videoRepository.create({
            title,
            description,
            path: originalPath,
            userId,
            thumbnailPath,
            genreIds,
        });

        // 2. Convert to HLS (awaited — the client receives a ready-to-stream video)
        try {
            const { hlsPath } = await convertToHls(originalPath);
            return await videoRepository.setHlsPath(video.id, hlsPath);
        } catch (err) {
            logger.error(`HLS conversion failed for video ${video.id}:`, err);
            // The video stays playable through the original file fallback
            return video;
        }
    },

    list: () => videoRepository.findAll(),

    search: (params: SearchVideosParams) => videoRepository.search(params),

    getById: async (id: string) => {
        const video = await videoRepository.findById(id);
        if (!video) throw AppError.notFound("Vidéo introuvable");
        return video;
    },

    remove: async (id: string, requesterId: string) => {
        const video = await videoRepository.findById(id);
        if (!video) throw AppError.notFound("Vidéo introuvable");

        await assertOwnerOrAdmin(video.userId, requesterId);

        deleteVideoAssets(video);
        return videoRepository.deleteById(id);
    },
};
