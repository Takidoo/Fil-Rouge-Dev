import { UserRepository } from "../repositories/user.repo.js";
import { AppError } from "../utils/errors.js";

export class PermissionService {
    constructor(private userRepository: UserRepository) {}

    async assertOwnerOrAdmin(ownerId: string, requesterId: string): Promise<void> {
        if (ownerId === requesterId) return;

        const requester = await this.userRepository.findById(requesterId);
        if (requester?.role !== "ADMIN") {
            throw AppError.forbidden();
        }
    }
}
