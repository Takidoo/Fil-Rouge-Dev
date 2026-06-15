export class AppError extends Error {
    constructor(readonly statusCode: number, message: string) {
        super(message);
        this.name = "AppError";
    }

    static badRequest(message: string): AppError {
        return new AppError(400, message);
    }

    static unauthorized(message = "Authentification requise"): AppError {
        return new AppError(401, message);
    }

    static forbidden(message = "Accès refusé"): AppError {
        return new AppError(403, message);
    }

    static notFound(message = "Ressource introuvable"): AppError {
        return new AppError(404, message);
    }

    static conflict(message: string): AppError {
        return new AppError(409, message);
    }
}
