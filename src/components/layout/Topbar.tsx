"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types";

const PAGE_META: Record<string, { title: string; icon: string }> = {
  "/dashboard":      { title: "儀表板",         icon: "bi-speedometer2" },
  "/suppliers":      { title: "供應商管理",     icon: "bi-building-fill" },
  "/evaluations":    { title: "評鑑作業",       icon: "bi-clipboard2-check-fill" },
  "/scar":           { title: "SCAR 管理",      icon: "bi-exclamation-triangle-fill" },
  "/certifications": { title: "品質證書認證效期",       icon: "bi-patch-check-fill" },
  "/audit":          { title: "稽核行事曆",     icon: "bi-calendar3-week-fill" },
  "/asl":            { title: "合格供應商名單&核准範圍", icon: "bi-list-check" },
  "/risk":           { title: "風險評估矩陣",   icon: "bi-diagram-3-fill" },
  "/reports":        { title: "報表分析",       icon: "bi-bar-chart-line-fill" },
  "/users":          { title: "使用者管理",     icon: "bi-people-fill" },
  "/settings":       { title: "系統設定",       icon: "bi-gear-fill" },
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "🔴 緊急 SCAR 改善要求",
      desc: "光揚光罩科技 (SUP-003) 因評鑑低分觸發 SCAR-2026-001，請在 2026-07-31 前提交計畫。",
      time: "10分鐘前",
      read: false,
      link: "/scar"
    },
    {
      id: 2,
      title: "🟡 認證過期複評在即",
      desc: "正鑫特殊氣體 (SUP-002) 認證期已更新至 2027-08-30，下次複評在即，請追蹤進度。",
      time: "1小時前",
      read: false,
      link: "/asl"
    },
    {
      id: 3,
      title: "🟢 評鑑審核核准完成",
      desc: "先進製程化學 (SUP-005) 2026-Q2 評鑑已由林雅婷審核通過，列為 C 觀察級別。",
      time: "3小時前",
      read: false,
      link: "/evaluations"
    }
  ]);

  const key = Object.keys(PAGE_META).find((k) => pathname === k || pathname.startsWith(k + "/")) ?? "/dashboard";
  const meta = PAGE_META[key];

  function markAllAsRead() {
    setHasUnread(false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function handleNotificationClick(link: string, id: number) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Check if there are still unread items
    const remaining = notifications.filter(n => n.id !== id && !n.read).length;
    if (remaining === 0) setHasUnread(false);
    
    setShowNotifications(false);
    router.push(link);
  }

  return (
    <header className="layout-topbar" style={{ display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between", position: "relative" }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
        {/* Notification bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: showNotifications ? "#E0EBF8" : "#EDF3FA",
            border: `1px solid ${showNotifications ? "#5B8FD9" : "#C5D8F0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            transition: "all 0.15s",
          }}
          title="通知中心"
        >
          <i className="bi bi-bell-fill" style={{ color: "#5B8FD9", fontSize: "0.85rem" }} />
          {hasUnread && (
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
          )}
        </button>

        {/* Notifications Popover */}
        {showNotifications && (
          <>
            {/* Click outside backdrop */}
            <div 
              onClick={() => setShowNotifications(false)} 
              style={{ position: "fixed", inset: 0, zIndex: 1099, background: "transparent" }} 
            />
            
            <div
              style={{
                position: "absolute",
                top: 45,
                right: 0,
                width: 320,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                border: "1px solid #C5D8F0",
                borderRadius: 12,
                boxShadow: "0 10px 25px rgba(30, 58, 95, 0.15)",
                padding: "12px 0",
                zIndex: 1100,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 14px 8px 14px", borderBottom: "1px solid #EAF1FB" }}>
                <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1E3A5F" }}>系統通知中心</span>
                {hasUnread && (
                  <button 
                    onClick={markAllAsRead}
                    style={{ background: "none", border: "none", color: "#5B8FD9", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600 }}
                  >
                    全部標記為已讀
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 270, overflowY: "auto" }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.link, n.id)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #F7FAFF",
                      cursor: "pointer",
                      background: n.read ? "transparent" : "#EDF3FA30",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#EDF3FA60"}
                    onMouseLeave={(e) => e.currentTarget.style.background = n.read ? "transparent" : "#EDF3FA30"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: n.read ? 600 : 800, color: "#1E3A5F" }}>{n.title}</span>
                      <span style={{ fontSize: "0.65rem", color: "#94AEC8" }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#5F7A9B", lineHeight: 1.4 }}>{n.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", paddingTop: 8, borderTop: "1px solid #EAF1FB", display: "flex", justifyContent: "center" }}>
                <button 
                  onClick={() => { setShowNotifications(false); router.push("/settings"); }}
                  style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "0.75rem", cursor: "pointer", fontWeight: 500 }}
                >
                  前往通知設定 →
                </button>
              </div>
            </div>
          </>
        )}

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
