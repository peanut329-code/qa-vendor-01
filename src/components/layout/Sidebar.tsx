"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  allowedRoles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    icon: "bi-grid-1x2-fill",
    label: "儀表板",
    allowedRoles: ["super_admin", "admin", "manager", "evaluator", "viewer"],
  },
  {
    href: "/suppliers",
    icon: "bi-building-fill",
    label: "供應商管理",
    allowedRoles: ["super_admin", "admin", "manager", "evaluator", "viewer"],
  },
  {
    href: "/evaluations",
    icon: "bi-clipboard2-check-fill",
    label: "評鑑作業",
    allowedRoles: ["super_admin", "admin", "manager", "evaluator", "viewer"],
  },
  {
    href: "/scar",
    icon: "bi-exclamation-triangle-fill",
    label: "SCAR 管理",
    allowedRoles: ["super_admin", "admin", "manager", "viewer"],
  },
  {
    href: "/certifications",
    icon: "bi-patch-check-fill",
    label: "認證效期",
    allowedRoles: ["super_admin", "admin", "manager", "viewer"],
  },
  {
    href: "/audit",
    icon: "bi-calendar3-week-fill",
    label: "稽核行事曆",
    allowedRoles: ["super_admin", "admin", "manager", "viewer"],
  },
  {
    href: "/asl",
    icon: "bi-list-check",
    label: "合格供應商名單",
    allowedRoles: ["super_admin", "admin", "manager", "viewer"],
  },
  {
    href: "/risk",
    icon: "bi-diagram-3-fill",
    label: "風險評估矩陣",
    allowedRoles: ["super_admin", "admin", "manager", "viewer"],
  },
  {
    href: "/reports",
    icon: "bi-bar-chart-line-fill",
    label: "報表分析",
    allowedRoles: ["super_admin", "admin", "manager", "evaluator", "viewer"],
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    href: "/users",
    icon: "bi-people-fill",
    label: "使用者管理",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    href: "/settings",
    icon: "bi-gear-fill",
    label: "系統設定",
    allowedRoles: ["super_admin", "admin"],
  },
];

const ROLE_ICON_MAP: Record<UserRole, string> = {
  super_admin: "bi-shield-fill-check",
  admin: "bi-person-badge-fill",
  manager: "bi-person-check-fill",
  evaluator: "bi-pencil-square",
  viewer: "bi-eye-fill",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role as UserRole | undefined;

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const visibleNav = NAV_ITEMS.filter(
    (item) => role && item.allowedRoles.includes(role)
  );
  const visibleAdminNav = ADMIN_NAV.filter(
    (item) => role && item.allowedRoles.includes(role)
  );

  return (
    <aside className="layout-sidebar flex flex-col">
      {/* Logo */}
      <div
        style={{
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #5B8FD9 0%, #3A6FBF 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(91,143,217,0.4)",
          }}
        >
          <i className="bi bi-patch-check-fill" style={{ color: "white", fontSize: "1rem" }} />
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
            評鑑系統
          </div>
          <div style={{ color: "#7899C0", fontSize: "0.7rem", lineHeight: 1.2 }}>
            QA Vendor Evaluation
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {visibleNav.length > 0 && (
          <>
            <div
              style={{
                padding: "0 14px 6px",
                fontSize: "0.68rem",
                color: "#4A6680",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              主要功能
            </div>
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? "active" : ""}`}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}

        {visibleAdminNav.length > 0 && (
          <>
            <div
              style={{ margin: "14px 10px 6px", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            />
            <div
              style={{
                padding: "0 14px 6px",
                fontSize: "0.68rem",
                color: "#4A6680",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              管理設定
            </div>
            {visibleAdminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? "active" : ""}`}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      {user && (
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
            }}
          >
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
              <i
                className={`bi ${ROLE_ICON_MAP[user.role] ?? "bi-person-fill"}`}
                style={{ color: "white", fontSize: "0.85rem" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "white",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.full_name}
              </div>
              <div style={{ color: "#7899C0", fontSize: "0.7rem" }}>
                {ROLE_LABELS[user.role]}
              </div>
            </div>
            <button
              onClick={logout}
              title="登出"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#5F7A9B",
                padding: "4px",
                borderRadius: 4,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#5F7A9B")}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: "0.95rem" }} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
