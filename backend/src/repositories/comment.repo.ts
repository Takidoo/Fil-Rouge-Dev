import type { PrismaClient } from "../../generated/prisma/client.js";

const includeUser = {
    user: { select: { id: true, name: true } },
} as const;

export class CommentRepository {
    constructor(private prisma: PrismaClient) {}

    create(content: string, userId: string, videoId: string) {
        return this.prisma.comment.create({
            data: { content, userId, videoId, status: "APPROVED" },
            include: includeUser,
        });
    }

    findById(id: string) {
        return this.prisma.comment.findUnique({ where: { id } });
    }

    findApprovedByVideo(videoId: string) {
        return this.prisma.comment.findMany({
            where: { videoId, status: "APPROVED" },
            orderBy: { createdAt: "asc" },
            include: includeUser,
        });
    }

    deleteById(id: string) {
        return this.prisma.comment.delete({ where: { id }, select: { id: true } });
    }
}
