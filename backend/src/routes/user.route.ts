import { Router } from "express";
import { userController, watchHistoryController, favoriteController } from "../container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateUserSchema } from "../validators/user.validator.js";

const router = Router();

router.use(authMiddleware);

router.get("/me", userController.getMe);
router.put("/", validate(updateUserSchema), userController.updateMe);

router.get("/history", watchHistoryController.list);
router.get("/favorites", favoriteController.list);

export default router;
