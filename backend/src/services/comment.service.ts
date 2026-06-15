import { commentRepository } from "../repositories/comment.repo.js";
import { videoRepository } from "../repositories/video.repo.js";
import { AppError } from "../utils/errors.js";
import { assertOwnerOrAdmin } from "./permissions.js";

export const commentService = {
    create: async (content: string, userId: string, videoId: string) => {
        if (!(await videoRepository.exists(videoId))) {
            throw AppError.notFound("Vidéo introuvable");
        }
        return commentRepository.create(content, userId, videoId);
    },

    listApprovedForVideo: (videoId: string) =>
        commentRepository.findApprovedByVideo(videoId),

    remove: async (id: string, requesterId: string) => {
        const comment = await commentRepository.findById(id);
        if (!comment) throw AppError.notFound("Commentaire introuvable");

        await assertOwnerOrAdmin(comment.userId, requesterId);
        return commentRepository.deleteById(id);
    },
};
