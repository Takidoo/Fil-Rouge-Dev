import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCommentSchema } from "../validators/comment.validator.js";

const router = Router();

router.use(authMiddleware);

router.post("/video/:videoId", validate(createCommentSchema), commentController.create);
router.get("/video/:videoId", commentController.listApproved);

router.delete("/:id", commentController.remove);

export default router;
