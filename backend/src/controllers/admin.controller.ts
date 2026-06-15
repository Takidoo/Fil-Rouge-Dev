import { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { requireAuthUser } from "../types/express.js";

export const adminController = {
    listUsers: async (_req: Request, res: Response) => {
        const users = await userService.listUsers();
        res.status(200).json(users);
    },

    deleteUser: async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        await userService.deleteUser(req.params.id as string, userId);
        res.status(204).send();
    },
};
