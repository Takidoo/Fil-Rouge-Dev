import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getVideos } from "../api/video";
import { getFavorites } from "../api/favorite";
import { useAsync } from "../hooks/useAsync";
import { formatMonthYear } from "../utils/format";
import { VideoCard } from "../components/VideoCard";
import { PageHeader } from "../components/ui/PageHeader";
import { Avatar } from "../components/ui/Avatar";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { EmptyState } from "../components/ui/EmptyState";
import { VideoGridSkeleton } from "../components/ui/VideoGridSkeleton";
import "./ProfilePage.css";

const UploadIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path
      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function ProfilePage() {
  const { user } = useAuth();
  const {
    data: videos,
    setData: setVideos,
    loading,
    error,
  } = useAsync(getVideos, [], "Impossible de charger vos vidéos");

  const {
    data: favs,
    loading: favsLoading,
    error: favsError,
  } = useAsync(getFavorites, [], "Impossible de charger vos favoris");

  const myVideos = (videos ?? []).filter((v) => v.userId === user?.id);

  const handleDeleted = (id: string) => {
    setVideos((prev) => (prev ? prev.filter((v) => v.id !== id) : prev));
  };

  return (
    <div className="profile-page">
      <div className="page-container">
        <PageHeader
          title="Mon profil"
          subtitle="Gérez votre contenu et votre activité"
        />

        {/* Identity card */}
        <div className="profile-card animate-in">
          <div className="profile-card-main">
            <Avatar name={user?.name} size="lg" />
            <div className="profile-identity">
              <div className="profile-identity-row">
                <span className="profile-email">{user?.name}</span>
                <span className={`badge ${user?.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                  {user?.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
                </span>
              </div>
              <span className="profile-email-sub">{user?.email}</span>
              <div className="profile-meta-row">
                <span className="profile-meta-item">
                  <span className="profile-meta-label">Membre depuis</span>
                  <span className="profile-meta-value">{formatMonthYear(user?.createdAt)}</span>
                </span>
                <span className="profile-meta-divider" />
                <span className="profile-meta-item">
                  <span className="profile-meta-label">Vidéos publiées</span>
                  <span className="profile-meta-value">{myVideos.length}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="profile-card-actions">
            <Link to="/upload" className="btn btn-primary profile-add-btn">
              {UploadIcon}
              Ajouter une vidéo
            </Link>
            <Link to="/settings" className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Paramètres
            </Link>
          </div>
        </div>

        {/* My videos */}
        <div className="profile-section animate-in">
          <div className="profile-section-header">
            <h2 className="profile-section-title">
              Mes vidéos
              {!loading && (
                <span className="profile-count">
                  {myVideos.length} vidéo{myVideos.length !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
          </div>

          <ErrorMessage message={error} />

          {loading && <VideoGridSkeleton count={4} gridClassName="profile-grid" />}

          {!loading && myVideos.length === 0 && !error && (
            <EmptyState
              icon="🎬"
              title="Aucune vidéo publiée"
              description="Partagez votre première création avec la communauté"
            >
              <Link to="/upload" className="btn btn-primary">
                {UploadIcon}
                Ajouter une vidéo
              </Link>
            </EmptyState>
          )}

          {!loading && myVideos.length > 0 && (
            <div className="profile-grid">
              {myVideos.map((video, i) => (
                <div key={video.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <VideoCard video={video} onDeleted={handleDeleted} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My favorites */}
        <div className="profile-section animate-in" style={{ animationDelay: "0.2s" }}>
          <div className="profile-section-header">
            <h2 className="profile-section-title">
              Mes favoris
              {!favsLoading && (
                <span className="profile-count">
                  {favs?.length || 0} favori{(favs?.length || 0) !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
          </div>

          <ErrorMessage message={favsError} />

          {favsLoading && <VideoGridSkeleton count={4} gridClassName="profile-grid" />}

          {!favsLoading && (!favs || favs.length === 0) && !favsError && (
            <EmptyState
              icon="⭐"
              title="Aucun favori"
              description="Vos vidéos favorites apparaîtront ici"
            />
          )}

          {!favsLoading && favs && favs.length > 0 && (
            <div className="profile-grid">
              {favs.map((video, i) => (
                <div key={video.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
