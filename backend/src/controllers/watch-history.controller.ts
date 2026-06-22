import { Request, Response } from "express";
import { WatchHistoryService } from "../services/watch-history.service.js";
import { requireAuthUser } from "../types/express.js";

export class WatchHistoryController {
    constructor(private historyService: WatchHistoryService) {}

    updateProgress = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const videoId = req.params.videoId as string;
        const { progress } = req.body;
        
        if (!videoId || typeof progress !== "number") {
            res.status(400).json({ error: "Invalid parameters" });
            return;
        }

        await this.historyService.updateProgress(userId, videoId, progress);
        res.json({ success: true });
    };

    getProgress = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const videoId = req.params.videoId as string;
        if (!videoId) {
            res.status(400).json({ error: "Missing videoId" });
            return;
        }
        const progress = await this.historyService.getProgress(userId, videoId);
        res.json({ progress });
    };

    list = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        const history = await this.historyService.getUserHistory(userId);
        res.json(history.map(h => ({ ...h.video, progress: h.progress })));
    };
}
