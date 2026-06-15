import "./ui.css";

interface ConfirmInlineProps {
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  question?: string;
  error?: string;
  confirmLabel?: string;
  small?: boolean;
}

export function ConfirmInline({
  onConfirm,
  onCancel,
  busy = false,
  question,
  error,
  confirmLabel = "Confirmer",
  small = false,
}: ConfirmInlineProps) {
  const btnClass = small ? "btn btn-sm" : "btn";

  return (
    <div className={`confirm-inline ${question ? "confirm-inline--block" : ""}`}>
      {question && <p className="confirm-inline-question">{question}</p>}
      {error && <div className="error-msg">{error}</div>}
      <div className="confirm-inline-actions">
        <button
          className={`${btnClass} btn-danger`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "…" : confirmLabel}
        </button>
        <button
          className={`${btnClass} btn-ghost`}
          onClick={onCancel}
          disabled={busy}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
