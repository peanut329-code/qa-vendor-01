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
  { href: "/dashboard",      icon: "bi-speedometer2",              label: "儀表板",         allowedRoles: ["super_admin","admin","manager","evaluator","viewer"] },
  { href: "/suppliers",      icon: "bi-building-fill",             label: "供應商管理",     allowedRoles: ["super_admin","admin","manager","evaluator","viewer"] },
  { href: "/asl",            icon: "bi-list-check",                label: "合格供應商名單", allowedRoles: ["super_admin","admin","manager","viewer"] },
  { href: "/certifications", icon: "bi-patch-check-fill",          label: "認證效期",       allowedRoles: ["super_admin","admin","manager","viewer"] },
  { href: "/evaluations",    icon: "bi-clipboard2-check-fill",     label: "評鑑作業",       allowedRoles: ["super_admin","admin","manager","evaluator","viewer"] },
  { href: "/audit",          icon: "bi-calendar3-week-fill",       label: "稽核行事曆",     allowedRoles: ["super_admin","admin","manager","viewer"] },
  { href: "/scar",           icon: "bi-exclamation-triangle-fill", label: "SCAR 管理",      allowedRoles: ["super_admin","admin","manager","viewer"] },
  { href: "/risk",           icon: "bi-diagram-3-fill",            label: "風險評估矩陣",   allowedRoles: ["super_admin","admin","manager","viewer"] },
  { href: "/reports",        icon: "bi-bar-chart-line-fill",       label: "報表分析",       allowedRoles: ["super_admin","admin","manager","evaluator","viewer"] },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/users",    icon: "bi-people-fill", label: "使用者管理", allowedRoles: ["super_admin","admin"] },
  { href: "/settings", icon: "bi-gear-fill",   label: "系統設定",   allowedRoles: ["super_admin","admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role as UserRole | undefined;

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const visibleNav = NAV_ITEMS.filter((item) => role && item.allowedRoles.includes(role));
  const visibleAdminNav = ADMIN_NAV.filter((item) => role && item.allowedRoles.includes(role));

  const initials = user?.full_name
    ? user.full_name.slice(0, 1).toUpperCase()
    : "U";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="bi bi-patch-check-fill" />
        </div>
        <div>
          <div className="sidebar-logo-text">供應商評鑑系統</div>
          <div className="sidebar-logo-sub">QA Vendor Evaluation</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleNav.length > 0 && (
          <div className="nav-group">
            <div className="nav-group-label">主要功能</div>
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-link ${isActive(item.href) ? "active" : ""}`}
              >
                <i className={`bi ${item.icon} nav-icon`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {visibleAdminNav.length > 0 && (
          <div className="nav-group">
            <div className="nav-group-label">管理</div>
            {visibleAdminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-link ${isActive(item.href) ? "active" : ""}`}
              >
                <i className={`bi ${item.icon} nav-icon`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User footer */}
      {user && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.full_name}
              </div>
              <div className="user-role">{ROLE_LABELS[user.role]}</div>
            </div>
            <button
              onClick={logout}
              title="登出"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-dim)", padding: 4, borderRadius: 4, flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: "0.95rem" }} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
