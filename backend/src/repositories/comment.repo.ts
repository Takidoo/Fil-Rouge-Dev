import type { PrismaClient } from "../generated/prisma/client.js";

const includeUser = {
    user: { select: { id: true, name: true } },
} as const;

const includeUserAndVideo = {
    user: { select: { id: true, name: true } },
    video: { select: { id: true, title: true } },
} as const;

type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

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

    findAll(status: CommentStatus | null) {
        return this.prisma.comment.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            include: includeUserAndVideo,
        });
    }

    updateStatus(id: string, status: "APPROVED" | "REJECTED") {
        return this.prisma.comment.update({
            where: { id },
            data: { status },
            include: includeUserAndVideo,
        });
    }

    countPending() {
        return this.prisma.comment.count({ where: { status: "PENDING" } });
    }

    deleteById(id: string) {
        return this.prisma.comment.delete({ where: { id }, select: { id: true } });
    }
}
