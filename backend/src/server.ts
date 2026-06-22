import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("server");

createApp().listen(env.PORT, "0.0.0.0", () => {
    logger.info(`API running on port ${env.PORT} (${env.NODE_ENV})`);
});
