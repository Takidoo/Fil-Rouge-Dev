import type { PrismaClient } from "../generated/prisma/client.js";
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

export class VideoRepository {
    constructor(private prisma: PrismaClient) {}

    create({ title, description, path, userId, thumbnailPath, genreIds }: CreateVideoData) {
        return this.prisma.video.create({
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
        });
    }

    setHlsPath(id: string, hlsPath: string) {
        return this.prisma.video.update({
            where: { id },
            data: { hlsPath },
            include: includeGenres,
        });
    }

    findAll() {
        return this.prisma.video.findMany({
            orderBy: { uploadedAt: "desc" },
            include: includeGenres,
        });
    }

    findById(id: string) {
        return this.prisma.video.findUnique({
            where: { id },
            include: includeGenres,
        });
    }

    findAssetsByUserId(userId: string) {
        return this.prisma.video.findMany({
            where: { userId },
            select: { id: true, path: true, hlsPath: true, thumbnailPath: true },
        });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.video.count({ where: { id } })) > 0;
    }

    async search({ q, genreIds, limit, offset }: SearchVideosParams) {
        const normalisedQ = normalizeForSearch(q);

        const where = {
            AND: [
                normalisedQ ? { searchText: { contains: normalisedQ } } : {},
                genreIds.length > 0 ? { genres: { some: { id: { in: genreIds } } } } : {},
            ],
        };

        const [items, total] = await Promise.all([
            this.prisma.video.findMany({
                where,
                orderBy: { uploadedAt: "desc" },
                include: includeGenres,
                take: limit,
                skip: offset,
            }),
            this.prisma.video.count({ where }),
        ]);

        return { items, total };
    }

    deleteById(id: string) {
        return this.prisma.video.delete({ where: { id }, select: { id: true } });
    }
}
