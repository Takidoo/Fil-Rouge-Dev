import { VideoRepository, SearchVideosParams } from "../repositories/video.repo.js";
import { convertToHls } from "../utils/hls.js";
import { deleteVideoAssets } from "../utils/video-files.js";
import { AppError } from "../utils/errors.js";
import { createLogger } from "../utils/logger.js";
import { PermissionService } from "./permissions.js";

const logger = createLogger("video.service");

export interface UploadVideoInput {
    title: string;
    description: string;
    userId: string;
    originalPath: string;
    thumbnailPath?: string;
    genreIds: string[];
}

export class VideoService {
    constructor(
        private videoRepository: VideoRepository,
        private permissionService: PermissionService
    ) {}

    async upload({ title, description, userId, originalPath, thumbnailPath, genreIds }: UploadVideoInput) {
        const video = await this.videoRepository.create({
            title,
            description,
            path: originalPath,
            userId,
            thumbnailPath,
            genreIds,
        });

        try {
            const { hlsPath } = await convertToHls(originalPath);
            return await this.videoRepository.setHlsPath(video.id, hlsPath);
        } catch (err) {
            logger.error(`HLS conversion failed for video ${video.id}:`, err);
            return video;
        }
    }

    list() {
        return this.videoRepository.findAll();
    }

    search(params: SearchVideosParams) {
        return this.videoRepository.search(params);
    }

    async getById(id: string) {
        const video = await this.videoRepository.findById(id);
        if (!video) throw AppError.notFound("Vidéo introuvable");
        return video;
    }

    async remove(id: string, requesterId: string) {
        const video = await this.videoRepository.findById(id);
        if (!video) throw AppError.notFound("Vidéo introuvable");

        await this.permissionService.assertOwnerOrAdmin(video.userId, requesterId);

        deleteVideoAssets(video);
        return this.videoRepository.deleteById(id);
    }
}
