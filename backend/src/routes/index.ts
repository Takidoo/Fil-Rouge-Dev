import { Router } from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import videoRouter from "./video.route.js";
import genreRouter from "./genre.route.js";
import commentRouter from "./comment.route.js";
import adminRouter from "./admin.route.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/video", videoRouter);
apiRouter.use("/genre", genreRouter);
apiRouter.use("/comment", commentRouter);
apiRouter.use("/admin", adminRouter);
