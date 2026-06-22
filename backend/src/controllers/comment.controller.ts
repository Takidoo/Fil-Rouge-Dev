import { Request, Response } from "express";
import { CommentService } from "../services/comment.service.js";
import { requireAuthUser } from "../types/express.js";

export class CommentController {
    constructor(private commentService: CommentService) {}

    create = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const videoId = req.params.videoId as string;
        const comment = await this.commentService.create(req.body.content, userId, videoId);
        res.status(201).json(comment);
    };

    listApproved = async (req: Request, res: Response) => {
        const videoId = req.params.videoId as string;
        const comments = await this.commentService.listApprovedForVideo(videoId);
        res.status(200).json(comments);
    };

    remove = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        await this.commentService.remove(req.params.id as string, userId);
        res.status(204).send();
    };
}
