import { Request, Response } from "express";
import { FavoriteService } from "../services/favorite.service.js";
import { requireAuthUser } from "../types/express.js";

export class FavoriteController {
    constructor(private favoriteService: FavoriteService) {}

    toggle = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const videoId = req.params.videoId as string;
        if (!videoId) {
            res.status(400).json({ error: "Missing videoId" });
            return;
        }
        const isFavorite = await this.favoriteService.toggleFavorite(userId, videoId);
        res.json({ isFavorite });
    };

    list = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const favorites = await this.favoriteService.getUserFavorites(userId);
        res.json(favorites.map(f => f.video));
    };

    check = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const videoId = req.params.videoId as string;
        if (!videoId) {
            res.status(400).json({ error: "Missing videoId" });
            return;
        }
        const isFavorite = await this.favoriteService.isFavorite(userId, videoId);
        res.json({ isFavorite });
    };
}
