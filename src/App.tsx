import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home } from "./pages/Home";
import { Builder } from "./pages/Builder";
import { Dashboard } from "./pages/Dashboard";
import { Jobs } from "./pages/Jobs";
import { Pricing } from "./pages/Pricing";
import { Review } from "./pages/Review";
import { Settings } from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Features from "./pages/Features";
import { DashboardLayout } from "./pages/DashboardLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If we have a code in the URL, we're in the middle of a login, so stay on loading
    const hasCode = typeof window !== "undefined" && window.location.search.includes("code=");
    if (hasCode) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
        
        {/* Auth Routes: Only accessible if NOT logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="builder" element={<Builder />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Review lives outside DashboardLayout so it has no sidebar */}
        <Route
          path="/dashboard/review"
          element={
            <ProtectedRoute>
              <Review />
            </ProtectedRoute>
          }
        />

        {/* Fallback for legacy routes */}
        <Route path="/builder" element={<Navigate to="/dashboard/builder" replace />} />
        <Route path="/jobs" element={<Navigate to="/dashboard/jobs" replace />} />
        <Route path="/review" element={<Navigate to="/dashboard/review" replace />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

