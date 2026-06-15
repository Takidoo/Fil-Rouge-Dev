import { prisma } from "../db/prisma.js";
import { normalizeForSearch } from "../utils/search.js";

const includeGenres = { genres: { orderBy: { name: "asc" as const } } };

export interface CreateVideoData {
    title: string;
    description: string;
    path: string;
    userId: string;
    thumbnailPath?: string;
    genreIds: string[];
}

export interface SearchVideosParams {
    q: string;
    genreIds: string[];
    limit: number;
    offset: number;
}

export const videoRepository = {
    create: ({ title, description, path, userId, thumbnailPath, genreIds }: CreateVideoData) =>
        prisma.video.create({
            data: {
                title,
                description,
                searchText: normalizeForSearch(`${title} ${description}`),
                path,
                userId,
                thumbnailPath,
                genres: genreIds.length > 0 ? { connect: genreIds.map((id) => ({ id })) } : undefined,
            },
            include: includeGenres,
        }),

    setHlsPath: (id: string, hlsPath: string) =>
        prisma.video.update({
            where: { id },
            data: { hlsPath },
            include: includeGenres,
        }),

    findAll: () =>
        prisma.video.findMany({
            orderBy: { uploadedAt: "desc" },
            include: includeGenres,
        }),

    findById: (id: string) =>
        prisma.video.findUnique({
            where: { id },
            include: includeGenres,
        }),

    findAssetsByUserId: (userId: string) =>
        prisma.video.findMany({
            where: { userId },
            select: { id: true, path: true, hlsPath: true, thumbnailPath: true },
        }),

    exists: async (id: string): Promise<boolean> =>
        (await prisma.video.count({ where: { id } })) > 0,

    search: async ({ q, genreIds, limit, offset }: SearchVideosParams) => {
        const normalisedQ = normalizeForSearch(q);

        const where = {
            AND: [
                normalisedQ ? { searchText: { contains: normalisedQ } } : {},
                genreIds.length > 0 ? { genres: { some: { id: { in: genreIds } } } } : {},
            ],
        };

        const [items, total] = await Promise.all([
            prisma.video.findMany({
                where,
                orderBy: { uploadedAt: "desc" },
                include: includeGenres,
                take: limit,
                skip: offset,
            }),
            prisma.video.count({ where }),
        ]);

        return { items, total };
    },

    deleteById: (id: string) =>
        prisma.video.delete({ where: { id }, select: { id: true } }),
};
