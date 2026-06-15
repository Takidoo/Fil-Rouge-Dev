import { z } from "zod";

export const createCommentSchema = z.object({
    content: z.string().trim()
        .min(1, "Le commentaire ne peut pas être vide")
        .max(2000, "Commentaire trop long (2000 caractères maximum)"),
});

