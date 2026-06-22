import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
    constructor(private authService: AuthService) {}

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const token = await this.authService.login(email, password);
        res.status(200).json({ token });
    };

    register = async (req: Request, res: Response) => {
        const { email, name, password } = req.body;
        const token = await this.authService.register(email, name, password);
        res.status(201).json({ token });
    };
}
