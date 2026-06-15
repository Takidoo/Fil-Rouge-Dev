import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { extractApiError } from "../api/errors";
import { AuthLayout } from "../components/AuthLayout";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { Spinner } from "../components/ui/Spinner";

export function LoginPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await login(email, password);
      await authLogin(token);
      navigate("/");
    } catch (err) {
      setError(extractApiError(err, "Identifiants invalides"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bon retour"
      subtitle="Connectez-vous pour continuer à regarder"
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link to="/register" className="auth-link">S'inscrire</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? <Spinner size={18} /> : "Se connecter"}
        </button>
      </form>
    </AuthLayout>
  );
}
