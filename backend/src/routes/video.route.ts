import { Router } from "express";
import { videoController } from "../controllers/video.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate, validateQuery } from "../middlewares/validate.middleware.js";
import { videoUpload } from "../middlewares/upload.middleware.js";
import { uploadVideoSchema, searchVideoSchema } from "../validators/video.validator.js";

const router = Router();

router.use(authMiddleware);

router.get("/", videoController.list);
router.get("/search", validateQuery(searchVideoSchema), videoController.search);
router.post(
    "/upload",
    videoUpload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    validate(uploadVideoSchema),
    videoController.upload,
);
router.get("/:id", videoController.getById);
router.delete("/:id", videoController.remove);

export default router;
