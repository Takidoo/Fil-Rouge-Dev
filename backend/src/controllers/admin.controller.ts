import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { CommentRepository } from "../repositories/comment.repo.js";
import { VideoRepository } from "../repositories/video.repo.js";
import { UserRepository } from "../repositories/user.repo.js";
import { requireAuthUser } from "../types/express.js";
import { AppError } from "../utils/errors.js";
import { deleteVideoAssets } from "../utils/video-files.js";

export class AdminController {
    constructor(
        private userService: UserService,
        private commentRepository: CommentRepository,
        private videoRepository: VideoRepository,
        private userRepository: UserRepository,
    ) {}

    listUsers = async (_req: Request, res: Response) => {
        const users = await this.userService.listUsers();
        res.status(200).json(users);
    };

    deleteUser = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        await this.userService.deleteUser(req.params.id as string, userId);
        res.status(204).send();
    };

    updateUserRole = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const targetId = req.params.id as string;
        const { role } = req.body as { role: string };
        if (targetId === userId) {
            throw AppError.badRequest("Impossible de modifier votre propre rôle");
        }
        if (role !== "ADMIN" && role !== "USER") {
            throw AppError.badRequest("Rôle invalide");
        }
        const user = await this.userRepository.updateRole(targetId, role);
        res.status(200).json(user);
    };

    listComments = async (req: Request, res: Response) => {
        const status = req.query.status as string | undefined;
        const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
        const normalised = status && validStatuses.includes(status)
            ? (status as "PENDING" | "APPROVED" | "REJECTED")
            : null;
        const comments = await this.commentRepository.findAll(normalised);
        res.status(200).json(comments);
    };

    moderateComment = async (req: Request, res: Response) => {
        const { status } = req.body as { status: string };
        if (status !== "APPROVED" && status !== "REJECTED") {
            throw AppError.badRequest("Statut invalide : APPROVED ou REJECTED attendu");
        }
        const comment = await this.commentRepository.updateStatus(req.params.id as string, status);
        res.status(200).json(comment);
    };

    deleteComment = async (req: Request, res: Response) => {
        await this.commentRepository.deleteById(req.params.id as string);
        res.status(204).send();
    };

    deleteVideo = async (req: Request, res: Response) => {
        const video = await this.videoRepository.findById(req.params.id as string);
        if (!video) throw AppError.notFound("Vidéo introuvable");
        deleteVideoAssets(video);
        await this.videoRepository.deleteById(video.id);
        res.status(204).send();
    };
}
