import { prisma } from "../db/prisma.js";

const includeUser = {
    user: { select: { id: true, name: true } },
} as const;



export const commentRepository = {
    create: (content: string, userId: string, videoId: string) =>
        prisma.comment.create({
            data: { content, userId, videoId, status: "APPROVED" },
            include: includeUser,
        }),

    findById: (id: string) =>
        prisma.comment.findUnique({ where: { id } }),

    findApprovedByVideo: (videoId: string) =>
        prisma.comment.findMany({
            where: { videoId, status: "APPROVED" },
            orderBy: { createdAt: "asc" },
            include: includeUser,
        }),



    deleteById: (id: string) =>
        prisma.comment.delete({ where: { id }, select: { id: true } }),
};
