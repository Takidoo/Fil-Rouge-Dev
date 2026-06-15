import { Request } from "express";
import { AppError } from "../utils/errors.js";
import { JwtAuthPayload } from "../utils/jwt.js";

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtAuthPayload;
        validQuery?: unknown;
    }
}

export function requireAuthUser(req: Request): JwtAuthPayload {
    if (!req.user) throw AppError.unauthorized();
    return req.user;
}

export function requireValidQuery<T>(req: Request): T {
    if (req.validQuery === undefined) {
        throw new Error("requireValidQuery used without validateQuery middleware");
    }
    return req.validQuery as T;
}
