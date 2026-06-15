import { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/user.repo.js";
import { requireAuthUser } from "../types/express.js";
import { AppError } from "../utils/errors.js";

export const adminMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const { userId } = requireAuthUser(req);
    const user = await userRepository.findById(userId);

    if (user?.role !== "ADMIN") {
        next(AppError.forbidden("Accès réservé aux administrateurs"));
        return;
    }
    next();
};
