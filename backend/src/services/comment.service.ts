import { CommentRepository } from "../repositories/comment.repo.js";
import { VideoRepository } from "../repositories/video.repo.js";
import { AppError } from "../utils/errors.js";
import { PermissionService } from "./permissions.js";

export class CommentService {
    constructor(
        private commentRepository: CommentRepository,
        private videoRepository: VideoRepository,
        private permissionService: PermissionService
    ) {}

    async create(content: string, userId: string, videoId: string) {
        if (!(await this.videoRepository.exists(videoId))) {
            throw AppError.notFound("Vidéo introuvable");
        }
        return this.commentRepository.create(content, userId, videoId);
    }

    listApprovedForVideo(videoId: string) {
        return this.commentRepository.findApprovedByVideo(videoId);
    }

    async remove(id: string, requesterId: string) {
        const comment = await this.commentRepository.findById(id);
        if (!comment) throw AppError.notFound("Commentaire introuvable");

        await this.permissionService.assertOwnerOrAdmin(comment.userId, requesterId);
        return this.commentRepository.deleteById(id);
    }
}
