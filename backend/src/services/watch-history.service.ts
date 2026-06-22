import { WatchHistoryRepository } from "../repositories/watch-history.repo.js";

export class WatchHistoryService {
    constructor(private historyRepository: WatchHistoryRepository) {}

    async updateProgress(userId: string, videoId: string, progress: number) {
        return this.historyRepository.upsertProgress(userId, videoId, Math.floor(progress));
    }

    async getProgress(userId: string, videoId: string) {
        return this.historyRepository.getProgress(userId, videoId);
    }

    async getUserHistory(userId: string) {
        return this.historyRepository.getUserHistory(userId);
    }
}
