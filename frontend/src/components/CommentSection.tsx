import { useState, type FormEvent } from "react";
import { getApprovedComments, createComment, deleteComment } from "../api/comment";
import { extractApiError } from "../api/errors";
import { useAsync } from "../hooks/useAsync";
import { formatDate } from "../utils/format";
import { COMMENT_MAX_LENGTH } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { Avatar } from "./ui/Avatar";
import { ErrorMessage } from "./ui/ErrorMessage";
import "./CommentSection.css";

export function CommentSection({ videoId }: { videoId: string }) {
  const { user } = useAuth();
  const {
    data: comments,
    setData: setComments,
    loading,
  } = useAsync(() => getApprovedComments(videoId), [videoId]);

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const allComments = comments ?? [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createComment(videoId, content.trim());
      setContent("");
      setComments((prev) => (prev ? [...prev, created] : [created]));
    } catch (err) {
      setError(extractApiError(err, "Impossible de publier le commentaire"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError("");
    try {
      await deleteComment(id);
      setComments((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
    } catch (err) {
      setError(extractApiError(err, "Impossible de supprimer le commentaire"));
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (authorId: string) =>
    user?.id === authorId || user?.role === "ADMIN";

  return (
    <div className="comment-section">
      <h2 className="comment-section-title">
        Commentaires
        {!loading && <span className="comment-count">{allComments.length}</span>}
      </h2>

      <form className="comment-form" onSubmit={handleSubmit}>
        <Avatar name={user?.name} size="md" />
        <div className="comment-form-right">
            <>
              <textarea
                className="comment-textarea"
                placeholder="Écrire un commentaire…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                maxLength={COMMENT_MAX_LENGTH}
              />
              <div className="comment-form-actions">
                <span className="comment-char-count">
                  {content.length}/{COMMENT_MAX_LENGTH}
                </span>
                <button
                  type="submit"
                  className="btn btn-primary comment-submit-btn"
                  disabled={!content.trim() || submitting}
                >
                  {submitting ? "Envoi…" : "Publier"}
                </button>
              </div>
            </>
        </div>
      </form>

      <ErrorMessage message={error} className="comment-error" />

      <div className="divider" />

      {loading ? (
        <div className="comment-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="comment-skeleton">
              <div className="skeleton comment-skeleton-avatar" />
              <div className="comment-skeleton-body">
                <div className="skeleton" style={{ height: 14, width: "25%" }} />
                <div className="skeleton" style={{ height: 12, width: "80%" }} />
                <div className="skeleton" style={{ height: 12, width: "55%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : allComments.length === 0 ? (
        <p className="comment-empty">Aucun commentaire pour l'instant. Soyez le premier !</p>
      ) : (
        <ul className="comment-list">
          {allComments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <Avatar name={comment.user.name} size="md" />
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">{comment.user.name}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  {canDelete(comment.userId) && (
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      aria-label="Supprimer ce commentaire"
                    >
                      {deletingId === comment.id ? "…" : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
