import { useEffect, useState, type Dispatch, type SetStateAction, useCallback } from "react";
import { useAuth } from "./contexts/AuthContext";

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
      if (cached.data) {
        setData(JSON.parse(cached.data));
      } else if (cached.extractedData) {
        setData(cached.extractedData);
      }
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
        if (resume.data) {
          setData(JSON.parse(resume.data));
        } else if (resume.extractedData) {
          setData(resume.extractedData);
        }
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

      // If we have a storedId for THIS user, load that
      if (storedId) {
        await loadResume(storedId);
        setIsInitialLoad(false);
        fetchResumes();
        return;
      }

      const list = await fetchResumes();
      
      if (list.length > 0 && !resumeId) {
        const latest = list[0]; 
        const rid = latest._id || latest.id;
        setResumeId(rid);
        localStorage.setItem(activeResumeKey, rid);
        setTitle(latest.title || "My Resume");
        setReview(latest.review || null);
        setLastReviewedHash(latest.lastReviewedData || null);
        setNeedsAnalysis(!!latest.needsAnalysis);
        if (latest.data) {
          setData(JSON.parse(latest.data));
        } else if (latest.extractedData) {
          setData(latest.extractedData);
        }
        saveResumeToCache(userId, rid, latest);
      }
      setIsInitialLoad(false);
    };

    init();
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
      }
    } catch (e) {
      console.error("Failed to save resume", e);
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, fetchResumes, userId, title, review, lastReviewedHash, needsAnalysis]);

  // Debounced save to backend
  useEffect(() => {
    if (isInitialLoad || userId === "guest") return;

    const timer = setTimeout(() => {
      if (JSON.stringify(data) !== JSON.stringify(initialResumeData)) {
        saveToBackend(data, title);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, title, saveToBackend, isInitialLoad, userId]);

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
