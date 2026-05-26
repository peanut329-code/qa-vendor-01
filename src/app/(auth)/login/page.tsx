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
    <>
      <style>{`
        .login-bg {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 24px;
          background:
            radial-gradient(circle at 20% 10%, rgba(91,143,217,0.18) 0%, transparent 45%),
            radial-gradient(circle at 80% 90%, rgba(123,183,232,0.20) 0%, transparent 50%),
            var(--bg);
          position: relative; overflow: hidden;
        }
        .login-bg::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(91,143,217,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,143,217,0.04) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .login-card {
          width: 100%; max-width: 440px;
          background: var(--surface); border-radius: 20px; overflow: hidden;
          box-shadow: 0 30px 80px rgba(10,22,40,0.12), 0 6px 20px rgba(91,143,217,0.10);
          position: relative; z-index: 1;
        }
        .login-header {
          background: linear-gradient(135deg, #3A6DB5 0%, #5B8FD9 65%, #7BB7E8 100%);
          color: white; padding: 40px 36px 32px; text-align: center;
          position: relative; overflow: hidden;
        }
        .login-header::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none;
        }
        .header-icon {
          width: 64px; height: 64px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35); border-radius: 16px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 1.8rem; backdrop-filter: blur(8px);
          margin-bottom: 18px; position: relative; z-index: 2;
        }
        .header-title {
          font-size: 1.5rem; font-weight: 800; letter-spacing: -0.01em;
          margin: 0; position: relative; z-index: 2;
        }
        .header-sub {
          display: inline-block; margin-top: 12px; padding: 4px 14px; border-radius: 16px;
          background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3);
          font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          font-family: var(--font-mono); position: relative; z-index: 2;
        }
        .login-form-wrap { padding: 32px 36px 36px; }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .field-label {
          font-size: 0.8rem; font-weight: 600; color: var(--text-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .field-input-wrap { position: relative; }
        .field-input {
          width: 100%; height: 44px; padding: 0 16px 0 42px;
          border: 1.5px solid var(--border); background: var(--surface2); border-radius: 10px;
          font-size: 0.95rem; color: var(--text); font-family: inherit; outline: none;
          transition: all 0.15s;
        }
        .field-input::placeholder { color: var(--text-dim); }
        .field-input:focus {
          border-color: var(--primary); background: white;
          box-shadow: 0 0 0 4px rgba(91,143,217,0.12);
        }
        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--text-dim); font-size: 1rem; pointer-events: none;
        }
        .field-action {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; color: var(--text-dim);
          cursor: pointer; padding: 6px; font-size: 1rem; border-radius: 4px;
        }
        .field-action:hover { color: var(--primary); }
        .submit-btn {
          width: 100%; height: 48px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white; border: none; border-radius: 10px;
          font-size: 1rem; font-weight: 600; cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 14px rgba(91,143,217,0.35);
          transition: all 0.15s; margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(91,143,217,0.45); }
        .submit-btn:disabled { opacity: 0.75; transform: none; box-shadow: none; cursor: not-allowed; }
        .page-footer {
          text-align: center; font-size: 0.78rem; color: var(--text-dim);
          margin-top: 24px; position: relative; z-index: 1;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="login-bg">
        <div className="login-card">
          <header className="login-header">
            <div className="header-icon">
              <i className="bi bi-patch-check-fill" />
            </div>
            <h1 className="header-title">供應商評鑑系統</h1>
            <span className="header-sub">Vendor Evaluation System</span>
          </header>

          <section className="login-form-wrap">
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="field">
                <label className="field-label">Email</label>
                <div className="field-input-wrap">
                  <i className="bi bi-envelope field-icon" />
                  <input
                    className="field-input"
                    type="email"
                    placeholder="請輸入 Email"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">密碼 Password</label>
                <div className="field-input-wrap">
                  <i className="bi bi-shield-lock field-icon" />
                  <input
                    className="field-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    className="field-action"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <i className="bi bi-exclamation-circle-fill" style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", color: "#DC2626" }}>{error}</span>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="bi bi-arrow-repeat" style={{ display: "inline-block", animation: "spin 1s linear infinite" }} />
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
          </section>
        </div>

        <p className="page-footer">Designed &amp; Developed by Lingo｜2026</p>
      </div>
    </>
  );
}
