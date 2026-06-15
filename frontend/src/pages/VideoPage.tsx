import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getVideo, deleteVideo } from "../api/video";
import { extractApiError } from "../api/errors";
import { useAsync } from "../hooks/useAsync";
import { VIDEOS_BASE_URL } from "../constants";
import { formatDateLong } from "../utils/format";
import { VideoPlayer } from "../components/VideoPlayer";
import { CommentSection } from "../components/CommentSection";
import { ConfirmInline } from "../components/ui/ConfirmInline";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../contexts/AuthContext";
import "./VideoPage.css";

export function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: video,
    loading,
    error,
  } = useAsync(() => getVideo(id!), [id], "Vidéo introuvable");

  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = user && video && (user.id === video.userId || user.role === "ADMIN");

  const handleDelete = async () => {
    if (!video) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteVideo(video.id);
      navigate("/");
    } catch (err) {
      setDeleteError(extractApiError(err, "Impossible de supprimer la vidéo"));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="video-page">
        <div className="page-container">
          <div className="video-page-loading">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="video-page">
        <div className="page-container">
          <div className="video-page-error">
            <h2>Vidéo introuvable</h2>
            <p>{error || "Cette vidéo n'existe pas ou a été supprimée."}</p>
            <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-page animate-in">
      <div className="page-container">
        {/* Back */}
        <button className="video-page-back btn btn-ghost" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </button>

        {/* Player */}
        <VideoPlayer hlsPath={video.hlsPath} videoPath={video.path} />

        {/* Info */}
        <div className="video-page-info">
          <div className="video-page-info-main">
            <h1 className="video-page-title">{video.title}</h1>
            <p className="video-page-date">
              Uploadé le {formatDateLong(video.uploadedAt)}
            </p>
            {video.genres.length > 0 && (
              <div className="video-page-genres">
                {video.genres.map((g) => (
                  <span key={g.id} className="video-page-genre">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <div className="divider" />
            <p className="video-page-desc">{video.description}</p>
          </div>

          {isOwner && (
            <div className="video-page-actions">
              {!showConfirm ? (
                <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Supprimer la vidéo
                </button>
              ) : (
                <ConfirmInline
                  question="Êtes-vous sûr de vouloir supprimer cette vidéo ?"
                  confirmLabel={deleting ? "Suppression..." : "Oui, supprimer"}
                  error={deleteError}
                  busy={deleting}
                  onConfirm={handleDelete}
                  onCancel={() => { setShowConfirm(false); setDeleteError(""); }}
                />
              )}
            </div>
          )}
        </div>

        {!video.hlsPath && video.thumbnailPath && (
          <div className="video-page-thumb-note">
            <img
              src={`${VIDEOS_BASE_URL}/${video.thumbnailPath}`}
              alt="Miniature"
              className="video-page-thumb-preview"
            />
          </div>
        )}

        {/* Comments */}
        <CommentSection videoId={video.id} />
      </div>
    </div>
  );
}
