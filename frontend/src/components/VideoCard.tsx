import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Video } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { deleteVideo } from "../api/video";
import { VIDEOS_BASE_URL } from "../constants";
import { formatDate } from "../utils/format";
import { ConfirmInline } from "./ui/ConfirmInline";
import "./VideoCard.css";

interface VideoCardProps {
  video: Video;
  onDeleted: (id: string) => void;
}

export function VideoCard({ video, onDeleted }: VideoCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = user?.id === video.userId || user?.role === "ADMIN";

  const thumbnailUrl = video.thumbnailPath
    ? `${VIDEOS_BASE_URL}/${video.thumbnailPath}`
    : null;

  const openVideo = () => navigate(`/video/${video.id}`);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVideo(video.id);
      onDeleted(video.id);
    } catch {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

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
          {isOwner && !showConfirm && (
            <button
              className="btn btn-danger video-card-delete"
              onClick={() => setShowConfirm(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
              Supprimer
            </button>
          )}
          {showConfirm && (
            <ConfirmInline
              small
              busy={deleting}
              onConfirm={handleDelete}
              onCancel={() => setShowConfirm(false)}
            />
          )}
        </div>
      </div>
    </article>
  );
}
