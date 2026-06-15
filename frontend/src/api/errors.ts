import type { ApiError } from "../types";

export function extractApiError(err: unknown, fallback = "Une erreur est survenue"): string {
  if (!err || typeof err !== "object") return fallback;

  const e = err as {
    response?: { status?: number; data?: ApiError };
    message?: string;
    code?: string;
  };

  if (e.code === "ERR_CANCELED" || e.message === "canceled") return "";

  if (!e.response) {
    if (e.code === "ERR_NETWORK" || e.message === "Network Error") {
      return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }
    if (e.code === "ECONNABORTED" || e.message?.includes("timeout")) {
      return "La requête a pris trop de temps. Réessayez.";
    }
    return fallback;
  }

  const { status, data } = e.response;

  if (data?.errors) {
    const msgs = Object.values(data.errors).flat().filter(Boolean);
    if (msgs.length > 0) return msgs[0];
  }

  if (data?.message) return data.message;

  if (status === 400) return "Requête invalide.";
  if (status === 401) return "Session expirée. Reconnectez-vous.";
  if (status === 403) return "Vous n'avez pas les droits pour effectuer cette action.";
  if (status === 404) return "La ressource demandée est introuvable.";
  if (status === 409) return "Cette ressource existe déjà.";
  if (status === 413) return "Le fichier est trop volumineux.";
  if (status === 422) return "Les données envoyées sont invalides.";
  if (status === 429) return "Trop de requêtes. Patientez un moment avant de réessayer.";
  if (status && status >= 500) return "Erreur serveur. Réessayez dans quelques instants.";

  return fallback;
}
