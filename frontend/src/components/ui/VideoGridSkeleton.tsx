import "./ui.css";

export function VideoCardSkeleton() {
  return (
    <div className="video-skeleton">
      <div className="skeleton video-skeleton-thumb" />
      <div className="video-skeleton-body">
        <div className="skeleton video-skeleton-line video-skeleton-line--title" />
        <div className="skeleton video-skeleton-line video-skeleton-line--wide" />
        <div className="skeleton video-skeleton-line video-skeleton-line--half" />
      </div>
    </div>
  );
}

interface VideoGridSkeletonProps {
  count: number;
  gridClassName: string;
}

export function VideoGridSkeleton({ count, gridClassName }: VideoGridSkeletonProps) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
