import { GenreRepository } from "../repositories/genre.repo.js";

export class GenreService {
    constructor(private genreRepository: GenreRepository) {}

    async getAll() {
        return this.genreRepository.findAll();
    }
}
