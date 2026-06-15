import { prisma } from "../db/prisma.js";

export const genreRepository = {
    findAll: async () => {
        return prisma.genre.findMany({ orderBy: { name: "asc" } });
    },
};
