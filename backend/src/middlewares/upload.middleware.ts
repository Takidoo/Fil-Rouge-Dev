import multer from "multer";
import { basename, extname } from "path";
import fs from "fs";
import { ORIGINALS_DIR, THUMBNAILS_DIR } from "../config/paths.js";
import { UPLOAD } from "../config/constants.js";
import { AppError } from "../utils/errors.js";

export interface VideoUploadFiles {
    video?: Express.Multer.File[];
    thumbnail?: Express.Multer.File[];
}

for (const dir of [ORIGINALS_DIR, THUMBNAILS_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const sanitizeFilename = (original: string): string =>
    basename(original).replace(/[^a-zA-Z0-9._-]/g, "_");

const isAllowed = (file: Express.Multer.File, rules: { mimeTypes: readonly string[]; extensions: readonly string[] }): boolean =>
    rules.mimeTypes.includes(file.mimetype) && rules.extensions.includes(extname(file.originalname).toLowerCase());

const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        cb(null, file.fieldname === "thumbnail" ? THUMBNAILS_DIR : ORIGINALS_DIR);
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`);
    },
});

export const videoUpload = multer({
    storage,
    limits: { fileSize: UPLOAD.maxVideoSizeBytes },
    fileFilter: (_req, file, cb) => {
        if (file.fieldname === "video" && isAllowed(file, UPLOAD.video)) {
            cb(null, true);
            return;
        }
        if (file.fieldname === "thumbnail" && isAllowed(file, UPLOAD.thumbnail)) {
            cb(null, true);
            return;
        }
        cb(AppError.badRequest("Type de fichier invalide : vidéo MP4 et miniature JPG/PNG/WebP uniquement"));
    },
});
