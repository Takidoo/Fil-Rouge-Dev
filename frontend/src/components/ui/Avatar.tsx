import "./ui.css";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string | undefined | null;
  size?: AvatarSize;
  title?: string;
}

export function Avatar({ name, size = "md", title }: AvatarProps) {
  return (
    <div className={`avatar avatar--${size}`} title={title ?? name ?? undefined}>
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}
