import type { ReactNode } from "react";
import "../pages/AuthPage.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-lines" />
      </div>

      <div className="auth-card animate-in">
        <div className="auth-logo">
          <span className="auth-logo-icon">▶</span>
          <span className="auth-logo-text">STREAMIX</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {children}

        <p className="auth-switch">{footer}</p>
      </div>
    </div>
  );
}
