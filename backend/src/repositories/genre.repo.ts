import type { PrismaClient } from "../../generated/prisma/client.js";

export class GenreRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll() {
        return this.prisma.genre.findMany({ orderBy: { name: "asc" } });
    }
}
