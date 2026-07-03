"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types";

const PAGE_META: Record<string, { title: string; icon: string }> = {
  "/dashboard":      { title: "儀表板",         icon: "bi-speedometer2" },
  "/suppliers":      { title: "供應商管理",     icon: "bi-building-fill" },
  "/evaluations":    { title: "評鑑作業",       icon: "bi-clipboard2-check-fill" },
  "/scar":           { title: "SCAR 管理",      icon: "bi-exclamation-triangle-fill" },
  "/certifications": { title: "認證效期",       icon: "bi-patch-check-fill" },
  "/audit":          { title: "稽核行事曆",     icon: "bi-calendar3-week-fill" },
  "/asl":            { title: "合格供應商名單&核准範圍", icon: "bi-list-check" },
  "/risk":           { title: "風險評估矩陣",   icon: "bi-diagram-3-fill" },
  "/reports":        { title: "報表分析",       icon: "bi-bar-chart-line-fill" },
  "/users":          { title: "使用者管理",     icon: "bi-people-fill" },
  "/settings":       { title: "系統設定",       icon: "bi-gear-fill" },
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const key = Object.keys(PAGE_META).find((k) => pathname === k || pathname.startsWith(k + "/")) ?? "/dashboard";
  const meta = PAGE_META[key];

  return (
    <header className="layout-topbar" style={{ display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
      {/* Left: Page title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#EDF3FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i className={`bi ${meta?.icon ?? "bi-grid"}`} style={{ color: "#5B8FD9", fontSize: "0.9rem" }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1E3A5F", lineHeight: 1.2 }}>
            {meta?.title ?? ""}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#94AEC8", lineHeight: 1 }}>
            供應商評鑑系統
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notification bell */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#EDF3FA",
            border: "1px solid #C5D8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
          title="通知"
        >
          <i className="bi bi-bell-fill" style={{ color: "#5B8FD9", fontSize: "0.85rem" }} />
          <span
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#EF4444",
              border: "1.5px solid white",
            }}
          />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#C5D8F0", margin: "0 4px" }} />

        {/* User chip */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px 5px 5px",
              borderRadius: 20,
              background: "#EDF3FA",
              border: "1px solid #C5D8F0",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5B8FD9 0%, #3A6FBF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="bi bi-person-fill" style={{ color: "white", fontSize: "0.75rem" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1E3A5F", lineHeight: 1.2 }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#5F7A9B", lineHeight: 1 }}>
                {ROLE_LABELS[user.role]}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
