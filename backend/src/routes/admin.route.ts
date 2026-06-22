import { Router } from "express";
import { adminController } from "../container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", adminController.listUsers);
router.delete("/users/:id", adminController.deleteUser);

export default router;
