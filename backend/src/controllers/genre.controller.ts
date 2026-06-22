import { Request, Response } from "express";
import { GenreService } from "../services/genre.service.js";

export class GenreController {
    constructor(private genreService: GenreService) {}

    list = async (_req: Request, res: Response) => {
        const genres = await this.genreService.getAll();
        res.status(200).json(genres);
    };
}
