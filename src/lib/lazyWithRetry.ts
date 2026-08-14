import { lazy } from "react";

/**
 * Wraps React.lazy so a failed chunk load (stale asset hash after a redeploy,
 * or a transient network blip) triggers one full-page reload to fetch the
 * current build instead of surfacing as an unrecoverable render crash.
 */
export function lazyWithRetry<T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>
) {
  return lazy(async () => {
    const reloadKey = "jobplotter_chunk_reload";
    try {
      const module = await factory();
      sessionStorage.removeItem(reloadKey);
      return module;
    } catch (error) {
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
        // Never resolve — the reload is about to replace this whole page.
        return new Promise<T>(() => {});
      }
      // Already retried once via reload and it still failed — a real error.
      throw error;
    }
  });
}
