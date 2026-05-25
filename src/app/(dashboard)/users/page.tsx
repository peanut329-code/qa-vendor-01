"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_USERS } from "@/lib/mock-data";
import { getRoleColor, formatDate } from "@/lib/utils";
import { ROLE_LABELS, ROLE_LABELS_BILINGUAL } from "@/types";
import type { UserRole } from "@/types";

const ROLE_KEYS_INVITABLE: UserRole[] = ["admin", "manager", "evaluator", "viewer"];

function InviteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ full_name: "", username: "", email: "", department: "", role: "viewer" as UserRole });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "請輸入姓名";
    if (!form.username.trim()) e.username = "請輸入帳號";
    else if (!/^[a-z0-9_]+$/.test(form.username)) e.username = "帳號只允許小寫英文、數字、底線";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email 格式不正確";
    if (!form.department.trim()) e.department = "請輸入部門";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setDone(true);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,30,60,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 16, width: 480, maxWidth: "94vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        {/* Modal header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #EAF1FB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, color: "#1E3A5F", fontSize: "1rem" }}>邀請新使用者</div>
            <div style={{ fontSize: "0.78rem", color: "#5F7A9B", marginTop: 2 }}>設定帳號資料與角色權限</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94AEC8", fontSize: "1.2rem", padding: 4 }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {done ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#22C55E,#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" }}>
              <i className="bi bi-check-lg" style={{ color: "white", fontSize: "1.6rem" }} />
            </div>
            <div style={{ fontWeight: 800, color: "#1E3A5F", fontSize: "1.05rem", marginBottom: 6 }}>使用者已建立</div>
            <div style={{ color: "#5F7A9B", fontSize: "0.85rem", marginBottom: 4 }}>
              <strong>{form.full_name}</strong>（{form.username}）
            </div>
            <div style={{ color: "#94AEC8", fontSize: "0.78rem", marginBottom: 20 }}>
              初始密碼與帳號相同，首次登入請提醒使用者修改密碼。
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="ev-btn ev-btn-ghost" onClick={onClose}>關閉</button>
              <button className="ev-btn ev-btn-primary" onClick={() => { setDone(false); setForm({ full_name: "", username: "", email: "", department: "", role: "viewer" }); }}>
                繼續新增
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px 24px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Full name */}
              <div>
                <label style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 5 }}>
                  姓名 <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input className="ev-input" style={{ width: "100%", borderColor: errors.full_name ? "#EF4444" : undefined }}
                  placeholder="例：王小明" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
                {errors.full_name && <div style={{ color: "#EF4444", fontSize: "0.7rem", marginTop: 3 }}>{errors.full_name}</div>}
              </div>
              {/* Username */}
              <div>
                <label style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 5 }}>
                  帳號 <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input className="ev-input" style={{ width: "100%", borderColor: errors.username ? "#EF4444" : undefined }}
                  placeholder="例：wang01" value={form.username} onChange={(e) => set("username", e.target.value.toLowerCase())} />
                {errors.username && <div style={{ color: "#EF4444", fontSize: "0.7rem", marginTop: 3 }}>{errors.username}</div>}
              </div>
              {/* Email */}
              <div>
                <label style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 5 }}>電子郵件</label>
                <input className="ev-input" style={{ width: "100%", borderColor: errors.email ? "#EF4444" : undefined }}
                  type="email" placeholder="email@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                {errors.email && <div style={{ color: "#EF4444", fontSize: "0.7rem", marginTop: 3 }}>{errors.email}</div>}
              </div>
              {/* Department */}
              <div>
                <label style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 5 }}>
                  部門 <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input className="ev-input" style={{ width: "100%", borderColor: errors.department ? "#EF4444" : undefined }}
                  placeholder="例：採購部" value={form.department} onChange={(e) => set("department", e.target.value)} />
                {errors.department && <div style={{ color: "#EF4444", fontSize: "0.7rem", marginTop: 3 }}>{errors.department}</div>}
              </div>
            </div>

            {/* Role */}
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 8 }}>
                角色權限 <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ROLE_KEYS_INVITABLE.map((r) => {
                  const isActive = form.role === r;
                  const descMap: Record<string, string> = {
                    admin:     "完整管理權限（含使用者）",
                    manager:   "評鑑審核與稽核管理",
                    evaluator: "填寫評鑑表單",
                    viewer:    "唯讀，可看所有資料，無法編輯或匯出",
                  };
                  return (
                    <button key={r} type="button" onClick={() => set("role", r)}
                      style={{
                        textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                        border: `2px solid ${isActive ? "#5B8FD9" : "#E0EBF8"}`,
                        background: isActive ? "#EDF3FA" : "white",
                        transition: "all 0.15s",
                      }}>
                      <div style={{ fontWeight: 700, color: isActive ? "#1E3A5F" : "#5F7A9B", fontSize: "0.82rem" }}>
                        {ROLE_LABELS[r]}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#94AEC8", marginTop: 2 }}>{descMap[r]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password hint */}
            <div style={{ marginTop: 14, background: "#F7FAFF", border: "1px solid #EAF1FB", borderRadius: 8, padding: "8px 12px", fontSize: "0.75rem", color: "#5F7A9B" }}>
              <i className="bi bi-info-circle-fill" style={{ color: "#5B8FD9", marginRight: 6 }} />
              初始密碼與帳號相同，請提醒使用者登入後修改。
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="ev-btn ev-btn-ghost" onClick={onClose}>取消</button>
              <button className="ev-btn ev-btn-primary" disabled={submitting} onClick={handleSubmit}>
                {submitting
                  ? <><i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite" }} /> 建立中...</>
                  : <><i className="bi bi-person-plus-fill" /> 建立帳號</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  if (!user || !["super_admin", "admin"].includes(user.role)) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>
          存取受限
        </div>
        <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>
          您沒有權限查看此頁面，請聯絡系統管理員。
        </div>
      </div>
    );
  }

  const filtered = DEMO_USERS.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch = !search || u.full_name.includes(search) || u.email.includes(search) || u.department.includes(search);
    return matchRole && matchSearch;
  });

  const roleCounts: Record<string, number> = { ALL: DEMO_USERS.length };
  DEMO_USERS.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
  });

  const ROLE_KEYS: UserRole[] = ["super_admin", "admin", "manager", "evaluator", "viewer"];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">使用者管理</div>
          <div className="page-subtitle">管理系統使用者帳號及角色權限</div>
        </div>
        {user.role === "super_admin" && (
          <button className="ev-btn ev-btn-primary" onClick={() => setShowInvite(true)}>
            <i className="bi bi-person-plus-fill" /> 邀請使用者
          </button>
        )}
      </div>

      {/* Role summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setRoleFilter("ALL")}
          style={{
            padding: "6px 14px",
            borderRadius: 9999,
            border: `1.5px solid ${roleFilter === "ALL" ? "#5B8FD9" : "#C5D8F0"}`,
            background: roleFilter === "ALL" ? "#EDF3FA" : "white",
            color: roleFilter === "ALL" ? "#5B8FD9" : "#5F7A9B",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          全部 ({DEMO_USERS.length})
        </button>
        {ROLE_KEYS.map((r) => {
          const c = getRoleColor(r);
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(roleFilter === r ? "ALL" : r)}
              className={`ev-badge ${c.bg} ${c.text}`}
              style={{
                cursor: "pointer",
                border: `1.5px solid ${roleFilter === r ? "currentColor" : "transparent"}`,
                padding: "5px 14px",
                fontSize: "0.8rem",
              }}
            >
              {ROLE_LABELS_BILINGUAL[r].zh}
              <span style={{ opacity: 0.65, fontWeight: 400, marginLeft: 3 }}>{ROLE_LABELS_BILINGUAL[r].en}</span>
              {" "}({roleCounts[r] ?? 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="ev-card" style={{ padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
        <i className="bi bi-search" style={{ color: "#94AEC8" }} />
        <input
          className="ev-input"
          placeholder="搜尋姓名、電子郵件、部門..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", boxShadow: "none", padding: "4px 0", flex: 1 }}
        />
        <span style={{ color: "#5F7A9B", fontSize: "0.82rem", flexShrink: 0 }}>
          共 <strong style={{ color: "#1E3A5F" }}>{filtered.length}</strong> 位使用者
        </span>
      </div>

      {/* User table */}
      <div className="ev-card" style={{ overflow: "hidden", marginBottom: 18 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAF1FB" }}>
          <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>
            <i className="bi bi-people-fill" style={{ color: "#5B8FD9", marginRight: 6 }} />
            帳號列表
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>使用者</th>
                <th>電子郵件</th>
                <th>部門</th>
                <th>角色</th>
                <th>狀態</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const rc = getRoleColor(u.role);
                const isCurrent = u.id === user.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #5B8FD9 0%, #3A6FBF 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i className="bi bi-person-fill" style={{ color: "white", fontSize: "0.85rem" }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem" }}>
                            {u.full_name}
                            {isCurrent && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: "0.7rem",
                                  background: "#EDF3FA",
                                  color: "#5B8FD9",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  fontWeight: 600,
                                }}
                              >
                                我
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#5F7A9B", fontSize: "0.85rem" }}>{u.email}</td>
                    <td>
                      <span style={{ background: "#EDF3FA", color: "#5B8FD9", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem" }}>
                        {u.department}
                      </span>
                    </td>
                    <td>
                      <span className={`ev-badge ${rc.bg} ${rc.text}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td>
                      <span className="ev-badge bg-emerald-100 text-emerald-700">
                        <span className="ev-badge-dot bg-emerald-500" />
                        啟用
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {!isCurrent && user.role === "super_admin" && (
                          <>
                            <button className="ev-btn ev-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                              <i className="bi bi-pencil" /> 編輯
                            </button>
                            <button className="ev-btn ev-btn-danger" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                              <i className="bi bi-trash" />
                            </button>
                          </>
                        )}
                        {isCurrent && (
                          <span style={{ fontSize: "0.75rem", color: "#94AEC8", padding: "4px 8px" }}>目前帳號</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission matrix card */}
      <div className="ev-card" style={{ padding: "18px 22px", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem", marginBottom: 14 }}>
          <i className="bi bi-shield-fill-check" style={{ color: "#5B8FD9", marginRight: 6 }} />
          權限說明
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "6px 14px", textAlign: "left", color: "#5F7A9B", fontWeight: 600, background: "#F4F8FD", borderBottom: "1px solid #E0EBF8" }}>
                  功能模組
                </th>
                {ROLE_KEYS.map((r) => {
                  const c = getRoleColor(r);
                  return (
                    <th key={r} style={{ padding: "6px 14px", textAlign: "center", background: "#F4F8FD", borderBottom: "1px solid #E0EBF8" }}>
                      <span className={`ev-badge ${c.bg} ${c.text}`} style={{ fontSize: "0.72rem" }}>
                        {ROLE_LABELS_BILINGUAL[r].zh}
                        <span style={{ opacity: 0.65, fontWeight: 400, marginLeft: 3 }}>{ROLE_LABELS_BILINGUAL[r].en}</span>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {[
                { module: "儀表板", perms: [true, true, true, true, true] },
                { module: "供應商管理（查看）", perms: [true, true, true, true, true] },
                { module: "供應商管理（新增/編輯）", perms: [true, true, false, false, false] },
                { module: "評鑑作業（查看）", perms: [true, true, true, true, true] },
                { module: "評鑑作業（建立/填寫）", perms: [true, true, true, true, false] },
                { module: "評鑑作業（審核核准）", perms: [true, true, true, false, false] },
                { module: "報表分析", perms: [true, true, true, false, true] },
                { module: "使用者管理", perms: [true, true, false, false, false] },
                { module: "系統設定", perms: [true, true, false, false, false] },
              ].map(({ module, perms }) => (
                <tr key={module}>
                  <td style={{ padding: "8px 14px", color: "#1E3A5F", borderBottom: "1px solid #EEF4FC" }}>
                    {module}
                  </td>
                  {perms.map((p, i) => (
                    <td key={i} style={{ textAlign: "center", padding: "8px 14px", borderBottom: "1px solid #EEF4FC" }}>
                      {p ? (
                        <i className="bi bi-check-circle-fill" style={{ color: "#22C55E", fontSize: "0.95rem" }} />
                      ) : (
                        <i className="bi bi-x-circle" style={{ color: "#C5D8F0", fontSize: "0.95rem" }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}
