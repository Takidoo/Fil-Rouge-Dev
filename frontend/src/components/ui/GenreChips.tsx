import type { Genre } from "../../types";
import "./ui.css";

interface GenreChipsProps {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function GenreChips({ genres, selectedIds, onToggle, disabled }: GenreChipsProps) {
  return (
    <>
      {genres.map((genre) => {
        const selected = selectedIds.includes(genre.id);
        return (
          <button
            key={genre.id}
            type="button"
            className={`genre-chip ${selected ? "selected" : ""}`}
            onClick={() => onToggle(genre.id)}
            disabled={disabled}
            aria-pressed={selected}
          >
            {genre.name}
          </button>
        );
      })}
    </>
  );
}
