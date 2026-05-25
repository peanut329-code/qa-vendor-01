"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("請輸入 Email 與密碼");
      return;
    }
    setIsSubmitting(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400));
    const ok = login(username.trim(), password);
    if (ok) {
      router.replace("/dashboard");
    } else {
      setError("Email 或密碼錯誤，請重新輸入");
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      {/* Card */}
      <div className="ev-card" style={{ padding: "40px 36px 32px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg, #5B8FD9 0%, #3A6FBF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 6px 20px rgba(91,143,217,0.35)",
            }}
          >
            <i className="bi bi-patch-check-fill" style={{ color: "white", fontSize: "1.6rem" }} />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1E3A5F", margin: 0, lineHeight: 1.3 }}>
            供應商評鑑系統
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#94AEC8", margin: "6px 0 0", letterSpacing: "0.04em" }}>
            QA Vendor Evaluation System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#5F7A9B",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              <i
                className="bi bi-envelope-fill"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94AEC8",
                  fontSize: "0.9rem",
                  pointerEvents: "none",
                }}
              />
              <input
                className="ev-input"
                type="email"
                placeholder="請輸入 Email"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                style={{ paddingLeft: 36 }}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#5F7A9B",
                marginBottom: 6,
              }}
            >
              密碼
            </label>
            <div style={{ position: "relative" }}>
              <i
                className="bi bi-lock-fill"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94AEC8",
                  fontSize: "0.9rem",
                  pointerEvents: "none",
                }}
              />
              <input
                className="ev-input"
                type={showPassword ? "text" : "password"}
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                style={{ paddingLeft: 36, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94AEC8",
                  padding: 4,
                }}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  style={{ fontSize: "0.9rem" }}
                />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i
                className="bi bi-exclamation-circle-fill"
                style={{ color: "#EF4444", fontSize: "0.85rem", flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.82rem", color: "#DC2626" }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="ev-btn ev-btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "11px 16px",
              fontSize: "0.95rem",
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <i
                  className="bi bi-arrow-repeat"
                  style={{ display: "inline-block", animation: "spin 1s linear infinite" }}
                />
                登入中...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" />
                登入
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#94AEC8", marginTop: 18 }}>
        Designed &amp; Developed by Lingo｜2026
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
