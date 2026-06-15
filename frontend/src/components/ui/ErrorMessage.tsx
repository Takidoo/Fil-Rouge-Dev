interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;
  return <div className={className ? `error-msg ${className}` : "error-msg"}>{message}</div>;
}
