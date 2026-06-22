import { Router } from "express";
import { commentController } from "../container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCommentSchema } from "../validators/comment.validator.js";

const router = Router();

router.get("/video/:videoId", commentController.listApproved);

router.use(authMiddleware);

router.post("/video/:videoId", validate(createCommentSchema), commentController.create);
router.delete("/:id", commentController.remove);

export default router;
