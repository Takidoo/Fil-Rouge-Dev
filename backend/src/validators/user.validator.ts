import { z } from "zod";

export const updateUserSchema = z.object({
    email: z.email("Format d'email invalide").optional(),
    name: z.string().trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom est limité à 50 caractères")
        .optional(),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
}).refine(
    (data) => data.email !== undefined || data.name !== undefined || data.password !== undefined,
    { message: "Au moins un champ (email, nom ou mot de passe) doit être fourni" },
);
