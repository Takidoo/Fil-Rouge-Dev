import { FavoriteRepository } from "../repositories/favorite.repo.js";

export class FavoriteService {
    constructor(private favoriteRepository: FavoriteRepository) {}

    async toggleFavorite(userId: string, videoId: string): Promise<boolean> {
        const isFavorite = await this.favoriteRepository.isFavorite(userId, videoId);
        if (isFavorite) {
            await this.favoriteRepository.removeFavorite(userId, videoId);
            return false;
        } else {
            await this.favoriteRepository.createFavorite(userId, videoId);
            return true;
        }
    }

    async getUserFavorites(userId: string) {
        return this.favoriteRepository.getUserFavorites(userId);
    }

    async isFavorite(userId: string, videoId: string) {
        return this.favoriteRepository.isFavorite(userId, videoId);
    }
}
