import { userRepository, UpdateUserData } from "../repositories/user.repo.js";
import { videoRepository } from "../repositories/video.repo.js";
import { deleteVideoAssets } from "../utils/video-files.js";
import { hashPassword } from "../utils/password.js";
import { AppError } from "../utils/errors.js";
import { isUniqueConstraintViolation } from "../utils/prisma-errors.js";

export interface UpdateProfileInput {
    email?: string;
    name?: string;
    password?: string;
}

export const userService = {
    getProfile: async (email: string) => {
        const user = await userRepository.findByEmail(email);
        if (!user) throw AppError.notFound("Utilisateur introuvable");
        return user;
    },

    updateProfile: async (currentEmail: string, input: UpdateProfileInput) => {
        const data: UpdateUserData = {};
        if (input.email) data.email = input.email;
        if (input.name) data.name = input.name;
        if (input.password) data.password = await hashPassword(input.password);

        try {
            return await userRepository.updateByEmail(currentEmail, data);
        } catch (error) {
            if (isUniqueConstraintViolation(error)) {
                throw AppError.conflict("Cet email est déjà utilisé");
            }
            throw error;
        }
    },

    listUsers: () => userRepository.findAllWithVideoCount(),

    deleteUser: async (id: string, requesterId: string) => {
        if (id === requesterId) {
            throw AppError.badRequest("Impossible de supprimer votre propre compte");
        }

        const videos = await videoRepository.findAssetsByUserId(id);
        for (const video of videos) {
            deleteVideoAssets(video);
        }

        return userRepository.deleteById(id);
    },
};
