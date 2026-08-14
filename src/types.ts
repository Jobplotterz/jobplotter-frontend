import { useEffect, useState, type Dispatch, type SetStateAction, useCallback, useRef } from "react";
import { useAuth } from "./contexts/AuthContext";
import { signalExtensionSync } from "./lib/extensionSync";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  skills: string[];
}

export const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
  },
  experience: [],
  education: [],
  certifications: [],
  skills: [],
};

// A resume's `data` field can be corrupted (legacy schema, truncated write) —
// an unguarded JSON.parse there throws inside an async load path with no
// surrounding try/catch, which stalls `isInitialLoad` forever and leaves the
// Builder page stuck. Parse defensively and fall back to extractedData/blank.
const safeParseResumeData = (raw: unknown, extractedData?: unknown): ResumeData | null => {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Corrupted resume data, falling back", e);
    }
  }
  return (extractedData as ResumeData) || null;
};

const getResumeCacheKey = (userId: string, id: string) => `jobplotter_${userId}_resume_${id}`;

const saveResumeToCache = (userId: string, id: string, resume: any) => {
  try {
    localStorage.setItem(getResumeCacheKey(userId, id), JSON.stringify(resume));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

const getResumeFromCache = (userId: string, id: string) => {
  try {
    const cached = localStorage.getItem(getResumeCacheKey(userId, id));
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error("Failed to read from localStorage", e);
    return null;
  }
};

export function useResumeData(initialId?: string | null): [ResumeData, Dispatch<SetStateAction<ResumeData>>, (data: ResumeData, title?: string) => Promise<void>, boolean, any[], (id: string) => Promise<void>, string, (t: string) => void, string | null, any, string | null, boolean] {
  const { user } = useAuth();
  const userId = user?.id?.toString() || "guest";
  
  const [data, setData] = useState<ResumeData>(initialResumeData);
  const [title, setTitle] = useState("My Resume");
  const [review, setReview] = useState<any>(null);
  const [lastReviewedHash, setLastReviewedHash] = useState<string | null>(null);
  const [needsAnalysis, setNeedsAnalysis] = useState<boolean>(false);
  
  // Initialize from localStorage if no initialId is provided
  const activeResumeKey = `jobplotter_${userId}_active_resume_id`;
  const storedId = typeof window !== 'undefined' ? localStorage.getItem(activeResumeKey) : null;
  
  const [resumeId, setResumeId] = useState<string | null>(initialId || storedId || null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Reset/Switch resumeId when userId changes (login/logout)
  useEffect(() => {
    if (initialId) {
      setResumeId(initialId);
    } else if (storedId) {
      setResumeId(storedId);
    } else {
      setResumeId(null);
      setData(initialResumeData);
      setTitle("My Resume");
    }
  }, [userId, initialId, storedId]);

  const fetchResumes = useCallback(async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const list = await response.json();
        setResumes(list);
        return list;
      }
    } catch (e) {
      console.error("Failed to fetch resumes", e);
    }
    return [];
  }, []);

  const loadResume = useCallback(async (id: string) => {
    // Try to load from cache first
    const cached = getResumeFromCache(userId, id);
    if (cached) {
      setResumeId(id);
      localStorage.setItem(activeResumeKey, id);
      setTitle(cached.title || "My Resume");
      setReview(cached.review || null);
      setLastReviewedHash(cached.lastReviewedData || null);
      setNeedsAnalysis(!!cached.needsAnalysis);
      const parsed = safeParseResumeData(cached.data, cached.extractedData);
      if (parsed) setData(parsed);
      return;
    }

    try {
      const token = localStorage.getItem("jobplotter_token");
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const resume = await response.json();
        setResumeId(id);
        localStorage.setItem(activeResumeKey, id);
        setTitle(resume.title || "My Resume");
        setReview(resume.review || null);
        setLastReviewedHash(resume.lastReviewedData || null);
        setNeedsAnalysis(!!resume.needsAnalysis);
        const parsed = safeParseResumeData(resume.data, resume.extractedData);
        if (parsed) setData(parsed);
        // Save to cache for next time
        saveResumeToCache(userId, id, resume);
      }
    } catch (e) {
      console.error("Failed to load resume", e);
    }
  }, [userId, activeResumeKey]);

  // Fetch from FastAPI backend
  useEffect(() => {
    const init = async () => {
      // Don't run init until we know who the user is (if we have a token)
      if (userId === "guest" && localStorage.getItem("jobplotter_token")) return;

      // If we have an initialId passed in (e.g. from URL), it takes priority
      if (initialId) {
        await loadResume(initialId);
        setIsInitialLoad(false);
        return;
      }

      const list = await fetchResumes();

      // 1. Prioritize loading the default active search profile
      const defaultResume = list.find((r: any) => r.isDefault);
      if (defaultResume) {
        const rid = defaultResume._id || defaultResume.id;
        setResumeId(rid);
        localStorage.setItem(activeResumeKey, rid);
        setTitle(defaultResume.title || "My Resume");
        setReview(defaultResume.review || null);
        setLastReviewedHash(defaultResume.lastReviewedData || null);
        setNeedsAnalysis(!!defaultResume.needsAnalysis);
        const parsedDefault = safeParseResumeData(defaultResume.data, defaultResume.extractedData);
        if (parsedDefault) setData(parsedDefault);
        saveResumeToCache(userId, rid, defaultResume);
        setIsInitialLoad(false);
        return;
      }

      // 2. If no default resume is marked in DB, fallback to storedId in localStorage
      if (storedId && list.some((r: any) => (r._id || r.id) === storedId)) {
        await loadResume(storedId);
        setIsInitialLoad(false);
        return;
      }

      // 3. Fallback to list[0]
      if (list.length > 0 && !resumeId) {
        const latest = list[0]; 
        const rid = latest._id || latest.id;
        setResumeId(rid);
        localStorage.setItem(activeResumeKey, rid);
        setTitle(latest.title || "My Resume");
        setReview(latest.review || null);
        setLastReviewedHash(latest.lastReviewedData || null);
        setNeedsAnalysis(!!latest.needsAnalysis);
        const parsedLatest = safeParseResumeData(latest.data, latest.extractedData);
        if (parsedLatest) setData(parsedLatest);
        saveResumeToCache(userId, rid, latest);
      }
      setIsInitialLoad(false);
    };

    // Guard against any unforeseen throw leaving isInitialLoad stuck true
    // forever (which would silently disable autosave and strand the page).
    init().catch(e => {
      console.error("Failed to initialize resume data", e);
      setIsInitialLoad(false);
    });
  }, [fetchResumes, initialId, storedId, userId, activeResumeKey]);

  // Save to FastAPI backend
  const saveToBackend = useCallback(async (currentData: ResumeData, customTitle?: string) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("jobplotter_token");
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: resumeId,
          title: customTitle || title,
          data: JSON.stringify(currentData),
        })
      });

      if (response.ok) {
        const result = await response.json();
        const finalId = result.id || resumeId;
        if (result.id && !resumeId) {
          setResumeId(result.id);
        }
        
        // Update cache with latest saved data
        if (finalId) {
          saveResumeToCache(userId, finalId, {
            id: finalId,
            title: customTitle || title,
            data: JSON.stringify(currentData),
            review: review,
            lastReviewedData: lastReviewedHash,
            needsAnalysis: needsAnalysis
          });
        }

        fetchResumes();
        signalExtensionSync(); // let the extension pick up the edited resume in real time
      }
    } catch (e) {
      console.error("Failed to save resume", e);
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, fetchResumes, userId, title, review, lastReviewedHash, needsAnalysis]);

  // Debounced save to backend. `pendingSaveRef` tracks an edit that's waiting
  // out the debounce window so the unmount-flush effect below can save it
  // immediately if the user navigates away before the timer fires (e.g.
  // clicking to Dashboard right after typing) — otherwise that edit is
  // silently dropped and stale data reappears in previews elsewhere.
  const pendingSaveRef = useRef<{ data: ResumeData; title: string } | null>(null);
  useEffect(() => {
    if (isInitialLoad || userId === "guest") return;

    if (JSON.stringify(data) === JSON.stringify(initialResumeData)) {
      pendingSaveRef.current = null;
      return;
    }

    pendingSaveRef.current = { data, title };
    const timer = setTimeout(() => {
      pendingSaveRef.current = null;
      saveToBackend(data, title);
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, title, saveToBackend, isInitialLoad, userId]);

  // Always call the freshest saveToBackend on flush — it's identity changes
  // as resumeId gets assigned, and the unmount effect below intentionally
  // only runs its cleanup once, so it must not close over a stale (e.g.
  // pre-assigned-id) version and risk creating a duplicate resume.
  const saveToBackendRef = useRef(saveToBackend);
  useEffect(() => { saveToBackendRef.current = saveToBackend; }, [saveToBackend]);

  // Flush any still-pending debounced save when the component using this
  // hook unmounts, so navigating away right after an edit doesn't drop it.
  useEffect(() => {
    return () => {
      if (pendingSaveRef.current) {
        saveToBackendRef.current(pendingSaveRef.current.data, pendingSaveRef.current.title);
        pendingSaveRef.current = null;
      }
    };
  }, []);

  // Immediate sync to localStorage whenever data or title changes
  useEffect(() => {
    if (!resumeId || isInitialLoad || userId === "guest") return;
    
    saveResumeToCache(userId, resumeId, {
      id: resumeId,
      title: title,
      data: JSON.stringify(data),
      review: review,
      lastReviewedData: lastReviewedHash,
      needsAnalysis: needsAnalysis
    });
  }, [data, title, resumeId, review, lastReviewedHash, needsAnalysis, isInitialLoad, userId]);

  return [data, setData, saveToBackend, isSaving, resumes, loadResume, title, setTitle, resumeId, review, lastReviewedHash, needsAnalysis];
}
