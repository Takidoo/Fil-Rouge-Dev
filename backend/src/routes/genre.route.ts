import { Router } from "express";
import { genreController } from "../controllers/genre.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, genreController.list);

export default router;
