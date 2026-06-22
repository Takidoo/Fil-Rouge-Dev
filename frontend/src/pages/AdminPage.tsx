import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminUsers,
  deleteAdminUser,
  updateAdminUserRole,
  getAdminComments,
  deleteAdminComment,
  deleteAdminVideo,
} from "../api/admin";
import { getVideos } from "../api/video";
import { extractApiError } from "../api/errors";
import { useAsync } from "../hooks/useAsync";
import { formatDate } from "../utils/format";
import { VIDEOS_BASE_URL } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { PageHeader } from "../components/ui/PageHeader";
import { Avatar } from "../components/ui/Avatar";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { ConfirmInline } from "../components/ui/ConfirmInline";
import "./AdminPage.css";

type AdminTab = "overview" | "users" | "videos" | "comments";

const TAB_IDS: AdminTab[] = ["overview", "users", "videos", "comments"];

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: users,
    setData: setUsers,
    loading: loadingUsers,
    error: usersError,
  } = useAsync(getAdminUsers, [], "Impossible de charger les utilisateurs");

  const { data: videos, setData: setVideos, loading: loadingVideos } = useAsync(getVideos, []);

  const {
    data: comments,
    setData: setComments,
    loading: loadingComments,
  } = useAsync(getAdminComments, [], "Impossible de charger les commentaires");

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // User actions
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [togglingRoleId, setTogglingRoleId] = useState<string | null>(null);

  // Video actions
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [confirmVideoId, setConfirmVideoId] = useState<string | null>(null);

  // Comment actions
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [confirmCommentId, setConfirmCommentId] = useState<string | null>(null);

  const [actionError, setActionError] = useState("");

  const allUsers = users ?? [];
  const allVideos = videos ?? [];
  const allComments = comments ?? [];
  const error = usersError || actionError;

  /* ── User actions ─────────────────────────────────────────── */

  const handleDeleteUser = async (id: string) => {
    setDeletingUserId(id);
    setActionError("");
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev ? prev.filter((u) => u.id !== id) : prev);
      setConfirmUserId(null);
    } catch (err) {
      setActionError(extractApiError(err, "Impossible de supprimer cet utilisateur"));
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleToggleRole = async (id: string, currentRole: "ADMIN" | "USER") => {
    setTogglingRoleId(id);
    setActionError("");
    try {
      const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
      const updated = await updateAdminUserRole(id, newRole);
      setUsers((prev) => prev ? prev.map((u) => u.id === id ? { ...u, role: updated.role } : u) : prev);
    } catch (err) {
      setActionError(extractApiError(err, "Impossible de modifier le rôle"));
    } finally {
      setTogglingRoleId(null);
    }
  };

  /* ── Video actions ────────────────────────────────────────── */

  const handleDeleteVideo = async (id: string) => {
    setDeletingVideoId(id);
    setActionError("");
    try {
      await deleteAdminVideo(id);
      setVideos((prev) => prev ? prev.filter((v) => v.id !== id) : prev);
      setConfirmVideoId(null);
    } catch (err) {
      setActionError(extractApiError(err, "Impossible de supprimer cette vidéo"));
    } finally {
      setDeletingVideoId(null);
    }
  };

  /* ── Comment actions ──────────────────────────────────────── */

  const handleDeleteComment = async (id: string) => {
    setDeletingCommentId(id);
    setActionError("");
    try {
      await deleteAdminComment(id);
      setComments((prev) => prev ? prev.filter((c) => c.id !== id) : prev);
      setConfirmCommentId(null);
    } catch (err) {
      setActionError(extractApiError(err, "Impossible de supprimer ce commentaire"));
    } finally {
      setDeletingCommentId(null);
    }
  };

  /* ── Derived stats ────────────────────────────────────────── */

  const totalVideos = allVideos.length;
  const totalUsers = allUsers.length;
  const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;
  const recentUsers = allUsers.slice(0, 5);
  const recentVideos = allVideos.slice(0, 5);

  const tabLabel = (tab: AdminTab) => {
    switch (tab) {
      case "overview": return "Vue d'ensemble";
      case "users": return `Utilisateurs (${totalUsers})`;
      case "videos": return `Vidéos (${totalVideos})`;
      case "comments": return `Commentaires (${allComments.length})`;
      default: return "";
    }
  };

  return (
    <div className="admin-page">
      <div className="page-container">
        <PageHeader
          title="Dashboard Admin"
          subtitle={`Connecté en tant que ${user?.name}`}
          eyebrow={
            <>
              <span>Administration</span>
              <span className="admin-breadcrumb-sep">›</span>
              <span className="admin-breadcrumb-current">Dashboard</span>
            </>
          }
          actions={<span className="badge badge-admin admin-badge">Administrateur</span>}
        />

        <ErrorMessage message={error} className="admin-error" />

        {/* Tabs */}
        <div className="admin-tabs">
          {TAB_IDS.map((tab) => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>

        {/* ── Overview ─────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="admin-overview animate-in">
            <div className="admin-stats">
              <StatCard
                icon="👥"
                label="Utilisateurs"
                value={loadingUsers ? "…" : String(totalUsers)}
                sub={`dont ${adminCount} admin${adminCount !== 1 ? "s" : ""}`}
                accent
              />
              <StatCard
                icon="🎬"
                label="Vidéos"
                value={loadingVideos ? "…" : String(totalVideos)}
                sub="uploadées sur la plateforme"
              />
              <StatCard
                icon="💬"
                label="Commentaires"
                value={loadingComments ? "…" : String(allComments.length)}
                sub="publiés sur la plateforme"
              />
              <StatCard
                icon="📊"
                label="Moy. vidéos / user"
                value={totalUsers > 0 ? (totalVideos / totalUsers).toFixed(1) : "0"}
                sub="par utilisateur"
              />
            </div>

            <div className="admin-recent-grid">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Derniers utilisateurs</h3>
                  <button className="btn btn-ghost admin-see-all" onClick={() => setActiveTab("users")}>
                    Voir tout →
                  </button>
                </div>
                <div className="admin-list">
                  {loadingUsers
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="admin-list-row skeleton" style={{ height: 52 }} />
                      ))
                    : recentUsers.map((u) => (
                        <div key={u.id} className="admin-list-row">
                          <Avatar name={u.name} size="md" />
                          <div className="admin-list-info">
                            <span className="admin-list-primary">{u.name}</span>
                            <span className="admin-list-secondary">{u.email} · {formatDate(u.createdAt)}</span>
                          </div>
                          <div className="admin-list-right">
                            <span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                              {u.role}
                            </span>
                            <span className="admin-video-count">
                              {u._count.videos} vidéo{u._count.videos !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Dernières vidéos</h3>
                  <button className="btn btn-ghost admin-see-all" onClick={() => setActiveTab("videos")}>
                    Voir tout →
                  </button>
                </div>
                <div className="admin-list">
                  {loadingVideos
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="admin-list-row skeleton" style={{ height: 52 }} />
                      ))
                    : recentVideos.map((v) => (
                        <div
                          key={v.id}
                          className="admin-list-row admin-list-row--clickable"
                          onClick={() => navigate(`/video/${v.id}`)}
                        >
                          <div className="admin-video-thumb">
                            {v.thumbnailPath
                              ? <img src={`${VIDEOS_BASE_URL}/${v.thumbnailPath}`} alt="" />
                              : <span>▶</span>}
                          </div>
                          <div className="admin-list-info">
                            <span className="admin-list-primary">{v.title}</span>
                            <span className="admin-list-secondary">{formatDate(v.uploadedAt)}</span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Users tab ────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="admin-users animate-in">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Tous les utilisateurs</h3>
                <span className="admin-count-badge">{totalUsers}</span>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Vidéos</th>
                      <th>Membre depuis</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 5 }).map((__, j) => (
                              <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                            ))}
                          </tr>
                        ))
                      : allUsers.map((u) => (
                          <tr key={u.id} className={u.id === user?.id ? "admin-table-row--self" : ""}>
                            <td>
                              <div className="admin-table-user">
                                <Avatar name={u.name} size="sm" />
                                <div>
                                  <span className="admin-table-email">{u.name}</span>
                                  <span className="admin-table-desc">{u.email}</span>
                                  {u.id === user?.id && (
                                    <span className="admin-self-tag">Vous</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="admin-table-num">{u._count.videos}</td>
                            <td className="admin-table-date">{formatDate(u.createdAt)}</td>
                            <td>
                              {u.id !== user?.id ? (
                                <div className="admin-actions-group">
                                  <button
                                    className={`btn btn-sm ${u.role === "ADMIN" ? "btn-ghost" : "btn-outline"}`}
                                    disabled={togglingRoleId === u.id}
                                    onClick={() => handleToggleRole(u.id, u.role)}
                                    title={u.role === "ADMIN" ? "Rétrograder en USER" : "Promouvoir en ADMIN"}
                                  >
                                    {togglingRoleId === u.id ? "…" : u.role === "ADMIN" ? "Rétrograder" : "Promouvoir"}
                                  </button>
                                  {confirmUserId === u.id ? (
                                    <ConfirmInline
                                      small
                                      busy={deletingUserId === u.id}
                                      onConfirm={() => handleDeleteUser(u.id)}
                                      onCancel={() => setConfirmUserId(null)}
                                    />
                                  ) : (
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => setConfirmUserId(u.id)}
                                    >
                                      Supprimer
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="admin-table-na">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Videos tab ───────────────────────────────────────── */}
        {activeTab === "videos" && (
          <div className="admin-videos animate-in">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Toutes les vidéos</h3>
                <span className="admin-count-badge">{totalVideos}</span>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Vidéo</th>
                      <th>Uploadée le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingVideos
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 3 }).map((__, j) => (
                              <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                            ))}
                          </tr>
                        ))
                      : allVideos.map((v) => (
                          <tr key={v.id}>
                            <td>
                              <div
                                className="admin-table-video admin-table-row--clickable"
                                onClick={() => navigate(`/video/${v.id}`)}
                              >
                                <div className="admin-video-thumb">
                                  {v.thumbnailPath
                                    ? <img src={`${VIDEOS_BASE_URL}/${v.thumbnailPath}`} alt="" />
                                    : <span>▶</span>}
                                </div>
                                <div>
                                  <span className="admin-table-email">{v.title}</span>
                                  <span className="admin-table-desc">
                                    {v.description.slice(0, 60)}{v.description.length > 60 ? "…" : ""}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="admin-table-date">{formatDate(v.uploadedAt)}</td>
                            <td>
                              <div className="admin-actions-group">
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => navigate(`/video/${v.id}`)}
                                >
                                  Voir →
                                </button>
                                {confirmVideoId === v.id ? (
                                  <ConfirmInline
                                    small
                                    busy={deletingVideoId === v.id}
                                    onConfirm={() => handleDeleteVideo(v.id)}
                                    onCancel={() => setConfirmVideoId(null)}
                                  />
                                ) : (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => setConfirmVideoId(v.id)}
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Comments tab ─────────────────────────────────────── */}
        {activeTab === "comments" && (
          <div className="admin-comments animate-in">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Tous les commentaires</h3>
                <span className="admin-count-badge">{allComments.length}</span>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Auteur</th>
                      <th>Commentaire</th>
                      <th>Vidéo</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingComments
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 5 }).map((__, j) => (
                              <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                            ))}
                          </tr>
                        ))
                      : allComments.length === 0
                      ? (
                          <tr>
                            <td colSpan={5} className="admin-table-empty">
                              Aucun commentaire pour le moment
                            </td>
                          </tr>
                        )
                      : allComments.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <div className="admin-table-user">
                                <Avatar name={c.user.name} size="sm" />
                                <span className="admin-table-email">{c.user.name}</span>
                              </div>
                            </td>
                            <td className="admin-comment-cell">
                              <span className="admin-comment-text" title={c.content}>
                                {c.content.length > 100 ? c.content.slice(0, 100) + "…" : c.content}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-xs btn-ghost admin-video-link"
                                onClick={() => navigate(`/video/${c.video.id}`)}
                              >
                                {c.video.title.length > 30 ? c.video.title.slice(0, 30) + "…" : c.video.title}
                              </button>
                            </td>
                            <td className="admin-table-date">{formatDate(c.createdAt)}</td>
                            <td>
                              {confirmCommentId === c.id ? (
                                <ConfirmInline
                                  small
                                  busy={deletingCommentId === c.id}
                                  onConfirm={() => handleDeleteComment(c.id)}
                                  onCancel={() => setConfirmCommentId(null)}
                                />
                              ) : (
                                <button
                                  className="btn btn-sm btn-danger"
                                  disabled={deletingCommentId === c.id}
                                  onClick={() => setConfirmCommentId(c.id)}
                                >
                                  Supprimer
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`admin-stat-card ${accent ? "admin-stat-card--accent" : ""}`}>
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-body">
        <span className="admin-stat-value">{value}</span>
        <span className="admin-stat-label">{label}</span>
        <span className="admin-stat-sub">{sub}</span>
      </div>
    </div>
  );
}

