import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminUsers,
  deleteAdminUser,
} from "../api/admin";
import { getVideos } from "../api/video";
import { extractApiError } from "../api/errors";
import { useAsync } from "../hooks/useAsync";
import { formatDate } from "../utils/format";
import { VIDEOS_BASE_URL } from "../constants";
import type { } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { PageHeader } from "../components/ui/PageHeader";
import { Avatar } from "../components/ui/Avatar";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { ConfirmInline } from "../components/ui/ConfirmInline";
import "./AdminPage.css";

type AdminTab = "overview" | "users" | "videos";

const TAB_IDS: AdminTab[] = ["overview", "users", "videos"];

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: users,
    setData: setUsers,
    loading: loadingUsers,
    error: usersError,
  } = useAsync(getAdminUsers, [], "Impossible de charger les utilisateurs");
  const { data: videos, loading: loadingVideos } = useAsync(getVideos, []);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const allUsers = users ?? [];
  const allVideos = videos ?? [];
  const error = usersError || actionError;

  const handleDeleteUser = async (id: string) => {
    setDeletingId(id);
    setActionError("");
    try {
      await deleteAdminUser(id);
      setUsers((prev) => (prev ? prev.filter((u) => u.id !== id) : prev));
      setConfirmId(null);
    } catch (err) {
      setActionError(extractApiError(err, "Impossible de supprimer cet utilisateur"));
    } finally {
      setDeletingId(null);
    }
  };

  // moderation removed

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
      default:
        return "";
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

        {/* Overview */}
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

        {/* Users tab */}
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
                                confirmId === u.id ? (
                                  <ConfirmInline
                                    small
                                    busy={deletingId === u.id}
                                    onConfirm={() => handleDeleteUser(u.id)}
                                    onCancel={() => setConfirmId(null)}
                                  />
                                ) : (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => setConfirmId(u.id)}
                                  >
                                    Supprimer
                                  </button>
                                )
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

        {/* Videos tab */}
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
                          <tr
                            key={v.id}
                            className="admin-table-row--clickable"
                            onClick={() => navigate(`/video/${v.id}`)}
                          >
                            <td>
                              <div className="admin-table-video">
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
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={(e) => { e.stopPropagation(); navigate(`/video/${v.id}`); }}
                              >
                                Voir →
                              </button>
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
