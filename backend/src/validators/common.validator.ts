import { z } from "zod";

export const idListSchema = z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
        if (!value) return [] as string[];
        if (Array.isArray(value)) return value.filter(Boolean);
        return value.split(",").map((s) => s.trim()).filter(Boolean);
    });

export const boundedIntSchema = (defaultValue: number, min: number, max: number) =>
    z
        .union([z.string(), z.number()])
        .optional()
        .transform((value) => {
            if (value === undefined || value === "") return defaultValue;
            const n = typeof value === "number" ? value : parseInt(value, 10);
            if (Number.isNaN(n)) return defaultValue;
            return Math.min(Math.max(n, min), max);
        });
