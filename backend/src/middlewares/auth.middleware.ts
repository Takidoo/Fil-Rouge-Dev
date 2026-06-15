import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import "../types/express.js";

const BEARER_PREFIX = "Bearer ";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith(BEARER_PREFIX)) {
        next(AppError.unauthorized("Authentification requise : token manquant"));
        return;
    }

    try {
        req.user = verifyToken(authHeader.slice(BEARER_PREFIX.length));
        next();
    } catch {
        next(AppError.unauthorized("Session invalide ou expirée"));
    }
};
