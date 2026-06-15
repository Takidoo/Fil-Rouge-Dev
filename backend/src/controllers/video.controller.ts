import { Request, Response } from "express";
import { basename } from "path";
import { videoService } from "../services/video.service.js";
import { requireAuthUser, requireValidQuery } from "../types/express.js";
import { AppError } from "../utils/errors.js";
import { VideoUploadFiles } from "../middlewares/upload.middleware.js";
import { SearchVideoQuery } from "../validators/video.validator.js";

export const videoController = {
    upload: async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const { title, description, genreIds } = req.body;

        const files = req.files as VideoUploadFiles | undefined;
        const videoFile = files?.video?.[0];
        const thumbnailFile = files?.thumbnail?.[0];

        if (!videoFile) {
            throw AppError.badRequest("Aucun fichier vidéo fourni");
        }

        const video = await videoService.upload({
            title,
            description,
            userId,
            originalPath: videoFile.path,
            thumbnailPath: thumbnailFile ? `thumbnails/${basename(thumbnailFile.path)}` : undefined,
            genreIds,
        });
        res.status(201).json(video);
    },

    list: async (_req: Request, res: Response) => {
        const videos = await videoService.list();
        res.status(200).json(videos);
    },

    search: async (req: Request, res: Response) => {
        const query = requireValidQuery<SearchVideoQuery>(req);
        const { items, total } = await videoService.search(query);
        res.status(200).json({ items, total, limit: query.limit, offset: query.offset });
    },

    getById: async (req: Request, res: Response) => {
        const video = await videoService.getById(req.params.id as string);
        res.status(200).json(video);
    },

    remove: async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        await videoService.remove(req.params.id as string, userId);
        res.status(204).send();
    },
};
