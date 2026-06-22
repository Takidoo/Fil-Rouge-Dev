import { useNavigate } from "react-router-dom";
import type { Video } from "../types";
import { VIDEOS_BASE_URL } from "../constants";
import { formatDate } from "../utils/format";
import "./VideoCard.css";

interface VideoCardProps {
  video: Video;
  onDeleted?: (id: string) => void;
}

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();

  const thumbnailUrl = video.thumbnailPath
    ? `${VIDEOS_BASE_URL}/${video.thumbnailPath}`
    : null;

  const openVideo = () => navigate(`/video/${video.id}`);

  return (
    <article className="video-card">
      <div className="video-card-thumb" onClick={openVideo}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={video.title} loading="lazy" />
        ) : (
          <div className="video-card-thumb-placeholder">
            <span className="video-card-play-icon">▶</span>
          </div>
        )}
        <div className="video-card-overlay">
          <div className="video-card-play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="video-card-info">
        <h3 className="video-card-title" onClick={openVideo}>
          {video.title}
        </h3>
        <p className="video-card-desc">{video.description}</p>
        {video.genres.length > 0 && (
          <div className="video-card-genres">
            {video.genres.map((g) => (
              <span key={g.id} className="video-card-genre">
                {g.name}
              </span>
            ))}
          </div>
        )}
        <div className="video-card-meta">
          <span className="video-card-date">{formatDate(video.uploadedAt)}</span>
        </div>
      </div>
    </article>
  );
}
