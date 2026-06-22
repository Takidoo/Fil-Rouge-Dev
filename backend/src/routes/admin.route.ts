import { Router } from "express";
import { adminController } from "../container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", adminController.listUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

router.get("/comments", adminController.listComments);
router.patch("/comments/:id", adminController.moderateComment);
router.delete("/comments/:id", adminController.deleteComment);

router.delete("/videos/:id", adminController.deleteVideo);

export default router;
