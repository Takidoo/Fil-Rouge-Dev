import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { extractApiError } from "../api/errors";
import { AuthLayout } from "../components/AuthLayout";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { Spinner } from "../components/ui/Spinner";

export function RegisterPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): string => {
    if (name.trim().length < 2) return "Le nom doit contenir au moins 2 caractères";
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { token } = await register(email, name.trim(), password);
      await authLogin(token);
      navigate("/");
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez la plateforme de streaming"
      footer={
        <>
          Déjà un compte ?{" "}
          <Link to="/login" className="auth-link">Se connecter</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <div className="form-group">
          <label className="form-label">Nom</label>
          <input
            className="form-input"
            type="text"
            placeholder="Votre nom d'affichage"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={50}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input
            className="form-input"
            type="password"
            placeholder="Min. 8 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirmer le mot de passe</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? <Spinner size={18} /> : "Créer mon compte"}
        </button>
      </form>
    </AuthLayout>
  );
}
