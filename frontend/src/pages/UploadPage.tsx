import { useState, useRef, type DragEvent, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "../api/video";
import { getGenres } from "../api/genre";
import { extractApiError } from "../api/errors";
import { useAsync } from "../hooks/useAsync";
import { formatBytes } from "../utils/format";
import { PageHeader } from "../components/ui/PageHeader";
import { GenreChips } from "../components/ui/GenreChips";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { Spinner } from "../components/ui/Spinner";
import "./UploadPage.css";

export function UploadPage() {
  const navigate = useNavigate();
  const { data: genres } = useAsync(getGenres, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const toggleGenre = (id: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "video/mp4") {
      setVideoFile(file);
    } else {
      setError("Seuls les fichiers MP4 sont acceptés");
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setError("Veuillez sélectionner une vidéo");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("video", videoFile);
    fd.append("title", title);
    fd.append("description", description);
    if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
    if (selectedGenreIds.length > 0) fd.append("genreIds", selectedGenreIds.join(","));

    try {
      const result = await uploadVideo(fd, setProgress);
      setSuccess(true);
      setTimeout(() => navigate(`/video/${result.id}`), 1200);
    } catch (err) {
      setError(extractApiError(err, "Erreur lors de l'upload"));
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="page-container">
        <PageHeader
          title="Uploader une vidéo"
          subtitle="Partagez votre contenu avec la communauté"
        />

        {success ? (
          <div className="upload-success animate-in">
            <div className="upload-success-icon">✓</div>
            <h2>Upload réussi !</h2>
            <p>Redirection vers la vidéo…</p>
          </div>
        ) : (
          <form className="upload-form animate-in" onSubmit={handleSubmit}>
            <div className="upload-grid">
              {/* Left — video drop zone + progress */}
              <div className="upload-left">
                <div
                  className={`upload-dropzone ${dragging ? "dragging" : ""} ${videoFile ? "has-file" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !videoFile && videoInputRef.current?.click()}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4"
                    hidden
                    onChange={handleVideoChange}
                  />
                  {videoFile ? (
                    <div className="upload-file-info">
                      <div className="upload-file-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <polygon points="10 11 8 13 10 15 16 12"/>
                        </svg>
                      </div>
                      <div className="upload-file-details">
                        <span className="upload-file-name">{videoFile.name}</span>
                        <span className="upload-file-size">{formatBytes(videoFile.size)}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost upload-file-remove"
                        onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-dropzone-placeholder">
                      <div className="upload-dz-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="upload-dz-text">Glissez votre vidéo ici</p>
                      <p className="upload-dz-hint">ou cliquez pour parcourir · MP4 · max 500 MB</p>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="upload-progress-wrap">
                    <div className="upload-progress-header">
                      <span>Upload en cours…</span>
                      <span className="upload-progress-pct">{progress}%</span>
                    </div>
                    <div className="upload-progress-bar">
                      <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="upload-progress-note">
                      {progress === 100
                        ? "Traitement en cours, veuillez patienter…"
                        : "Ne fermez pas cette fenêtre"}
                    </p>
                  </div>
                )}

                <ErrorMessage message={error} />
              </div>

              {/* Right — metadata */}
              <div className="upload-right">
                <div className="form-group">
                  <label className="form-label">Titre *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Titre de la vidéo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    required
                    disabled={uploading}
                  />
                  <span className="upload-char-count">{title.length}/100</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input upload-textarea"
                    placeholder="Décrivez votre vidéo…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    required
                    disabled={uploading}
                  />
                  <span className="upload-char-count">{description.length}/500</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Genres</label>
                  <div className="upload-genres">
                    {!genres && <span className="upload-genres-empty">Chargement…</span>}
                    <GenreChips
                      genres={genres ?? []}
                      selectedIds={selectedGenreIds}
                      onToggle={toggleGenre}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Miniature (optionnel)</label>
                  <div className="upload-thumb-zone" onClick={() => thumbInputRef.current?.click()}>
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={handleThumbnailChange}
                      disabled={uploading}
                    />
                    {thumbnailPreview ? (
                      <div className="upload-thumb-preview">
                        <img src={thumbnailPreview} alt="Miniature" />
                        <div className="upload-thumb-overlay">Changer</div>
                      </div>
                    ) : (
                      <div className="upload-thumb-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>JPG, PNG, WebP</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary upload-submit"
                  type="submit"
                  disabled={uploading || !videoFile || !title || !description}
                >
                  {uploading ? (
                    <>
                      <Spinner size={18} />
                      Upload en cours…
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Publier la vidéo
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
