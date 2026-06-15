import { z } from "zod";
import { idListSchema, boundedIntSchema } from "./common.validator.js";

export const uploadVideoSchema = z.object({
    title: z.string().min(1, "Le titre est requis").max(100, "Le titre est limité à 100 caractères"),
    description: z.string().min(1, "La description est requise").max(500, "La description est limitée à 500 caractères"),
    genreIds: idListSchema,
});

export const searchVideoSchema = z.object({
    q: z.string().optional().transform((v) => (v ?? "").trim()),
    genreIds: idListSchema,
    limit: boundedIntSchema(12, 1, 100),
    offset: boundedIntSchema(0, 0, 10_000),
});

export type SearchVideoQuery = z.infer<typeof searchVideoSchema>;
