"use client";
import { useState, useTransition } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const busy = loading || isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required."); return; }
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[420px] animate-fade-in">

        {/* ── Logo mark ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="animate-pulse-glow"
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={30} color="white" strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#f1f5f9" }}>
            ISSOP Admin
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            Integrated Social Services Operations Platform
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────────────────── */}
        <div
          className="glass"
          style={{ padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}
        >
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f1f5f9" }}>
              Sign in to your account
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              Admin &amp; SuperAdmin access only
            </p>
          </div>

          <form id="login-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15} strokeWidth={1.8}
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "rgba(255,255,255,0.25)", pointerEvents: "none" }}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@issop.gov"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, padding: "11px 14px 11px 40px", fontSize: 14,
                    color: "#f1f5f9", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow   = "0 0 0 3px rgba(99,102,241,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow   = "none";
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15} strokeWidth={1.8}
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "rgba(255,255,255,0.25)", pointerEvents: "none" }}
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, padding: "11px 44px 11px 40px", fontSize: 14,
                    color: "#f1f5f9", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow   = "0 0 0 3px rgba(99,102,241,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow   = "none";
                  }}
                />
                <button
                  id="toggle-password"
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", padding: 4, transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div
                id="login-error"
                style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fca5a5",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={busy}
              style={{
                width: "100%", marginTop: 4,
                background: busy ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: 12, padding: "13px 20px",
                fontSize: 14, fontWeight: 600, color: "white", cursor: busy ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s", boxShadow: busy ? "none" : "0 8px 24px rgba(99,102,241,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!busy) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {busy ? (
                <><Loader2 size={16} className="animate-spin-slow" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        {/* Role badge */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {["Admin", "SuperAdmin"].map((role) => (
            <span
              key={role}
              style={{
                fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 99, padding: "3px 10px",
              }}
            >
              {role}
            </span>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 24 }}>
          © {new Date().getFullYear()} ISSOP Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
