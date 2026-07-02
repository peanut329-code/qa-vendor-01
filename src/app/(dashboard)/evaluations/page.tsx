"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EVALUATIONS } from "@/lib/mock-data";
import { getTierColor, getEvalStatusColor, formatDate } from "@/lib/utils";
import { TIER_LABELS, EVAL_STATUS_LABELS } from "@/types";
import type { EvaluationStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_TABS: { key: EvaluationStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "全部" },
  { key: "draft", label: "草稿" },
  { key: "in_progress", label: "進行中" },
  { key: "completed", label: "已完成" },
  { key: "approved", label: "已核准" },
  { key: "rejected", label: "已退回" },
];

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號（唯讀觀察者）無法存取此功能，請聯絡系統管理員。</div>
    </div>
  );
}

export default function EvaluationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let updated = false;
      EVALUATIONS.forEach((e) => {
        const savedStatus = localStorage.getItem(`eval-status-${e.id}`);
        const savedDetail = localStorage.getItem(`eval-detail-${e.id}`);
        if (savedStatus && e.status !== savedStatus) {
          e.status = savedStatus as any;
          updated = true;
        }
        if (savedDetail) {
          try {
            const parsed = JSON.parse(savedDetail);
            if (parsed.total_score !== e.total_score || parsed.tier !== e.tier) {
              e.total_score = parsed.total_score;
              e.tier = parsed.tier;
              e.updated_at = parsed.updated_at;
              updated = true;
            }
          } catch (err) {}
        }
      });
      if (updated) {
        setRefreshKey((prev) => prev + 1);
      }
    }
  }, []);

  const canCreate = user && ["super_admin", "admin", "manager", "evaluator"].includes(user.role);
  const canReview = user && ["super_admin", "admin", "manager"].includes(user.role);

  const filtered = EVALUATIONS.filter((e) => {
    const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
    const matchSearch = !search || e.supplier_name.includes(search) || e.supplier_code.includes(search);
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = { ALL: EVALUATIONS.length };
  EVALUATIONS.forEach((e) => {
    counts[e.status] = (counts[e.status] ?? 0) + 1;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">評鑑作業</div>
          <div className="page-subtitle">管理所有供應商評鑑流程與紀錄</div>
        </div>
        {canCreate && (
          <button className="ev-btn ev-btn-primary" onClick={() => router.push("/evaluations/new")}>
            <i className="bi bi-plus-lg" />
            新增評鑑
          </button>
        )}
      </div>

      {/* Status cards summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { status: "draft" as EvaluationStatus, icon: "bi-file-earmark", color: "#6B7280", bg: "#F3F4F6" },
          { status: "in_progress" as EvaluationStatus, icon: "bi-arrow-repeat", color: "#3B82F6", bg: "#EFF6FF" },
          { status: "completed" as EvaluationStatus, icon: "bi-check-circle", color: "#10B981", bg: "#ECFDF5" },
          { status: "approved" as EvaluationStatus, icon: "bi-shield-check", color: "#059669", bg: "#D1FAE5" },
          { status: "rejected" as EvaluationStatus, icon: "bi-x-circle", color: "#EF4444", bg: "#FEF2F2" },
        ].map(({ status, icon, color, bg }) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
            style={{
              background: statusFilter === status ? bg : "white",
              border: `1.5px solid ${statusFilter === status ? color : "#E0EBF8"}`,
              borderRadius: 10,
              padding: "12px 14px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
              boxShadow: statusFilter === status ? `0 2px 8px ${color}25` : "0 1px 4px rgba(91,143,217,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <i className={`bi ${icon}`} style={{ color, fontSize: "0.95rem" }} />
              <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>
                {EVAL_STATUS_LABELS[status]}
              </span>
            </div>
            <div className="score-display" style={{ fontSize: "1.4rem", fontWeight: 800, color }}>
              {counts[status] ?? 0}
            </div>
          </button>
        ))}
      </div>

      {/* Status tab filter */}
      <div className="ev-card" style={{ padding: 0, marginBottom: 18, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #EAF1FB",
            background: "#FAFCFF",
            padding: "0 12px",
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "12px 16px",
                fontSize: "0.84rem",
                fontWeight: statusFilter === tab.key ? 700 : 500,
                color: statusFilter === tab.key ? "#5B8FD9" : "#5F7A9B",
                background: "none",
                border: "none",
                borderBottom: statusFilter === tab.key ? "2.5px solid #5B8FD9" : "2.5px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
              {counts[tab.key] !== undefined && (
                <span
                  style={{
                    marginLeft: 6,
                    background: statusFilter === tab.key ? "#5B8FD9" : "#EDF3FA",
                    color: statusFilter === tab.key ? "white" : "#5F7A9B",
                    borderRadius: 9999,
                    padding: "1px 7px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bi bi-search" style={{ color: "#94AEC8", fontSize: "0.85rem" }} />
              <input
                className="ev-input"
                placeholder="搜尋供應商..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 200, border: "none", padding: "4px 0", boxShadow: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>評鑑編號</th>
                <th>供應商</th>
                <th>評鑑期間</th>
                <th>評鑑人員</th>
                <th>總分</th>
                <th>等級</th>
                <th>狀態</th>
                <th>更新時間</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => {
                const statusC = getEvalStatusColor(ev.status);
                const tierC = ev.tier ? getTierColor(ev.tier) : null;
                return (
                  <tr key={ev.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600 }}>
                        EVL-{String(i + 1).padStart(3, "0")}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem" }}>{ev.supplier_name}</div>
                      <div style={{ color: "#94AEC8", fontSize: "0.75rem", fontFamily: "monospace" }}>{ev.supplier_code}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#EDF3FA",
                          color: "#5B8FD9",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          fontFamily: "monospace",
                        }}
                      >
                        {ev.period}
                      </span>
                    </td>
                    <td style={{ color: "#5F7A9B", fontSize: "0.85rem" }}>{ev.evaluator_name}</td>
                    <td>
                      {ev.total_score !== null ? (
                        <span className="score-display" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1E3A5F" }}>
                          {ev.total_score.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: "#C5D8F0" }}>—</span>
                      )}
                    </td>
                    <td>
                      {tierC && ev.tier ? (
                        <span className={`ev-badge ${tierC.bg} ${tierC.text}`}>
                          <span className={`ev-badge-dot ${tierC.dot}`} />
                          {TIER_LABELS[ev.tier]}
                        </span>
                      ) : (
                        <span style={{ color: "#C5D8F0" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`ev-badge ${statusC.bg} ${statusC.text}`}>
                        {EVAL_STATUS_LABELS[ev.status]}
                      </span>
                    </td>
                    <td style={{ color: "#5F7A9B", fontSize: "0.8rem", fontFamily: "monospace" }}>
                      {formatDate(ev.updated_at)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Link href={`/evaluations/${ev.id}`}>
                          <button className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                            <i className="bi bi-eye" /> 查看
                          </button>
                        </Link>
                        {canReview && ev.status === "completed" && (
                          <Link href={`/evaluations/${ev.id}`}>
                            <button className="ev-btn ev-btn-primary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                              審核
                            </button>
                          </Link>
                        )}
                        {ev.status === "draft" && (
                          <button className="ev-btn ev-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                            <i className="bi bi-pencil" />
                          </button>
                        )}
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
            <i className="bi bi-clipboard2-x" style={{ fontSize: "2.2rem", display: "block", marginBottom: 8 }} />
            此狀態下無評鑑紀錄
          </div>
        )}
      </div>
    </div>
  );
}
