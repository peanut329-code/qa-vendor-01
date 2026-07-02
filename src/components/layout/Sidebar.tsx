"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SCARS, CERTIFICATIONS } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/types";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  allowedRoles: UserRole[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",      icon: "bi-speedometer2",              label: "儀表板",         allowedRoles: ["super_admin","admin","manager","evaluator","viewer"] },
  { href: "/suppliers",      icon: "bi-building-fill",             label: "供應商管理",     allowedRoles: ["super_admin","admin","manager","evaluator","viewer"] },
  { href: "/asl",            icon: "bi-list-check",                label: "合格供應商名單", allowedRoles: ["super_admin","admin","manager","viewer"] },
  { href: "/certifications", icon: "bi-patch-check-fill",          label: "認證效期",       allowedRoles: ["super_admin","admin","manager","viewer"], badge: 3 },
  { href: "/evaluations",    icon: "bi-clipboard2-check-fill",     label: "評鑑作業",       allowedRoles: ["super_admin","admin","manager","evaluator","viewer"] },
  { href: "/audit",          icon: "bi-calendar3-week-fill",       label: "稽核行事曆",     allowedRoles: ["super_admin","admin","manager","viewer"] },
  { href: "/scar",           icon: "bi-exclamation-triangle-fill", label: "SCAR 管理",      allowedRoles: ["super_admin","admin","manager","viewer"], badge: 7 },
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

  const [scarCount, setScarCount] = useState(3);
  const [certCount, setCertCount] = useState(3);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. SCAR 待處理數
      const savedScars = localStorage.getItem("scars-custom");
      let currentScars = [...SCARS];
      if (savedScars) {
        try {
          const parsed = JSON.parse(savedScars);
          currentScars = [...SCARS, ...parsed];
        } catch (e) {}
      }
      const activeScars = currentScars.filter((s) => s.status !== "closed").length;
      setScarCount(activeScars);

      // 2. 認證效期異常數
      const savedCerts = localStorage.getItem("certifications-custom");
      let currentCerts = [...CERTIFICATIONS];
      if (savedCerts) {
        try {
          const parsed = JSON.parse(savedCerts);
          currentCerts = [...CERTIFICATIONS, ...parsed];
        } catch (e) {}
      }
      const TODAY = "2026-05-21";
      const todayTime = new Date(TODAY).getTime();
      const warningDays = 30 * 24 * 60 * 60 * 1000; // 30天
      
      const abnormalCount = currentCerts.filter((c) => {
        const expTime = new Date(c.expiry_date).getTime();
        return expTime < todayTime || (expTime - todayTime) <= warningDays;
      }).length;

      setCertCount(abnormalCount);
    }
  }, [pathname]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const visibleNav = NAV_ITEMS.filter((item) => role && item.allowedRoles.includes(role)).map((item) => {
    if (item.href === "/scar") {
      return { ...item, badge: scarCount };
    }
    if (item.href === "/certifications") {
      return { ...item, badge: certCount };
    }
    return item;
  });
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
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
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
