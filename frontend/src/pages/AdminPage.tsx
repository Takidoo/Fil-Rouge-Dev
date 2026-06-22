import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminUsers,
  deleteAdminUser,
  updateAdminUserRole,
  getAdminComments,
  moderateAdminComment,
  deleteAdminComment,
  deleteAdminVideo,
} from "../api/admin";
import { getVideos } from "../api/video";
import { extractApiError } from "../api/errors";
import { useAsync } from "../hooks/useAsync";
import { formatDate } from "../utils/format";
import { VIDEOS_BASE_URL } from "../constants";
import type { AdminComment, CommentStatus } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { PageHeader } from "../components/ui/PageHeader";
import { Avatar } from "../components/ui/Avatar";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { ConfirmInline } from "../components/ui/ConfirmInline";
import "./AdminPage.css";

type AdminTab = "overview" | "users" | "videos" | "comments";

const TAB_IDS: AdminTab[] = ["overview", "users", "videos", "comments"];

const STATUS_FILTERS: Array<{ value: CommentStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tous" },
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Approuvés" },
  { value: "REJECTED", label: "Rejetés" },
];

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
  const [commentFilter, setCommentFilter] = useState<CommentStatus | "ALL">("ALL");

  // User actions
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [togglingRoleId, setTogglingRoleId] = useState<string | null>(null);

  // Video actions
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [confirmVideoId, setConfirmVideoId] = useState<string | null>(null);

  // Comment actions
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [confirmCommentId, setConfirmCommentId] = useState<string | null>(null);

  const [actionError, setActionError] = useState("");

  const allUsers = users ?? [];
  const allVideos = videos ?? [];
  const allComments = comments ?? [];
  const error = usersError || actionError;

  const pendingComments = allComments.filter((c) => c.status === "PENDING");
  const filteredComments = commentFilter === "ALL"
    ? allComments
    : allComments.filter((c) => c.status === commentFilter);

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

  const handleModerate = async (id: string, status: "APPROVED" | "REJECTED") => {
    setModeratingId(id);
    setActionError("");
    try {
      const updated = await moderateAdminComment(id, status);
      setComments((prev) => prev ? prev.map((c) => c.id === id ? { ...c, status: updated.status } : c) : prev);
    } catch (err) {
      setActionError(extractApiError(err, "Impossible de modérer ce commentaire"));
    } finally {
      setModeratingId(null);
    }
  };

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
      case "comments":
        return pendingComments.length > 0
          ? `Commentaires · ${pendingComments.length} en attente`
          : `Commentaires (${allComments.length})`;
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
              className={`admin-tab ${activeTab === tab ? "active" : ""} ${tab === "comments" && pendingComments.length > 0 ? "admin-tab--alert" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabel(tab)}
              {tab === "comments" && pendingComments.length > 0 && (
                <span className="admin-tab-dot" />
              )}
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
                label="Commentaires en attente"
                value={loadingComments ? "…" : String(pendingComments.length)}
                sub="à modérer"
                warn={pendingComments.length > 0}
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

              {pendingComments.length > 0 && (
                <div className="admin-card admin-card--alert">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">
                      Commentaires en attente
                      <span className="admin-pending-badge">{pendingComments.length}</span>
                    </h3>
                    <button
                      className="btn btn-ghost admin-see-all"
                      onClick={() => { setCommentFilter("PENDING"); setActiveTab("comments"); }}
                    >
                      Modérer →
                    </button>
                  </div>
                  <div className="admin-list">
                    {pendingComments.slice(0, 3).map((c) => (
                      <div key={c.id} className="admin-list-row">
                        <Avatar name={c.user.name} size="md" />
                        <div className="admin-list-info">
                          <span className="admin-list-primary">
                            {c.user.name} · <span className="admin-list-video-ref">{c.video.title}</span>
                          </span>
                          <span className="admin-list-secondary admin-list-comment">{c.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <h3 className="admin-card-title">
                  Modération des commentaires
                  {pendingComments.length > 0 && (
                    <span className="admin-pending-badge">{pendingComments.length} en attente</span>
                  )}
                </h3>
                <span className="admin-count-badge">{filteredComments.length}</span>
              </div>

              <div className="admin-comment-filters">
                {STATUS_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`admin-filter-btn ${commentFilter === value ? "active" : ""}`}
                    onClick={() => setCommentFilter(value)}
                  >
                    {label}
                    {value === "PENDING" && pendingComments.length > 0 && (
                      <span className="admin-filter-count">{pendingComments.length}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Auteur</th>
                      <th>Commentaire</th>
                      <th>Vidéo</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingComments
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 6 }).map((__, j) => (
                              <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                            ))}
                          </tr>
                        ))
                      : filteredComments.length === 0
                      ? (
                          <tr>
                            <td colSpan={6} className="admin-table-empty">
                              Aucun commentaire{commentFilter !== "ALL" ? ` avec le statut "${commentFilter}"` : ""}
                            </td>
                          </tr>
                        )
                      : filteredComments.map((c) => (
                          <tr key={c.id} className={`admin-comment-row admin-comment-row--${c.status.toLowerCase()}`}>
                            <td>
                              <div className="admin-table-user">
                                <Avatar name={c.user.name} size="sm" />
                                <span className="admin-table-email">{c.user.name}</span>
                              </div>
                            </td>
                            <td className="admin-comment-cell">
                              <span className="admin-comment-text" title={c.content}>
                                {c.content.length > 80 ? c.content.slice(0, 80) + "…" : c.content}
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
                              <StatusBadge status={c.status} />
                            </td>
                            <td>
                              <CommentActions
                                comment={c}
                                busy={moderatingId === c.id || deletingCommentId === c.id}
                                confirmDelete={confirmCommentId === c.id}
                                onApprove={() => handleModerate(c.id, "APPROVED")}
                                onReject={() => handleModerate(c.id, "REJECTED")}
                                onDelete={() => handleDeleteComment(c.id)}
                                onConfirmDelete={() => setConfirmCommentId(c.id)}
                                onCancelDelete={() => setConfirmCommentId(null)}
                              />
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
  warn?: boolean;
}

function StatCard({ icon, label, value, sub, accent, warn }: StatCardProps) {
  return (
    <div className={`admin-stat-card ${accent ? "admin-stat-card--accent" : ""} ${warn ? "admin-stat-card--warn" : ""}`}>
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-body">
        <span className="admin-stat-value">{value}</span>
        <span className="admin-stat-label">{label}</span>
        <span className="admin-stat-sub">{sub}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:  { label: "En attente", cls: "badge-pending" },
    APPROVED: { label: "Approuvé",   cls: "badge-approved" },
    REJECTED: { label: "Rejeté",     cls: "badge-rejected" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

interface CommentActionsProps {
  comment: AdminComment;
  busy: boolean;
  confirmDelete: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function CommentActions({
  comment,
  busy,
  confirmDelete,
  onApprove,
  onReject,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: CommentActionsProps) {
  if (confirmDelete) {
    return (
      <ConfirmInline
        small
        busy={busy}
        onConfirm={onDelete}
        onCancel={onCancelDelete}
      />
    );
  }

  return (
    <div className="admin-actions-group">
      {comment.status !== "APPROVED" && (
        <button
          className="btn btn-xs btn-approve"
          disabled={busy}
          onClick={onApprove}
          title="Approuver"
        >
          ✓ Approuver
        </button>
      )}
      {comment.status !== "REJECTED" && (
        <button
          className="btn btn-xs btn-reject"
          disabled={busy}
          onClick={onReject}
          title="Rejeter"
        >
          ✗ Rejeter
        </button>
      )}
      <button
        className="btn btn-xs btn-danger"
        disabled={busy}
        onClick={onConfirmDelete}
        title="Supprimer définitivement"
      >
        Supprimer
      </button>
    </div>
  );
}
