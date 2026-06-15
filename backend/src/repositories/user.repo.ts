import { prisma } from "../db/prisma.js";

const publicUserSelect = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    role: true,
} as const;

export interface CreateUserData {
    email: string;
    name: string;
    password: string;
}

export interface UpdateUserData {
    email?: string;
    name?: string;
    password?: string;
}

export const userRepository = {
    create: (data: CreateUserData) =>
        prisma.user.create({ data, select: publicUserSelect }),

    findById: (id: string) =>
        prisma.user.findUnique({ where: { id }, select: publicUserSelect }),

    findByEmail: (email: string) =>
        prisma.user.findUnique({ where: { email }, select: publicUserSelect }),

    findByEmailWithPassword: (email: string) =>
        prisma.user.findUnique({ where: { email } }),

    findAllWithVideoCount: () =>
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: { ...publicUserSelect, _count: { select: { videos: true } } },
        }),

    updateByEmail: (email: string, data: UpdateUserData) =>
        prisma.user.update({ where: { email }, data, select: publicUserSelect }),

    deleteById: (id: string) =>
        prisma.user.delete({ where: { id }, select: { id: true } }),
};
