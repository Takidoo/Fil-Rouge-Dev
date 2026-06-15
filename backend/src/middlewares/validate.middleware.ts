import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import "../types/express.js";

const sendValidationError = (res: Response, error: z.ZodError): void => {
    res.status(400).json({
        message: "Erreur de validation",
        errors: z.flattenError(error).fieldErrors,
    });
};

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        sendValidationError(res, result.error);
        return;
    }

    req.body = result.data;
    next();
};

export const validateQuery = (schema: ZodType) => (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        sendValidationError(res, result.error);
        return;
    }

    req.validQuery = result.data;
    next();
};
