import type { PrismaClient } from "../../generated/prisma/client.js";

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

export class UserRepository {
    constructor(private prisma: PrismaClient) {}

    create(data: CreateUserData) {
        return this.prisma.user.create({ data, select: publicUserSelect });
    }

    findById(id: string) {
        return this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email }, select: publicUserSelect });
    }

    findByEmailWithPassword(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    findAllWithVideoCount() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: { ...publicUserSelect, _count: { select: { videos: true } } },
        });
    }

    updateByEmail(email: string, data: UpdateUserData) {
        return this.prisma.user.update({ where: { email }, data, select: publicUserSelect });
    }

    deleteById(id: string) {
        return this.prisma.user.delete({ where: { id }, select: { id: true } });
    }
}
