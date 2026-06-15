import { genreRepository } from "../repositories/genre.repo.js";

export const genreService = {
    getAll: async () => {
        return genreRepository.findAll();
    },
};
