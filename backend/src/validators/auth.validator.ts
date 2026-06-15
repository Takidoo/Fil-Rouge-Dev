import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Format d'email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
});

export const registerSchema = z.object({
    email: z.email("Format d'email invalide"),
    name: z.string().trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom est limité à 50 caractères"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});
