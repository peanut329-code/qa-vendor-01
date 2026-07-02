"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ASL_RECORDS } from "@/lib/mock-data";
import { getAslStatusColor } from "@/lib/utils";
import { ASL_STATUS_LABELS } from "@/types";
import type { AslStatus } from "@/types";
import { exportAslToExcel } from "@/lib/export";

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號無法存取此功能，請聯絡系統管理員。</div>
    </div>
  );
}

const STATUS_ICON: Record<AslStatus, string> = {
  approved:    "bi-check-circle-fill",
  conditional: "bi-exclamation-circle-fill",
  probation:   "bi-hourglass-split",
  suspended:   "bi-x-circle-fill",
};

const STATUS_COUNT_COLOR: Record<AslStatus, { count: string; bg: string; icon: string }> = {
  approved:    { count: "#22C55E", bg: "#F0FDF4", icon: "bi-check-circle-fill" },
  conditional: { count: "#F59E0B", bg: "#FEF3C7", icon: "bi-exclamation-circle-fill" },
  probation:   { count: "#FB923C", bg: "#FFF7ED", icon: "bi-hourglass-split" },
  suspended:   { count: "#EF4444", bg: "#FEF2F2", icon: "bi-x-circle-fill" },
};

export default function AslPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState(ASL_RECORDS);
  const [statusFilter, setStatusFilter] = useState<AslStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);

  const [newRecord, setNewRecord] = useState({
    supplier_name: "",
    supplier_code: "",
    category: "矽晶圓",
    scope: "",
    status: "approved" as AslStatus,
    approved_by: "",
    approved_date: "2026-05-22",
    valid_until: "2029-05-21",
    review_date: "2027-05-22",
    conditions: "",
    notes: "",
  });

  function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!newRecord.supplier_name || !newRecord.supplier_code) {
      alert("請輸入供應商名稱與代碼");
      return;
    }
    const recordToAdd = {
      id: `asl-${Date.now()}`,
      supplier_id: `s-${Date.now()}`,
      ...newRecord
    };
    setRecords((prev) => [recordToAdd, ...prev]);
    setShowAddModal(false);
    setNewRecord({
      supplier_name: "",
      supplier_code: "",
      category: "矽晶圓",
      scope: "",
      status: "approved",
      approved_by: "",
      approved_date: "2026-05-22",
      valid_until: "2029-05-21",
      review_date: "2027-05-22",
      conditions: "",
      notes: "",
    });
  }

  if (!user || !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
    return <AccessDenied />;
  }

  const canExport = user && ["super_admin", "admin", "manager"].includes(user.role);

  const counts = useMemo(() => {
    const obj = { approved: 0, conditional: 0, probation: 0, suspended: 0 };
    records.forEach((r) => { obj[r.status]++; });
    return obj;
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchSearch = !search ||
        r.supplier_name.includes(search) ||
        r.supplier_code.includes(search) ||
        r.category.includes(search) ||
        r.scope.includes(search);
      return matchStatus && matchSearch;
    });
  }, [records, statusFilter, search]);

  const today = new Date("2026-07-03");

  function daysUntil(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 86400));
  }

  function DaysChip({ dateStr, label }: { dateStr: string; label: string }) {
    const d = daysUntil(dateStr);
    const color = d < 0 ? "#DC2626" : d <= 30 ? "#EF4444" : d <= 90 ? "#F59E0B" : "#22C55E";
    const text = d < 0 ? `逾期 ${Math.abs(d)} 天` : `${d} 天後`;
    return (
      <div>
        <div style={{ fontSize: "0.7rem", color: "#94AEC8", marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600, color: "#1E3A5F" }}>{dateStr}</div>
        <div style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>{text}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">合格供應商名單（ASL）</div>
          <div className="page-subtitle">Approved Supplier List — 追蹤供應商核准狀態、範圍及複評期限</div>
        </div>
        {canExport && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ev-btn ev-btn-ghost" onClick={() => exportAslToExcel(filtered)}>
              <i className="bi bi-file-earmark-excel" /> Excel 匯出
            </button>
            <button className="ev-btn ev-btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg" /> 新增記錄
            </button>
          </div>
        )}
      </div>

      {/* Warning banners */}
      {counts.probation > 0 && (
        <div style={{
          background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10,
          padding: "12px 18px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 10,
          color: "#92400E", fontSize: "0.875rem", fontWeight: 600,
        }}>
          <i className="bi bi-hourglass-split" style={{ fontSize: "1.1rem" }} />
          <span>{counts.probation} 家供應商處於試用觀察期，請密切監控改善進度。</span>
          <button
            onClick={() => setStatusFilter("probation")}
            style={{ marginLeft: "auto", background: "#FED7AA", border: "none", borderRadius: 6, padding: "4px 12px", color: "#92400E", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
          >
            查看 →
          </button>
        </div>
      )}
      {counts.conditional > 0 && (
        <div style={{
          background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10,
          padding: "12px 18px", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 10,
          color: "#92400E", fontSize: "0.875rem", fontWeight: 600,
        }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "1.1rem" }} />
          <span>{counts.conditional} 家供應商為條件核准，附帶改善條件尚待完成。</span>
          <button
            onClick={() => setStatusFilter("conditional")}
            style={{ marginLeft: "auto", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 6, padding: "4px 12px", color: "#92400E", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
          >
            查看 →
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        {/* Total */}
        <button
          onClick={() => setStatusFilter("ALL")}
          style={{
            background: statusFilter === "ALL" ? "#EDF3FA" : "white",
            border: `1.5px solid ${statusFilter === "ALL" ? "#5B8FD9" : "#E0EBF8"}`,
            borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left",
            boxShadow: statusFilter === "ALL" ? "0 2px 10px #5B8FD920" : "0 1px 4px rgba(91,143,217,0.06)",
            transition: "all 0.15s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>全部供應商</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EDF3FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-list-check" style={{ color: "#5B8FD9", fontSize: "0.85rem" }} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#5B8FD9" }}>{records.length}</div>
        </button>

        {(["approved", "conditional", "probation", "suspended"] as AslStatus[]).map((s) => {
          const cc = STATUS_COUNT_COLOR[s];
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              style={{
                background: isActive ? cc.bg : "white",
                border: `1.5px solid ${isActive ? cc.count : "#E0EBF8"}`,
                borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left",
                boxShadow: isActive ? `0 2px 10px ${cc.count}20` : "0 1px 4px rgba(91,143,217,0.06)",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>{ASL_STATUS_LABELS[s]}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: cc.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`bi ${cc.icon}`} style={{ color: cc.count, fontSize: "0.85rem" }} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: cc.count }}>{counts[s]}</div>
            </button>
          );
        })}
      </div>

      {/* Card list */}
      <div className="ev-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Filter bar */}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #EAF1FB", background: "#FAFCFF", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200 }}>
            <i className="bi bi-search" style={{ color: "#94AEC8", fontSize: "0.85rem" }} />
            <input
              className="ev-input"
              placeholder="搜尋供應商名稱、代碼、類別..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", boxShadow: "none", padding: "4px 0" }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["ALL", "approved", "conditional", "probation", "suspended"] as const).map((s) => {
              const isActive = statusFilter === s;
              const colorMap: Record<string, string> = { ALL: "#5B8FD9", approved: "#22C55E", conditional: "#F59E0B", probation: "#FB923C", suspended: "#EF4444" };
              const labelMap: Record<string, string> = { ALL: "全部", approved: "核准合格", conditional: "條件核准", probation: "試用觀察", suspended: "暫停使用" };
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

        {/* ASL Records */}
        <div style={{ padding: "8px 0" }}>
          {filtered.map((r) => {
            const sc = getAslStatusColor(r.status);
            const isExpanded = expandedId === r.id;
            const reviewDays = daysUntil(r.review_date);
            const validDays = daysUntil(r.valid_until);
            const urgentReview = reviewDays >= 0 && reviewDays <= 60;
            const expiredValidity = validDays < 0;

            return (
              <div
                key={r.id}
                style={{
                  borderBottom: "1px solid #EAF1FB",
                  transition: "background 0.12s",
                }}
              >
                {/* Main row */}
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    cursor: "pointer",
                    background: isExpanded ? "#FAFCFF" : "white",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  {/* Status indicator */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: sc.bg === "bg-emerald-100" ? "#D1FAE5" : sc.bg === "bg-amber-100" ? "#FDE68A" : sc.bg === "bg-orange-100" ? "#FED7AA" : "#FECACA",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className={`bi ${STATUS_ICON[r.status]}`} style={{
                      fontSize: "1.2rem",
                      color: sc.border,
                    }} />
                  </div>

                  {/* Supplier info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <Link
                        href={`/suppliers/${r.supplier_id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ textDecoration: "none" }}
                      >
                        <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem" }}>
                          {r.supplier_name}
                        </span>
                      </Link>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#94AEC8" }}>
                        {r.supplier_code}
                      </span>
                      <span style={{
                        background: "#EDF3FA", color: "#5B8FD9",
                        padding: "2px 8px", borderRadius: 5,
                        fontSize: "0.72rem", fontWeight: 600,
                      }}>
                        {r.category}
                      </span>
                      <span className={`ev-badge ${sc.bg} ${sc.text}`}>
                        <span className={`ev-badge-dot`} style={{ background: sc.border }} />
                        {ASL_STATUS_LABELS[r.status]}
                      </span>
                      {urgentReview && (
                        <span style={{
                          background: "#FEF3C7", color: "#92400E",
                          padding: "2px 8px", borderRadius: 5,
                          fontSize: "0.72rem", fontWeight: 600,
                        }}>
                          <i className="bi bi-bell-fill" style={{ fontSize: "0.65rem", marginRight: 4 }} />
                          複評在即
                        </span>
                      )}
                      {expiredValidity && (
                        <span style={{
                          background: "#FEF2F2", color: "#DC2626",
                          padding: "2px 8px", borderRadius: 5,
                          fontSize: "0.72rem", fontWeight: 600,
                        }}>
                          <i className="bi bi-x-circle-fill" style={{ fontSize: "0.65rem", marginRight: 4 }} />
                          效期已過
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#5F7A9B", lineHeight: 1.5, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: "#5B8FD9" }}>核准範圍：</span>
                      {r.scope}
                    </div>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#94AEC8" }}>核准人員：</span>
                        <span style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600 }}>{r.approved_by}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#94AEC8" }}>核准日期：</span>
                        <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#5F7A9B" }}>{r.approved_date}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#94AEC8" }}>有效期限：</span>
                        <span style={{
                          fontSize: "0.8rem", fontFamily: "monospace", fontWeight: 600,
                          color: expiredValidity ? "#DC2626" : validDays <= 90 ? "#F59E0B" : "#1E3A5F",
                        }}>
                          {r.valid_until}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#94AEC8" }}>下次複評：</span>
                        <span style={{
                          fontSize: "0.8rem", fontFamily: "monospace", fontWeight: 600,
                          color: urgentReview ? "#F59E0B" : "#1E3A5F",
                        }}>
                          {r.review_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand icon */}
                  <div style={{ flexShrink: 0, color: "#94AEC8", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                    <i className="bi bi-chevron-down" />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    padding: "0 20px 20px 80px",
                    background: "#FAFCFF",
                    borderTop: "1px solid #EAF1FB",
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, paddingTop: 16 }}>
                      <div style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: "1px solid #EAF1FB" }}>
                        <DaysChip dateStr={r.valid_until} label="有效期限" />
                      </div>
                      <div style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: "1px solid #EAF1FB" }}>
                        <DaysChip dateStr={r.review_date} label="下次複評日期" />
                      </div>
                      <div style={{ background: "white", borderRadius: 10, padding: "14px 16px", border: "1px solid #EAF1FB" }}>
                        <div style={{ fontSize: "0.7rem", color: "#94AEC8", marginBottom: 4 }}>核准人員</div>
                        <div style={{ fontWeight: 700, color: "#1E3A5F" }}>{r.approved_by}</div>
                        <div style={{ fontSize: "0.75rem", color: "#5F7A9B" }}>核准於 {r.approved_date}</div>
                      </div>
                    </div>

                    {r.conditions && (
                      <div style={{ marginTop: 12, background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: "0.72rem", color: "#92400E", fontWeight: 700, marginBottom: 4 }}>
                          <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 6 }} />
                          附帶條件
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#78350F", lineHeight: 1.6 }}>{r.conditions}</div>
                      </div>
                    )}

                    {r.notes && (
                      <div style={{ marginTop: 10, background: "#F7FAFF", border: "1px solid #EAF1FB", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: "0.72rem", color: "#5B8FD9", fontWeight: 700, marginBottom: 4 }}>
                          <i className="bi bi-info-circle-fill" style={{ marginRight: 6 }} />
                          備註
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#5F7A9B", lineHeight: 1.6 }}>{r.notes}</div>
                      </div>
                    )}

                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <Link href={`/suppliers/${r.supplier_id}`}>
                        <button className="ev-btn ev-btn-ghost" style={{ fontSize: "0.8rem" }}>
                          <i className="bi bi-building" /> 供應商詳情
                        </button>
                      </Link>
                      <button 
                        className="ev-btn ev-btn-ghost" 
                        style={{ fontSize: "0.8rem" }}
                        onClick={() => setEditRecord(r)}
                      >
                        <i className="bi bi-pencil-square" /> 編輯記錄
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#94AEC8" }}>
            <i className="bi bi-list-check" style={{ fontSize: "2.2rem", display: "block", marginBottom: 8 }} />
            沒有符合條件的 ASL 記錄
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: "0.78rem", color: "#5F7A9B", flexWrap: "wrap" }}>
        <span><span style={{ color: "#22C55E", fontWeight: 700 }}>●</span> 核准合格：正式列入合格名單，可直接採購</span>
        <span><span style={{ color: "#F59E0B", fontWeight: 700 }}>●</span> 條件核准：附帶改善條件，需於期限內達成</span>
        <span><span style={{ color: "#FB923C", fontWeight: 700 }}>●</span> 試用觀察：試用期監控，未達標則暫停使用</span>
        <span><span style={{ color: "#EF4444", fontWeight: 700 }}>●</span> 暫停使用：禁止採購，需完成重新認定</span>
      </div>

      {editRecord && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="ev-card" style={{
            width: "90%", maxWidth: 540, padding: 24, 
            boxShadow: "0 10px 30px rgba(30,58,95,0.15)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F" }}>編輯 ASL 合格記錄</div>
              <button 
                type="button"
                onClick={() => setEditRecord(null)}
                style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setRecords((prev) => prev.map((r) => r.id === editRecord.id ? editRecord : r));
              setEditRecord(null);
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商名稱 *</label>
                    <input 
                      className="ev-input" style={{ width: "100%", background: "#F5F8FC" }} readOnly
                      value={editRecord.supplier_name}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商代碼 *</label>
                    <input 
                      className="ev-input" style={{ width: "100%", background: "#F5F8FC" }} readOnly
                      value={editRecord.supplier_code}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商品類 *</label>
                    <select 
                      className="ev-select" style={{ width: "100%" }} required
                      value={editRecord.category} onChange={(e) => setEditRecord({...editRecord, category: e.target.value})}
                    >
                      {["矽晶圓", "特殊氣體", "光罩製造", "封裝測試", "製程化學品", "原物料", "加工製造"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>審查狀態 *</label>
                    <select 
                      className="ev-select" style={{ width: "100%" }} required
                      value={editRecord.status} onChange={(e) => setEditRecord({...editRecord, status: e.target.value as AslStatus})}
                    >
                      <option value="approved">核准合格</option>
                      <option value="conditional">條件核准</option>
                      <option value="probation">試用觀察</option>
                      <option value="suspended">暫停使用</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>核准範圍 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} required
                    value={editRecord.scope} onChange={(e) => setEditRecord({...editRecord, scope: e.target.value})}
                    placeholder="例：300mm 矽晶圓供應"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>核准人員 *</label>
                    <input 
                      className="ev-input" style={{ width: "100%" }} required
                      value={editRecord.approved_by} onChange={(e) => setEditRecord({...editRecord, approved_by: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>核准日期 *</label>
                    <input 
                      type="date" className="ev-input" style={{ width: "100%" }} required
                      value={editRecord.approved_date} onChange={(e) => setEditRecord({...editRecord, approved_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>有效期限 *</label>
                    <input 
                      type="date" className="ev-input" style={{ width: "100%" }} required
                      value={editRecord.valid_until} onChange={(e) => setEditRecord({...editRecord, valid_until: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>定期審查日 *</label>
                  <input 
                    type="date" className="ev-input" style={{ width: "100%" }} required
                    value={editRecord.review_date} onChange={(e) => setEditRecord({...editRecord, review_date: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>附帶條件 (條件核准時必填)</label>
                  <textarea 
                    className="ev-input" style={{ width: "100%", height: 60, resize: "none", padding: "8px 10px" }}
                    value={editRecord.conditions || ""} onChange={(e) => setEditRecord({...editRecord, conditions: e.target.value})}
                    placeholder="若狀態為條件核准，請列明具體附帶條件與期限..."
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>備註</label>
                  <textarea 
                    className="ev-input" style={{ width: "100%", height: 60, resize: "none", padding: "8px 10px" }}
                    value={editRecord.notes || ""} onChange={(e) => setEditRecord({...editRecord, notes: e.target.value})}
                    placeholder="其他需要特別註記的事項..."
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #EAF1FB", paddingTop: 16 }}>
                <button type="button" className="ev-btn ev-btn-ghost" onClick={() => setEditRecord(null)}>取消</button>
                <button type="submit" className="ev-btn ev-btn-primary">儲存變更</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="ev-card" style={{
            width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
            padding: 24, boxShadow: "0 10px 30px rgba(30,58,95,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F" }}>新增合格供應商記錄</div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleAddRecord}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商名稱 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} required
                    value={newRecord.supplier_name} onChange={(e) => setNewRecord({...newRecord, supplier_name: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商代碼 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} placeholder="例：SUP-006" required
                    value={newRecord.supplier_code} onChange={(e) => setNewRecord({...newRecord, supplier_code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>分類 *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }}
                    value={newRecord.category} onChange={(e) => setNewRecord({...newRecord, category: e.target.value})}
                  >
                    {["矽晶圓", "特殊氣體", "光罩製造", "封裝測試", "製程化學品", "機械零件", "電子元件", "化工原料", "包裝材料", "物流服務", "口鼻罩", "頸部"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>核准狀態 *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }}
                    value={newRecord.status} onChange={(e) => setNewRecord({...newRecord, status: e.target.value as AslStatus})}
                  >
                    <option value="approved">核准合格</option>
                    <option value="conditional">條件核准</option>
                    <option value="probation">試用觀察</option>
                    <option value="suspended">暫停使用</option>
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應範疇 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} placeholder="例：產品品項與規格說明" required
                    value={newRecord.scope} onChange={(e) => setNewRecord({...newRecord, scope: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>核准人 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} required
                    value={newRecord.approved_by} onChange={(e) => setNewRecord({...newRecord, approved_by: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>核准日期 *</label>
                  <input 
                    type="date" className="ev-input" style={{ width: "100%" }} required
                    value={newRecord.approved_date} onChange={(e) => setNewRecord({...newRecord, approved_date: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>複評日期 *</label>
                  <input 
                    type="date" className="ev-input" style={{ width: "100%" }} required
                    value={newRecord.review_date} onChange={(e) => setNewRecord({...newRecord, review_date: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>有效期限 *</label>
                  <input 
                    type="date" className="ev-input" style={{ width: "100%" }} required
                    value={newRecord.valid_until} onChange={(e) => setNewRecord({...newRecord, valid_until: e.target.value})}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>附帶條件</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} placeholder="例：無則免填"
                    value={newRecord.conditions} onChange={(e) => setNewRecord({...newRecord, conditions: e.target.value})}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>備註</label>
                  <textarea 
                    className="ev-input" style={{ width: "100%", height: 60, resize: "none", fontFamily: "inherit" }}
                    value={newRecord.notes} onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #EAF1FB", paddingTop: 16 }}>
                <button type="button" className="ev-btn ev-btn-ghost" onClick={() => setShowAddModal(false)}>取消</button>
                <button type="submit" className="ev-btn ev-btn-primary">確認新增</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
