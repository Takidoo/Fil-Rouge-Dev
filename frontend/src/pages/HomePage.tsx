import { useRef } from "react";
import { Link } from "react-router-dom";
import { getVideos } from "../api/video";
import { getGenres } from "../api/genre";
import { useAsync } from "../hooks/useAsync";
import { VIDEOS_BASE_URL } from "../constants";
import type { Video } from "../types";
import { VideoCard } from "../components/VideoCard";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "../contexts/AuthContext";
import "./HomePage.css";

export function HomePage() {
  const { user } = useAuth();
  const {
    data: videos,
    setData: setVideos,
    loading: loadingVideos,
    error,
  } = useAsync(getVideos, [], "Impossible de charger les vidéos");
  const { data: genres, loading: loadingGenres } = useAsync(getGenres, []);

  const loading = loadingVideos || loadingGenres;
  const allVideos = videos ?? [];

  const handleDeleted = (id: string) => {
    setVideos((prev) => (prev ? prev.filter((v) => v.id !== id) : prev));
  };

  const featured = allVideos[0] ?? null;
  const heroThumbnail = featured?.thumbnailPath
    ? `${VIDEOS_BASE_URL}/${featured.thumbnailPath}`
    : null;

  // Only render rows for genres that have at least one video
  const rows = (genres ?? [])
    .map((genre) => ({
      genre,
      videos: allVideos.filter((v) => v.genres.some((vg) => vg.id === genre.id)),
    }))
    .filter((row) => row.videos.length > 0);

  // Videos with no genre get their own row
  const ungrouped = allVideos.filter((v) => v.genres.length === 0);

  return (
    <div className="home-page">
      {/* Hero */}
      {!loading && featured && (
        <section
          className="home-hero"
          style={heroThumbnail ? { "--hero-bg": `url(${heroThumbnail})` } as React.CSSProperties : {}}
        >
          <div className="home-hero-overlay" />
          <div className="home-hero-content page-container">
            <div className="home-hero-tag">Dernière vidéo</div>
            <h1 className="home-hero-title">{featured.title}</h1>
            <p className="home-hero-desc">{featured.description}</p>
            <div className="home-hero-actions">
              <Link to={`/video/${featured.id}`} className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Regarder
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="page-container">
        {!loading && (
          <p className="home-greeting">Bienvenue, <strong>{user?.name}</strong></p>
        )}

        <ErrorMessage message={error} />

        {loading && (
          <div className="home-row">
            <div className="skeleton" style={{ height: 28, width: 180, marginBottom: 16 }} />
            <div className="home-row-track">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="home-row-card">
                  <div className="skeleton" style={{ aspectRatio: "16/9", borderRadius: "var(--radius-md)" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && allVideos.length === 0 && !error && (
          <EmptyState
            icon="🎬"
            title="Aucune vidéo trouvée"
            description="Commencez par uploader votre première vidéo"
          >
            <Link to="/upload" className="btn btn-primary">
              Uploader une vidéo
            </Link>
          </EmptyState>
        )}

        {!loading && rows.map((row) => (
          <GenreRow
            key={row.genre.id}
            title={row.genre.name}
            videos={row.videos}
            onDeleted={handleDeleted}
          />
        ))}

        {!loading && ungrouped.length > 0 && (
          <GenreRow title="Autres vidéos" videos={ungrouped} onDeleted={handleDeleted} />
        )}
      </div>
    </div>
  );
}

interface GenreRowProps {
  title: string;
  videos: Video[];
  onDeleted: (id: string) => void;
}

function GenreRow({ title, videos, onDeleted }: GenreRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.8;
    trackRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="home-row">
      <div className="home-row-header">
        <h2 className="home-row-title">{title}</h2>
        <span className="home-row-count">{videos.length}</span>
      </div>

      <div className="home-row-wrapper">
        <button
          className="home-row-arrow home-row-arrow--left"
          onClick={() => scroll("left")}
          aria-label="Précédent"
        >
          ‹
        </button>
        <div className="home-row-track" ref={trackRef}>
          {videos.map((video) => (
            <div key={video.id} className="home-row-card">
              <VideoCard video={video} onDeleted={onDeleted} />
            </div>
          ))}
        </div>
        <button
          className="home-row-arrow home-row-arrow--right"
          onClick={() => scroll("right")}
          aria-label="Suivant"
        >
          ›
        </button>
      </div>
    </section>
  );
}
