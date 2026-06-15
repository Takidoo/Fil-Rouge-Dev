import { Request, Response } from "express";
import { genreService } from "../services/genre.service.js";

export const genreController = {
    list: async (_req: Request, res: Response) => {
        const genres = await genreService.getAll();
        res.status(200).json(genres);
    },
};
