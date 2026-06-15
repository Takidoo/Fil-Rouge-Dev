import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateUserSchema } from "../validators/user.validator.js";

const router = Router();

router.use(authMiddleware);

router.get("/me", userController.getMe);
router.put("/", validate(updateUserSchema), userController.updateMe);

export default router;
