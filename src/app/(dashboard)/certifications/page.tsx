"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CERTIFICATIONS } from "@/lib/mock-data";
import { getCertStatus, getCertStatusColor, getDaysUntilExpiry, formatDate } from "@/lib/utils";
import { CERT_STATUS_LABELS } from "@/types";
import type { CertStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { exportCertificationsToExcel } from "@/lib/export";

const CERT_TYPES = ["全部", "ISO 9001:2015", "IATF 16949:2016", "ISO 14001:2015", "ISO 45001:2018", "ISO/IEC 17025:2017", "AEC-Q102", "RoHS 合規聲明"];

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號無法存取此功能，請聯絡系統管理員。</div>
    </div>
  );
}

export default function CertificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<CertStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [supplierFilter, setSupplierFilter] = useState("全部");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && !["super_admin", "admin", "manager"].includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || !["super_admin", "admin", "manager"].includes(user.role)) {
    return <AccessDenied />;
  }

  // Compute statuses
  const certsWithStatus = useMemo(
    () => CERTIFICATIONS.map((c) => ({ ...c, status: getCertStatus(c.expiry_date), days: getDaysUntilExpiry(c.expiry_date) })),
    []
  );

  const expiredCount = certsWithStatus.filter((c) => c.status === "expired").length;
  const expiringSoonCount = certsWithStatus.filter((c) => c.status === "expiring_soon").length;
  const validCount = certsWithStatus.filter((c) => c.status === "valid").length;

  const supplierNames = ["全部", ...Array.from(new Set(CERTIFICATIONS.map((c) => c.supplier_name)))];

  const filtered = certsWithStatus.filter((c) => {
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchType = typeFilter === "全部" || c.cert_type === typeFilter;
    const matchSupplier = supplierFilter === "全部" || c.supplier_name === supplierFilter;
    const matchSearch = !search || c.cert_type.includes(search) || c.supplier_name.includes(search) || c.cert_number.includes(search);
    return matchStatus && matchType && matchSupplier && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">認證效期管理</div>
          <div className="page-subtitle">追蹤各供應商品質認證有效期，提前預警即將到期項目</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ev-btn ev-btn-ghost" onClick={() => exportCertificationsToExcel(filtered)}>
            <i className="bi bi-file-earmark-excel" /> Excel 匯出
          </button>
          <button className="ev-btn ev-btn-primary">
            <i className="bi bi-plus-lg" /> 新增認證
          </button>
        </div>
      </div>

      {/* Alert banners */}
      {expiredCount > 0 && (
        <div
          style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
            padding: "12px 18px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10,
            color: "#991B1B", fontSize: "0.875rem", fontWeight: 600,
          }}
        >
          <i className="bi bi-x-circle-fill" style={{ fontSize: "1.1rem" }} />
          <span>{expiredCount} 張認證已過期，請立即安排重新複審或申請！</span>
          <button
            onClick={() => setStatusFilter("expired")}
            style={{ marginLeft: "auto", background: "#FEE2E2", border: "none", borderRadius: 6, padding: "4px 12px", color: "#DC2626", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
          >
            查看 →
          </button>
        </div>
      )}
      {expiringSoonCount > 0 && (
        <div
          style={{
            background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10,
            padding: "12px 18px", marginBottom: 18,
            display: "flex", alignItems: "center", gap: 10,
            color: "#92400E", fontSize: "0.875rem", fontWeight: 600,
          }}
        >
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "1.1rem" }} />
          <span>{expiringSoonCount} 張認證將在 90 天內到期，請提前安排複查作業。</span>
          <button
            onClick={() => setStatusFilter("expiring_soon")}
            style={{ marginLeft: "auto", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 6, padding: "4px 12px", color: "#92400E", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
          >
            查看 →
          </button>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { key: "ALL" as const, label: "全部認證",   count: certsWithStatus.length, color: "#5B8FD9", bg: "#EDF3FA", icon: "bi-patch-check" },
          { key: "valid" as CertStatus, label: "有效",      count: validCount,         color: "#22C55E", bg: "#F0FDF4", icon: "bi-check-circle-fill" },
          { key: "expiring_soon" as CertStatus, label: "即將到期", count: expiringSoonCount, color: "#F59E0B", bg: "#FEF3C7", icon: "bi-clock-fill" },
          { key: "expired" as CertStatus, label: "已過期",   count: expiredCount,       color: "#EF4444", bg: "#FEF2F2", icon: "bi-x-circle-fill" },
        ].map(({ key, label, count, color, bg, icon }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
            style={{
              background: statusFilter === key ? bg : "white",
              border: `1.5px solid ${statusFilter === key ? color : "#E0EBF8"}`,
              borderRadius: 12, padding: "14px 18px",
              cursor: "pointer", textAlign: "left",
              boxShadow: statusFilter === key ? `0 2px 10px ${color}20` : "0 1px 4px rgba(91,143,217,0.06)",
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>{label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`bi ${icon}`} style={{ color, fontSize: "0.85rem" }} />
              </div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color }}>{count}</div>
          </button>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="ev-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Filter bar */}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #EAF1FB", background: "#FAFCFF", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 180 }}>
            <i className="bi bi-search" style={{ color: "#94AEC8", fontSize: "0.85rem" }} />
            <input
              className="ev-input"
              placeholder="搜尋認證類別、供應商、編號..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", boxShadow: "none", padding: "4px 0" }}
            />
          </div>
          <select
            className="ev-select"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            {supplierNames.map((n) => (
              <option key={n}>{n === "全部" ? "全部供應商" : n}</option>
            ))}
          </select>
          <select
            className="ev-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {CERT_TYPES.map((t) => <option key={t}>{t === "全部" ? "全部認證類別" : t}</option>)}
          </select>

          {/* Status filter chips */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["ALL", "valid", "expiring_soon", "expired"] as const).map((s) => {
              const isActive = statusFilter === s;
              const colorMap = { ALL: "#5B8FD9", valid: "#22C55E", expiring_soon: "#F59E0B", expired: "#EF4444" };
              const labelMap = { ALL: "全部", valid: "有效", expiring_soon: "即將到期", expired: "已過期" };
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "4px 12px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 600,
                    border: `1.5px solid ${isActive ? colorMap[s] : "#E0EBF8"}`,
                    background: isActive ? colorMap[s] : "white",
                    color: isActive ? "white" : "#5F7A9B",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {labelMap[s]}
                </button>
              );
            })}
          </div>

          <div style={{ color: "#5F7A9B", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
            共 <strong style={{ color: "#1E3A5F" }}>{filtered.length}</strong> 筆
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>供應商</th>
                <th>認證類別</th>
                <th>認證編號</th>
                <th>認證機構</th>
                <th style={{ textAlign: "center" }}>核發日期</th>
                <th style={{ textAlign: "center" }}>到期日期</th>
                <th style={{ textAlign: "center" }}>剩餘天數</th>
                <th>狀態</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => {
                const sc = getCertStatusColor(cert.status);
                const days = cert.days;
                let daysDisplay: React.ReactNode;
                if (days < 0) {
                  daysDisplay = (
                    <span style={{ color: "#DC2626", fontWeight: 700 }}>逾期 {Math.abs(days)} 天</span>
                  );
                } else if (days <= 30) {
                  daysDisplay = (
                    <span style={{ color: "#EF4444", fontWeight: 700 }}>{days} 天</span>
                  );
                } else if (days <= 90) {
                  daysDisplay = (
                    <span style={{ color: "#F59E0B", fontWeight: 700 }}>{days} 天</span>
                  );
                } else {
                  daysDisplay = (
                    <span style={{ color: "#22C55E", fontWeight: 600 }}>{days} 天</span>
                  );
                }

                return (
                  <tr key={cert.id}>
                    <td>
                      <Link href={`/suppliers/${cert.supplier_id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem", cursor: "pointer" }}>
                          {cert.supplier_name}
                        </div>
                        <div style={{ color: "#94AEC8", fontSize: "0.75rem", fontFamily: "monospace" }}>
                          {cert.supplier_code}
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#EDF3FA", color: "#5B8FD9",
                          padding: "3px 9px", borderRadius: 6,
                          fontSize: "0.78rem", fontWeight: 600,
                        }}
                      >
                        {cert.cert_type}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#5F7A9B" }}>
                      {cert.cert_number}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#5F7A9B" }}>{cert.issued_by}</td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", fontSize: "0.8rem", color: "#5F7A9B" }}>
                      {cert.issue_date}
                    </td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600, color: "#1E3A5F" }}>
                      {cert.expiry_date}
                    </td>
                    <td style={{ textAlign: "center" }}>{daysDisplay}</td>
                    <td>
                      <span className={`ev-badge ${sc.bg} ${sc.text}`}>
                        <span className={`ev-badge-dot ${sc.dot}`} />
                        {CERT_STATUS_LABELS[cert.status]}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, fontSize: "0.78rem", color: "#5F7A9B" }}>
                      <div
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        title={cert.notes}
                      >
                        {cert.notes}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#94AEC8" }}>
            <i className="bi bi-patch-check" style={{ fontSize: "2.2rem", display: "block", marginBottom: 8 }} />
            沒有符合條件的認證紀錄
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: "0.78rem", color: "#5F7A9B" }}>
        <span><span style={{ color: "#22C55E", fontWeight: 700 }}>●</span> 有效（&gt;90 天）</span>
        <span><span style={{ color: "#F59E0B", fontWeight: 700 }}>●</span> 即將到期（30–90 天）</span>
        <span><span style={{ color: "#EF4444", fontWeight: 700 }}>●</span> 緊急（≤30 天）</span>
        <span><span style={{ color: "#DC2626", fontWeight: 700 }}>●</span> 已過期</span>
      </div>
    </div>
  );
}
