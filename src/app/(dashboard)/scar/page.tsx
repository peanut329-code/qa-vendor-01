"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SCARS } from "@/lib/mock-data";
import { getScarStatusColor, getTierColor, formatDate, scoreColor } from "@/lib/utils";
import { SCAR_STATUS_LABELS, TIER_LABELS } from "@/types";
import type { ScarStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { exportScarsToExcel } from "@/lib/export";

const STATUS_TABS: { key: ScarStatus | "ALL"; label: string }[] = [
  { key: "ALL",        label: "全部" },
  { key: "open",       label: "待處理" },
  { key: "in_progress",label: "改善中" },
  { key: "verified",   label: "已驗證" },
  { key: "closed",     label: "已結案" },
  { key: "overdue",    label: "逾期" },
];

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號無法存取此功能，請聯絡系統管理員。</div>
    </div>
  );
}

export default function ScarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ScarStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
    return <AccessDenied />;
  }

  const canExport = user && ["super_admin", "admin", "manager"].includes(user.role);

  const filtered = SCARS.filter((sc) => {
    const matchStatus = statusFilter === "ALL" || sc.status === statusFilter;
    const matchSearch =
      !search ||
      sc.scar_number.includes(search) ||
      sc.supplier_name.includes(search) ||
      sc.issue_description.includes(search);
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = { ALL: SCARS.length };
  SCARS.forEach((sc) => { counts[sc.status] = (counts[sc.status] ?? 0) + 1; });

  // Days remaining / overdue
  function daysInfo(targetDate: string, status: ScarStatus) {
    if (status === "closed" || status === "verified") return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 86400));
    if (diff < 0) return { text: `逾期 ${Math.abs(diff)} 天`, color: "#EF4444", bg: "#FEF2F2" };
    if (diff <= 7)  return { text: `剩 ${diff} 天`, color: "#F59E0B", bg: "#FEF3C7" };
    return { text: `剩 ${diff} 天`, color: "#5F7A9B", bg: "#EDF3FA" };
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">SCAR 矯正行動管理</div>
          <div className="page-subtitle">Supplier Corrective Action Request — 追蹤供應商品質問題改善進度</div>
        </div>
        {canExport && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ev-btn ev-btn-ghost" onClick={() => exportScarsToExcel(filtered)}>
              <i className="bi bi-file-earmark-excel" /> 匯出 Excel
            </button>
            <button className="ev-btn ev-btn-primary">
              <i className="bi bi-plus-lg" /> 新增 SCAR
            </button>
          </div>
        )}
      </div>

      {/* Status stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { status: "open" as ScarStatus,        icon: "bi-exclamation-circle-fill", color: "#EF4444", bg: "#FEF2F2" },
          { status: "in_progress" as ScarStatus, icon: "bi-arrow-repeat",             color: "#3B82F6", bg: "#EFF6FF" },
          { status: "verified" as ScarStatus,    icon: "bi-check2-circle",            color: "#0EA5E9", bg: "#F0F9FF" },
          { status: "closed" as ScarStatus,      icon: "bi-check-all",                color: "#22C55E", bg: "#F0FDF4" },
          { status: "overdue" as ScarStatus,     icon: "bi-alarm-fill",               color: "#F97316", bg: "#FFF7ED" },
        ].map(({ status, icon, color, bg }) => {
          const c = getScarStatusColor(status);
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
              style={{
                background: statusFilter === status ? bg : "white",
                border: `1.5px solid ${statusFilter === status ? color : "#E0EBF8"}`,
                borderRadius: 10, padding: "12px 14px",
                cursor: "pointer", textAlign: "left",
                transition: "all 0.15s",
                boxShadow: statusFilter === status ? `0 2px 8px ${color}25` : "0 1px 4px rgba(91,143,217,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <i className={`bi ${icon}`} style={{ color, fontSize: "0.95rem" }} />
                <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>
                  {SCAR_STATUS_LABELS[status]}
                </span>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{counts[status] ?? 0}</div>
            </button>
          );
        })}
      </div>

      {/* Filter tabs + search */}
      <div className="ev-card" style={{ padding: 0, marginBottom: 18, overflow: "hidden" }}>
        <div
          style={{
            display: "flex", borderBottom: "1px solid #EAF1FB",
            background: "#FAFCFF", padding: "0 12px",
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "12px 14px", fontSize: "0.84rem",
                fontWeight: statusFilter === tab.key ? 700 : 500,
                color: statusFilter === tab.key ? "#5B8FD9" : "#5F7A9B",
                background: "none", border: "none",
                borderBottom: statusFilter === tab.key ? "2.5px solid #5B8FD9" : "2.5px solid transparent",
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {tab.label}
              {counts[tab.key] !== undefined && (
                <span
                  style={{
                    marginLeft: 6,
                    background: statusFilter === tab.key ? "#5B8FD9" : "#EDF3FA",
                    color: statusFilter === tab.key ? "white" : "#5F7A9B",
                    borderRadius: 9999, padding: "1px 7px",
                    fontSize: "0.72rem", fontWeight: 600,
                  }}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 8px" }}>
            <i className="bi bi-search" style={{ color: "#94AEC8", fontSize: "0.85rem", marginRight: 6 }} />
            <input
              className="ev-input"
              placeholder="搜尋 SCAR 編號、供應商..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220, border: "none", padding: "4px 0", boxShadow: "none" }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>SCAR 編號</th>
                <th>供應商</th>
                <th>問題類別</th>
                <th>問題描述</th>
                <th>觸發分數</th>
                <th>觸發等級</th>
                <th>目標完成日</th>
                <th>狀態</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sc) => {
                const statusC = getScarStatusColor(sc.status);
                const tierC = getTierColor(sc.triggered_tier);
                const days = daysInfo(sc.target_date, sc.status);
                return (
                  <tr key={sc.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600 }}>
                        {sc.scar_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem" }}>
                        {sc.supplier_name}
                      </div>
                      <div style={{ color: "#94AEC8", fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {sc.supplier_code}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 500 }}>
                        {sc.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <div
                        style={{
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          color: "#5F7A9B", fontSize: "0.82rem",
                        }}
                        title={sc.issue_description}
                      >
                        {sc.issue_description}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: scoreColor(sc.triggered_score), fontSize: "1rem" }}>
                        {sc.triggered_score}
                      </span>
                    </td>
                    <td>
                      <span className={`ev-badge ${tierC.bg} ${tierC.text}`}>
                        <span className={`ev-badge-dot ${tierC.dot}`} />
                        {TIER_LABELS[sc.triggered_tier]}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#5F7A9B" }}>
                        {sc.target_date}
                      </div>
                      {days && (
                        <span
                          style={{
                            fontSize: "0.7rem", fontWeight: 600,
                            color: days.color, background: days.bg,
                            padding: "1px 6px", borderRadius: 4, marginTop: 2, display: "inline-block",
                          }}
                        >
                          {days.text}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`ev-badge ${statusC.bg} ${statusC.text}`}>
                        <span className={`ev-badge-dot ${statusC.dot}`} />
                        {SCAR_STATUS_LABELS[sc.status]}
                      </span>
                    </td>
                    <td>
                      <Link href={`/scar/${sc.id}`}>
                        <button className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                          <i className="bi bi-eye" /> 查看
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#94AEC8" }}>
            <i className="bi bi-check2-all" style={{ fontSize: "2.2rem", display: "block", marginBottom: 8, color: "#22C55E" }} />
            此篩選條件下無 SCAR 紀錄
          </div>
        )}
      </div>
    </div>
  );
}
