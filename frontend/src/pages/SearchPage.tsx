import { useState, useEffect } from "react";
import { searchVideos } from "../api/video";
import { getGenres } from "../api/genre";
import { extractApiError } from "../api/errors";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { SEARCH_PAGE_SIZE } from "../constants";
import type { Video } from "../types";
import { VideoCard } from "../components/VideoCard";
import { PageHeader } from "../components/ui/PageHeader";
import { GenreChips } from "../components/ui/GenreChips";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { EmptyState } from "../components/ui/EmptyState";
import { VideoGridSkeleton } from "../components/ui/VideoGridSkeleton";
import "./SearchPage.css";

export function SearchPage() {
  const { data: genres } = useAsync(getGenres, []);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);

  const [results, setResults] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch on any param change. AbortController cancels the previous request
  // when filters change faster than the network round-trip.
  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching: loading must restart with each new request
    setLoading(true);
    setError("");

    searchVideos({
      q: debouncedQuery,
      genreIds: selectedGenreIds,
      limit: SEARCH_PAGE_SIZE,
      offset,
      signal: controller.signal,
    })
      .then((res) => {
        setResults(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const msg = extractApiError(err, "Impossible de charger les résultats");
        if (msg) setError(msg);
        setResults([]);
        setTotal(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, selectedGenreIds, offset]);

  const handleDeleted = (id: string) => {
    setResults((prev) => prev.filter((v) => v.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  // Any filter change restarts pagination from the first page,
  // otherwise we could land beyond the last page of the new results.
  const updateQuery = (value: string) => {
    setQuery(value);
    setOffset(0);
  };

  const toggleGenre = (id: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
    setOffset(0);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedGenreIds([]);
    setOffset(0);
  };

  const hasActiveFilters = query.length > 0 || selectedGenreIds.length > 0;
  const currentPage = Math.floor(offset / SEARCH_PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));
  const canPrev = offset > 0;
  const canNext = offset + SEARCH_PAGE_SIZE < total;

  return (
    <div className="search-page">
      <div className="page-container">
        <PageHeader title="Rechercher" subtitle="Trouvez la vidéo qui vous correspond" />

        <div className="search-controls animate-in">
          <div className="search-input-wrapper">
            <svg
              className="search-input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              className="search-input"
              type="search"
              placeholder="Titre, description…"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                className="search-input-clear"
                onClick={() => updateQuery("")}
                aria-label="Effacer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="search-filters">
            <span className="search-filters-label">Genres :</span>
            <div className="search-genres">
              <GenreChips
                genres={genres ?? []}
                selectedIds={selectedGenreIds}
                onToggle={toggleGenre}
              />
            </div>
            {hasActiveFilters && (
              <button className="search-clear-all" onClick={clearFilters}>
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <ErrorMessage message={error} />

        <div className="search-results-header">
          <span className="search-results-count">
            {loading ? "Chargement…" : `${total} résultat${total !== 1 ? "s" : ""}`}
          </span>
          {total > 0 && (
            <span className="search-results-page">
              Page {currentPage} / {totalPages}
            </span>
          )}
        </div>

        {loading && <VideoGridSkeleton count={SEARCH_PAGE_SIZE} gridClassName="search-grid" />}

        {!loading && results.length === 0 && !error && (
          <EmptyState
            icon="🔍"
            title="Aucun résultat"
            description={
              hasActiveFilters
                ? "Essayez d'autres termes ou retirez des filtres"
                : "Commencez à taper pour rechercher"
            }
          />
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="search-grid">
              {results.map((video, i) => (
                <div key={video.id} style={{ animationDelay: `${i * 0.04}s` }}>
                  <VideoCard video={video} onDeleted={handleDeleted} />
                </div>
              ))}
            </div>

            <div className="search-pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setOffset((o) => Math.max(0, o - SEARCH_PAGE_SIZE))}
                disabled={!canPrev}
              >
                ‹ Précédent
              </button>
              <span className="search-pagination-info">
                {offset + 1}–{Math.min(offset + SEARCH_PAGE_SIZE, total)} sur {total}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setOffset((o) => o + SEARCH_PAGE_SIZE)}
                disabled={!canNext}
              >
                Suivant ›
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
