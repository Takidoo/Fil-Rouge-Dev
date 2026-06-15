import type { ReactNode } from "react";
import "./ui.css";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
