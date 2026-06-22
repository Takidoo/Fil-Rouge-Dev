import { Router } from "express";
import { genreController } from "../container.js";

const router = Router();

router.get("/", genreController.list);

export default router;
