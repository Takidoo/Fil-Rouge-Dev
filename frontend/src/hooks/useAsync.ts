import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { extractApiError } from "../api/errors";

interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  setData: Dispatch<SetStateAction<T | null>>;
}

export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  errorFallback?: string,
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    // Data fetching is the documented exception: loading must flip back to
    // true when deps change, before the new request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(extractApiError(err, errorFallback));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
