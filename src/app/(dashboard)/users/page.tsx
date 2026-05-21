"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_USERS } from "@/lib/mock-data";
import { getRoleColor, formatDate } from "@/lib/utils";
import { ROLE_LABELS } from "@/types";
import type { UserRole } from "@/types";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [search, setSearch] = useState("");

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
          <button className="ev-btn ev-btn-primary">
            <i className="bi bi-person-plus-fill" />
            邀請使用者
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
              {ROLE_LABELS[r]} ({roleCounts[r] ?? 0})
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

      {/* Permission matrix card */}
      <div className="ev-card" style={{ padding: "18px 22px", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem", marginBottom: 14 }}>
          <i className="bi bi-shield-fill-check" style={{ color: "#5B8FD9", marginRight: 6 }} />
          角色權限對照表
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
                        {ROLE_LABELS[r]}
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

      {/* User table */}
      <div className="ev-card" style={{ overflow: "hidden" }}>
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
    </div>
  );
}
