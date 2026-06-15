import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/errors.js";
import { isRecordNotFound } from "../utils/prisma-errors.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("http");

export const notFoundMiddleware = (_req: Request, res: Response) => {
    res.status(404).json({ message: "Route introuvable" });
};

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(413).json({ message: "Fichier trop volumineux (500 Mo maximum)" });
            return;
        }
        res.status(400).json({ message: "Fichier invalide" });
        return;
    }

    if (isRecordNotFound(err)) {
        res.status(404).json({ message: "Ressource introuvable" });
        return;
    }

    logger.error("Unhandled error:", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
};
