import bcrypt from "bcrypt";
import { AUTH } from "../config/constants.js";

export function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, AUTH.saltRounds);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}
