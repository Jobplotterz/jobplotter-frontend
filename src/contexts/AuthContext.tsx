import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string | number;
  email: string;
  name: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  handleGoogleCallback: (code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string, token: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const GOOGLE_CLIENT_ID = "616651811898-dsc8cnq19m8ffafuti0cf7l9763g4ts6.apps.googleusercontent.com";
const REDIRECT_URI = window.location.origin + "/login";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("jobplotter_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jobplotter_token");
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const loginWithGoogle = useCallback(() => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  }, []);

  const handleGoogleCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to authenticate with Google");
      }

      const data = await response.json();
      localStorage.setItem("jobplotter_token", data.access_token);
      await fetchUser(data.access_token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("[AuthContext] Google Callback Error:", error);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser, navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Backend signals an unverified account with a structured detail.
      // Treat it as a routing event, not an error: send the user to the
      // verify page (backend already re-issued an OTP).
      const detail = errorData?.detail;
      if (
        response.status === 403 &&
        detail &&
        typeof detail === "object" &&
        detail.code === "email_not_verified"
      ) {
        const targetEmail = detail.email || email;
        navigate(`/verify-email?email=${encodeURIComponent(targetEmail)}`, { replace: true });
        return;
      }
      // FastAPI default error shape is { detail: string } — preserve that
      // path so wrong-password etc. still surface a readable message.
      const msg =
        typeof detail === "string"
          ? detail
          : detail?.message || "Invalid email or password";
      throw new Error(msg);
    }

    const data = await response.json();
    localStorage.setItem("jobplotter_token", data.access_token);
    await fetchUser(data.access_token);
    navigate("/dashboard", { replace: true });
  }, [fetchUser, navigate]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Registration failed");
    }
    
    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
  }, [navigate]);

  const forgotPassword = useCallback(async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // Previously this swallowed all errors — a 404 from a missing
    // endpoint showed up as "Check your email" with nothing sent. Surface
    // the real status so the UI can show the user a useful message.
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Couldn't send reset link. Try again in a moment.");
    }
  }, []);

  const resetPassword = useCallback(async (password: string, token: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Password reset failed");
    }
    navigate("/login", { replace: true });
  }, [navigate]);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Invalid or expired code");
    }
    navigate("/login", { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("jobplotter_token");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // Hold the latest `logout` in a ref so the fetch interceptor below can
  // install ONCE on mount yet always call the up-to-date function.
  const logoutRef = useRef(logout);
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Global 401 → auto-logout interceptor. Wraps window.fetch once at mount
  // so every fetch (including the dozen scattered across pages and hooks)
  // is covered without per-call boilerplate. We only trigger logout when a
  // token exists in localStorage — a 401 from POST /auth/login or
  // /auth/google is a normal "bad credentials" response, not a session
  // expiry, and the user isn't logged in to begin with.
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      try {
        const input = args[0];
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
            ? input.toString()
            : (input as Request).url;

        const hadToken = !!localStorage.getItem("jobplotter_token");
        if (response.status === 401 && hadToken && url.startsWith(API_URL)) {
          console.warn("[AuthContext] 401 from", url, "— session expired, logging out");
          logoutRef.current();
        }
      } catch {
        // Never let interceptor logic break the original fetch contract.
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        handleGoogleCallback,
        login,
        register,
        forgotPassword,
        resetPassword,
        verifyEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
