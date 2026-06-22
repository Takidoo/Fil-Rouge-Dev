import { prisma } from "./db/prisma.js";

// Repositories
import { CommentRepository } from "./repositories/comment.repo.js";
import { GenreRepository } from "./repositories/genre.repo.js";
import { UserRepository } from "./repositories/user.repo.js";
import { VideoRepository } from "./repositories/video.repo.js";

// Services
import { AuthService } from "./services/auth.service.js";
import { CommentService } from "./services/comment.service.js";
import { GenreService } from "./services/genre.service.js";
import { PermissionService } from "./services/permissions.js";
import { UserService } from "./services/user.service.js";
import { VideoService } from "./services/video.service.js";

// Controllers
import { AdminController } from "./controllers/admin.controller.js";
import { AuthController } from "./controllers/auth.controller.js";
import { CommentController } from "./controllers/comment.controller.js";
import { GenreController } from "./controllers/genre.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { VideoController } from "./controllers/video.controller.js";
import { FavoriteRepository } from "./repositories/favorite.repo.js";
import { WatchHistoryRepository } from "./repositories/watch-history.repo.js";
import { FavoriteService } from "./services/favorite.service.js";
import { WatchHistoryService } from "./services/watch-history.service.js";
import { FavoriteController } from "./controllers/favorite.controller.js";
import { WatchHistoryController } from "./controllers/watch-history.controller.js";

// Instantiate Repositories
export const commentRepository = new CommentRepository(prisma);
export const genreRepository = new GenreRepository(prisma);
export const userRepository = new UserRepository(prisma);
export const videoRepository = new VideoRepository(prisma);
export const favoriteRepository = new FavoriteRepository(prisma);
export const watchHistoryRepository = new WatchHistoryRepository(prisma);

// Instantiate Services
const permissionService = new PermissionService(userRepository);
export const authService = new AuthService(userRepository);
export const commentService = new CommentService(commentRepository, videoRepository, permissionService);
export const genreService = new GenreService(genreRepository);
export const userService = new UserService(userRepository, videoRepository);
export const videoService = new VideoService(videoRepository, permissionService);
export const favoriteService = new FavoriteService(favoriteRepository);
export const watchHistoryService = new WatchHistoryService(watchHistoryRepository);

// Instantiate Controllers
export const adminController = new AdminController(userService);
export const authController = new AuthController(authService);
export const commentController = new CommentController(commentService);
export const genreController = new GenreController(genreService);
export const userController = new UserController(userService);
export const videoController = new VideoController(videoService);
export const favoriteController = new FavoriteController(favoriteService);
export const watchHistoryController = new WatchHistoryController(watchHistoryService);
