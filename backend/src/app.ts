import express, { Express, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import { VIDEOS_ROOT } from "./config/paths.js";
import { apiRouter } from "./routes/index.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";

const setStreamingHeaders = (res: Response, filePath: string): void => {
    if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache");
    } else if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
        res.setHeader("Cache-Control", "public, max-age=86400");
    }
};

export function createApp(): Express {
    const app = express();

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "media-src": ["'self'", "*"],
            },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));

    app.use(cors({
        origin: env.ALLOWED_ORIGIN,
        credentials: true,
    }));

    app.use(express.json({ limit: "1mb" }));

    app.use("/videos", express.static(VIDEOS_ROOT, { setHeaders: setStreamingHeaders }));

    app.use(apiRouter);

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
}
