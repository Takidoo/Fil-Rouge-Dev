import { UserRepository, UpdateUserData } from "../repositories/user.repo.js";
import { VideoRepository } from "../repositories/video.repo.js";
import { deleteVideoAssets } from "../utils/video-files.js";
import { hashPassword } from "../utils/password.js";
import { AppError } from "../utils/errors.js";
import { isUniqueConstraintViolation } from "../utils/prisma-errors.js";

export interface UpdateProfileInput {
    email?: string;
    name?: string;
    password?: string;
}

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private videoRepository: VideoRepository
    ) {}

    async getProfile(email: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw AppError.notFound("Utilisateur introuvable");
        return user;
    }

    async updateProfile(currentEmail: string, input: UpdateProfileInput) {
        const data: UpdateUserData = {};
        if (input.email) data.email = input.email;
        if (input.name) data.name = input.name;
        if (input.password) data.password = await hashPassword(input.password);

        try {
            return await this.userRepository.updateByEmail(currentEmail, data);
        } catch (error) {
            if (isUniqueConstraintViolation(error)) {
                throw AppError.conflict("Cet email est déjà utilisé");
            }
            throw error;
        }
    }

    listUsers() {
        return this.userRepository.findAllWithVideoCount();
    }

    async deleteUser(id: string, requesterId: string) {
        if (id === requesterId) {
            throw AppError.badRequest("Impossible de supprimer votre propre compte");
        }

        const videos = await this.videoRepository.findAssetsByUserId(id);
        for (const video of videos) {
            deleteVideoAssets(video);
        }

        return this.userRepository.deleteById(id);
    }
}
