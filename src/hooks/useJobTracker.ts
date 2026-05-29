import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

interface TrackedApplication {
  _id: string;
  status: ApplicationStatus;
}

/**
 * Job-tracking state for a single job, used by the job-details modal on
 * Jobs and Dashboard. Returns null in `tracked` when the user hasn't
 * saved this job yet, or an `{ _id, status }` row when they have.
 *
 * `jobId` must be a Convex `Id<"jobs">` (the field the modal calls `_id`
 * after the visit-sync round-trip). Pre-sync external numeric ids will
 * fail the backend's validator silently — we keep the button disabled
 * in that case rather than spamming console errors.
 */
export function useJobTracker(jobId: string | null | undefined) {
  const [tracked, setTracked] = useState<TrackedApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setTracked(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const token = localStorage.getItem("jobplotter_token");
        const res = await fetch(`${API_URL}/applications/by-job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setTracked(data ?? null);
        } else {
          setTracked(null);
        }
      } catch (err) {
        console.error("Failed to fetch tracking status:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const track = async () => {
    if (!jobId || isSaving) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("jobplotter_token");
      const res = await fetch(`${API_URL}/applications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, status: "saved" }),
      });
      if (res.ok) {
        const data = await res.json();
        setTracked({ _id: data.id, status: data.status });
      }
    } catch (err) {
      console.error("Failed to track job:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return { tracked, isLoading, isSaving, track };
}
