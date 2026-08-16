import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BackToHome } from "../components/BackToHome";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
// Stop users from spamming the Resend button — every click sends an
// email. 30s gives ZeptoMail time to deliver before a retry makes sense.
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Tick the cooldown timer down to 0 once Resend was used.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || resendStatus === "sending") return;
    setResendStatus("sending");
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to resend");
      setResendStatus("sent");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setResendStatus("error");
    }
  };

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    
    // If the entered value is a 6-digit code (autofill from SMS/email)
    if (cleanValue.length === 6) {
      const newOtp = cleanValue.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      return;
    }

    // Otherwise, treat as normal single-digit input
    let singleDigit = cleanValue;
    if (singleDigit.length > 1) {
      singleDigit = singleDigit[singleDigit.length - 1];
    }
    
    if (!/^\d*$/.test(singleDigit)) return;

    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    // Auto-focus next input
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "");
    if (!digits) return;

    const newOtp = [...otp];
    // If pasting 6 or more digits, fill from start (index 0)
    // Otherwise, fill starting from the currently focused input index
    const activeIndex = inputRefs.current.findIndex(el => el === document.activeElement);
    const startIdx = digits.length >= 6 ? 0 : (activeIndex !== -1 ? activeIndex : 0);
    
    const digitsArr = digits.slice(0, 6 - startIdx).split("");
    for (let i = 0; i < digitsArr.length; i++) {
      newOtp[startIdx + i] = digitsArr[i];
    }
    setOtp(newOtp);

    // Focus the last filled input
    const focusIdx = Math.min(startIdx + digitsArr.length - 1, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      // verifyEmail navigates to /login on success
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <BackToHome />
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify your email
          </h2>
          <p className="mt-4 text-sm text-slate-500">
            We've sent a 6-digit verification code to <br />
            <span className="font-semibold text-slate-900">{email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-1.5 sm:gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-full max-w-[3.25rem] aspect-[5/6] sm:aspect-auto sm:h-14 text-center text-xl sm:text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>

          <div className="text-center text-sm text-slate-500 space-y-1">
            <p>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === "sending" || resendCooldown > 0}
                className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {resendStatus === "sending"
                  ? "Sending…"
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </p>
            {resendStatus === "sent" && resendCooldown > 0 && (
              <p className="text-emerald-600 text-xs font-semibold">
                New code sent. Check your inbox.
              </p>
            )}
            {resendStatus === "error" && (
              <p className="text-red-600 text-xs font-semibold">
                Couldn't send a new code. Try again in a moment.
              </p>
            )}
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/signup" className="text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
            ← Back to signup
          </Link>
        </div>
      </div>
    </div>
  );
}
