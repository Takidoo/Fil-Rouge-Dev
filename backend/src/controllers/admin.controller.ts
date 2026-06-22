import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { requireAuthUser } from "../types/express.js";

export class AdminController {
    constructor(private userService: UserService) {}

    listUsers = async (_req: Request, res: Response) => {
        const users = await this.userService.listUsers();
        res.status(200).json(users);
    };

    deleteUser = async (req: Request, res: Response) => {
        const { userId } = requireAuthUser(req);
        await this.userService.deleteUser(req.params.id as string, userId);
        res.status(204).send();
    };
}
