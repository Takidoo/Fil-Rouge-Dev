import { userRepository } from "../repositories/user.repo.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { AppError } from "../utils/errors.js";
import { isUniqueConstraintViolation } from "../utils/prisma-errors.js";

export const authService = {
    login: async (email: string, password: string): Promise<string> => {
        const user = await userRepository.findByEmailWithPassword(email);

        if (!user || !(await verifyPassword(password, user.password))) {
            throw AppError.unauthorized("Identifiants invalides");
        }

        return generateToken(user.id, user.email);
    },

    register: async (email: string, name: string, password: string): Promise<string> => {
        try {
            const user = await userRepository.create({
                email,
                name,
                password: await hashPassword(password),
            });
            return generateToken(user.id, user.email);
        } catch (error) {
            if (isUniqueConstraintViolation(error)) {
                throw AppError.conflict("Cet email est déjà utilisé");
            }
            throw error;
        }
    },
};
