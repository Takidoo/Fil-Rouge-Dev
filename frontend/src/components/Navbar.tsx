import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Avatar } from "./ui/Avatar";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/search", label: "Recherche" },
  { to: "/profile", label: "Profil" },
  { to: "/settings", label: "Paramètres" },
] as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = (path: string, extra = "") =>
    `navbar-link ${extra} ${location.pathname === path ? "active" : ""}`.trim();

  return (
    <nav className={`navbar${menuOpen ? " navbar--menu-open" : ""}`}>
      <div className="navbar-inner page-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">▶</span>
          <span className="navbar-logo-text">STREAMIX</span>
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className={linkClass(to)}>
              {label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link to="/admin" className={linkClass("/admin", "navbar-link--admin")}>
              ⚙ Admin
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <Avatar name={user?.name} size="sm" />
          <span className="navbar-email">{user?.name}</span>
          {user?.role === "ADMIN" && <span className="badge badge-admin">Admin</span>}
          <button className="btn btn-ghost navbar-logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <button
          className="navbar-menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="navbar-mobile-menu" aria-hidden={!menuOpen}>
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`navbar-mobile-link ${location.pathname === to ? "active" : ""}`}
          >
            {label}
          </Link>
        ))}
        {user?.role === "ADMIN" && (
          <Link
            to="/admin"
            className={`navbar-mobile-link navbar-link--admin ${location.pathname === "/admin" ? "active" : ""}`}
          >
            ⚙ Admin
          </Link>
        )}
        <div className="navbar-mobile-divider" />
        <div className="navbar-mobile-user">
          <Avatar name={user?.name} size="sm" />
          <span className="navbar-mobile-name">{user?.name}</span>
          {user?.role === "ADMIN" && <span className="badge badge-admin">Admin</span>}
        </div>
        <button className="btn btn-ghost navbar-mobile-logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
