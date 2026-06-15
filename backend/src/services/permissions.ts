import { userRepository } from "../repositories/user.repo.js";
import { AppError } from "../utils/errors.js";

export async function assertOwnerOrAdmin(ownerId: string, requesterId: string): Promise<void> {
    if (ownerId === requesterId) return;

    const requester = await userRepository.findById(requesterId);
    if (requester?.role !== "ADMIN") {
        throw AppError.forbidden();
    }
}
