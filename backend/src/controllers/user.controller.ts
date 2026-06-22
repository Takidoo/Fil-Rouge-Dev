import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { requireAuthUser } from "../types/express.js";

export class UserController {
    constructor(private userService: UserService) {}

    getMe = async (req: Request, res: Response) => {
        const { email } = requireAuthUser(req);
        const user = await this.userService.getProfile(email);
        res.status(200).json(user);
    };

    updateMe = async (req: Request, res: Response) => {
        const { email } = requireAuthUser(req);
        const user = await this.userService.updateProfile(email, req.body);
        res.status(200).json(user);
    };
}
