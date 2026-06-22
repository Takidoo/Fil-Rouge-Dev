import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authController } from "../container.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { AUTH_RATE_LIMIT } from "../config/constants.js";

const authLimiter = rateLimit({
    windowMs: AUTH_RATE_LIMIT.windowMs,
    limit: AUTH_RATE_LIMIT.limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Trop de tentatives. Réessayez dans quelques minutes." },
});

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/register", authLimiter, validate(registerSchema), authController.register);

export default router;
