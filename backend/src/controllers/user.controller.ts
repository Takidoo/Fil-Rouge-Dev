import { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { requireAuthUser } from "../types/express.js";

export const userController = {
    getMe: async (req: Request, res: Response) => {
        const { email } = requireAuthUser(req);
        const user = await userService.getProfile(email);
        res.status(200).json(user);
    },

    updateMe: async (req: Request, res: Response) => {
        const { email } = requireAuthUser(req);
        const user = await userService.updateProfile(email, req.body);
        res.status(200).json(user);
    },
};
