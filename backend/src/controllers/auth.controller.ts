import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export const authController = {
    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const token = await authService.login(email, password);
        res.status(200).json({ token });
    },

    register: async (req: Request, res: Response) => {
        const { email, name, password } = req.body;
        const token = await authService.register(email, name, password);
        res.status(201).json({ token });
    },
};
