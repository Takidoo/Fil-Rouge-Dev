import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH } from "../config/constants.js";

export interface JwtAuthPayload {
    userId: string;
    email: string;
}

export function generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: AUTH.tokenTtl });
}

export function verifyToken(token: string): JwtAuthPayload {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
        typeof payload !== "object"
        || payload === null
        || typeof payload.userId !== "string"
        || typeof payload.email !== "string"
    ) {
        throw new Error("Malformed JWT payload");
    }

    return { userId: payload.userId, email: payload.email };
}
