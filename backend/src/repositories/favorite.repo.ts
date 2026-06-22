import type { PrismaClient } from "../generated/prisma/client.js";

export class FavoriteRepository {
    constructor(private prisma: PrismaClient) {}

    async createFavorite(userId: string, videoId: string) {
        return this.prisma.favorite.create({
            data: { userId, videoId }
        });
    }

    async removeFavorite(userId: string, videoId: string) {
        return this.prisma.favorite.deleteMany({
            where: { userId, videoId }
        });
    }

    async getUserFavorites(userId: string) {
        return this.prisma.favorite.findMany({
            where: { userId },
            include: {
                video: {
                    include: { user: { select: { id: true, name: true } }, genres: true }
                }
            },
            orderBy: { addedAt: "desc" }
        });
    }

    async isFavorite(userId: string, videoId: string) {
        const count = await this.prisma.favorite.count({
            where: { userId, videoId }
        });
        return count > 0;
    }
}
