import { Router } from "express";
import { videoController, watchHistoryController, favoriteController } from "../container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate, validateQuery } from "../middlewares/validate.middleware.js";
import { videoUpload } from "../middlewares/upload.middleware.js";
import { uploadVideoSchema, searchVideoSchema } from "../validators/video.validator.js";

const router = Router();

router.get("/", videoController.list);
router.get("/search", validateQuery(searchVideoSchema), videoController.search);
router.get("/:id", videoController.getById);

router.use(authMiddleware);

router.post(
    "/upload",
    videoUpload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    validate(uploadVideoSchema),
    videoController.upload,
);
router.delete("/:id", videoController.remove);

router.put("/:videoId/progress", watchHistoryController.updateProgress);
router.get("/:videoId/progress", watchHistoryController.getProgress);

router.post("/:videoId/favorite", favoriteController.toggle);
router.get("/:videoId/favorite", favoriteController.check);

export default router;
