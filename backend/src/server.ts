import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("server");

const PORT = Number(process.env.PORT) || env.PORT;

createApp().listen(PORT, "0.0.0.0", () => {
    logger.info(`API running on port ${PORT} (${env.NODE_ENV}) — process.env.PORT=${process.env.PORT}`);
});
