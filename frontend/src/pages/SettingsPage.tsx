import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../api/user";
import { extractApiError } from "../api/errors";
import { formatMonthYear } from "../utils/format";
import { PageHeader } from "../components/ui/PageHeader";
import { Avatar } from "../components/ui/Avatar";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { Spinner } from "../components/ui/Spinner";
import "./SettingsPage.css";

export function SettingsPage() {
  const { user, updateUser: updateAuthUser, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogoutEverywhere = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter de tous les appareils ?")) {
      logout();
      navigate("/login");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const hasEmailChange = email !== user?.email;
    const hasNameChange = trimmedName !== user?.name;
    const hasPasswordChange = newPassword.length > 0;

    if (!hasEmailChange && !hasNameChange && !hasPasswordChange) {
      setError("Aucune modification détectée");
      return;
    }
    if (hasNameChange && trimmedName.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères");
      return;
    }
    if (hasPasswordChange && newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (hasPasswordChange && newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    const payload: { email?: string; name?: string; password?: string } = {};
    if (hasEmailChange) payload.email = email;
    if (hasNameChange) payload.name = trimmedName;
    if (hasPasswordChange) payload.password = newPassword;

    setLoading(true);
    try {
      const updated = await updateUser(payload);
      updateAuthUser(updated);
      setSuccess("Profil mis à jour avec succès !");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-container">
        <PageHeader
          title="Paramètres du compte"
          subtitle="Gérez vos informations personnelles"
        />

        <div className="settings-grid animate-in">
          {/* Profile card */}
          <div className="settings-profile-card">
            <Avatar name={user?.name} size="xl" />
            <div className="settings-profile-info">
              <span className="settings-profile-email">{user?.name}</span>
              <span className="settings-profile-sub">{user?.email}</span>
              <span className={`badge ${user?.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                {user?.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
              </span>
            </div>
            <div className="settings-profile-meta">
              <div className="settings-meta-item">
                <span className="settings-meta-label">Membre depuis</span>
                <span className="settings-meta-value">{formatMonthYear(user?.createdAt)}</span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-label">Rôle</span>
                <span className="settings-meta-value">{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="settings-form-card">
            <h2 className="settings-form-title">Modifier le profil</h2>
            <div className="divider" />

            <form className="settings-form" onSubmit={handleSubmit}>
              <ErrorMessage message={error} />
              {success && <div className="success-msg">{success}</div>}

              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={50}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adresse email</label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="divider" />

              <div className="settings-password-section">
                <h3 className="settings-section-label">Changer le mot de passe</h3>
                <p className="settings-section-hint">
                  Laissez vide si vous ne souhaitez pas changer le mot de passe
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Nouveau mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min. 8 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmer le nouveau mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                className="btn btn-primary settings-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? <Spinner size={18} /> : "Enregistrer les modifications"}
              </button>
            </form>
          </div>
        </div>

        {/* Danger zone */}
        <div className="settings-danger-zone animate-in">
          <h2 className="settings-danger-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Zone de danger
          </h2>
          <p className="settings-danger-desc">
            Ces actions sont irréversibles. Procédez avec précaution.
          </p>
          <button className="btn btn-danger" onClick={handleLogoutEverywhere}>
            Se déconnecter de partout
          </button>
        </div>
      </div>
    </div>
  );
}
