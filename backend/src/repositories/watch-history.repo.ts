import type { PrismaClient } from "../generated/prisma/client.js";

export class WatchHistoryRepository {
    constructor(private prisma: PrismaClient) {}

    async upsertProgress(userId: string, videoId: string, progress: number) {
        return this.prisma.watchHistory.upsert({
            where: {
                userId_videoId: { userId, videoId }
            },
            update: { progress },
            create: { userId, videoId, progress }
        });
    }

    async getProgress(userId: string, videoId: string) {
        const history = await this.prisma.watchHistory.findUnique({
            where: {
                userId_videoId: { userId, videoId }
            }
        });
        return history?.progress || 0;
    }

    async getUserHistory(userId: string) {
        return this.prisma.watchHistory.findMany({
            where: { userId },
            include: {
                video: {
                    include: { user: { select: { id: true, name: true } }, genres: true }
                }
            },
            orderBy: { updatedAt: "desc" }
        });
    }
}
