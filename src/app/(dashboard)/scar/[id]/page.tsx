"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SCARS } from "@/lib/mock-data";
import { getScarStatusColor, getTierColor, scoreColor } from "@/lib/utils";
import { SCAR_STATUS_LABELS, TIER_LABELS } from "@/types";
import type { ScarStatus, SupplierTier } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { printScarReport, exportScarsToExcel } from "@/lib/export";

const STATUS_FLOW: { from: ScarStatus; to: ScarStatus; label: string; color: string; icon: string }[] = [
  { from: "open",        to: "in_progress", label: "開始改善",  color: "#3B82F6", icon: "bi-arrow-repeat" },
  { from: "in_progress", to: "verified",    label: "申請驗證",  color: "#0EA5E9", icon: "bi-check2-circle" },
  { from: "verified",    to: "closed",      label: "結案確認",  color: "#22C55E", icon: "bi-check-all" },
];

const TIMELINE_STEPS: { status: ScarStatus; label: string; icon: string }[] = [
  { status: "open",        label: "發行 SCAR", icon: "bi-exclamation-circle-fill" },
  { status: "in_progress", label: "改善執行中", icon: "bi-arrow-repeat" },
  { status: "verified",    label: "驗證完成",   icon: "bi-check2-circle" },
  { status: "closed",      label: "正式結案",   icon: "bi-check-all" },
];

const STATUS_ORDER: Record<ScarStatus, number> = {
  open: 0, in_progress: 1, verified: 2, closed: 3, overdue: 1,
};

export default function ScarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [scar, setScar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<ScarStatus>("open");
  const [showConfirm, setShowConfirm] = useState<ScarStatus | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCustom = localStorage.getItem("scars-custom");
      let custom: any[] = [];
      if (savedCustom) {
        try { custom = JSON.parse(savedCustom); } catch (e) {}
      }

      const savedEdited = localStorage.getItem("scars-edited");
      let editedMap: Record<string, any> = {};
      if (savedEdited) {
        try { editedMap = JSON.parse(savedEdited); } catch (e) {}
      }

      const deletedSaved = localStorage.getItem("scars-deleted");
      let deletedIds: string[] = [];
      if (deletedSaved) {
        try { deletedIds = JSON.parse(deletedSaved); } catch (e) {}
      }

      if (deletedIds.includes(id)) {
        setScar(null);
        setLoading(false);
        return;
      }

      const all = [...SCARS, ...custom];
      const found = all.find(s => s.id === id);
      if (found) {
        let current = { ...found };
        if (editedMap[found.id]) {
          current = { ...current, ...editedMap[found.id] };
        }
        // Correct the company typo in issue_description if found
        if (current.issue_description) {
          current.issue_description = current.issue_description.replace("company 公司", "公司");
        }
        setScar(current);
        setCurrentStatus(current.status);
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#5F7A9B" }}>
        <div className="spinner-border text-primary" role="status" style={{ width: "2rem", height: "2rem", marginBottom: 12 }} />
        <div>載入中...</div>
      </div>
    );
  }

  if (!scar) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <i className="bi bi-file-earmark-x" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B" }}>找不到此 SCAR 記錄</div>
        <button className="ev-btn ev-btn-ghost" style={{ marginTop: 20 }} onClick={() => router.push("/scar")}>← 回 SCAR 列表</button>
      </div>
    );
  }

  const sc = getScarStatusColor(currentStatus);
  const tierC = getTierColor(scar.triggered_tier as SupplierTier);
  const canUpdate = user && ["super_admin", "admin", "manager"].includes(user.role);

  const nextFlow = STATUS_FLOW.find((f) => f.from === currentStatus);
  const currentOrder = STATUS_ORDER[currentStatus];

  function confirmStatusChange(toStatus: ScarStatus) {
    setCurrentStatus(toStatus);
    setShowConfirm(null);

    if (scar) {
      const updated = { ...scar, status: toStatus };
      if (typeof window !== "undefined") {
        if (scar.id.startsWith("scar-")) {
          const customSaved = localStorage.getItem("scars-custom");
          if (customSaved) {
            try {
              const list = JSON.parse(customSaved);
              const idx = list.findIndex((x: any) => x.id === scar.id);
              if (idx > -1) {
                list[idx] = updated;
                localStorage.setItem("scars-custom", JSON.stringify(list));
              }
            } catch (e) {}
          }
        } else {
          const editedSaved = localStorage.getItem("scars-edited");
          let editedMap: Record<string, any> = {};
          if (editedSaved) {
            try { editedMap = JSON.parse(editedSaved); } catch (e) {}
          }
          editedMap[scar.id] = updated;
          localStorage.setItem("scars-edited", JSON.stringify(editedMap));
        }
      }
      setScar(updated);
    }
  }

  // Corrective action lines
  const caLines = scar.corrective_action.split("\n").filter(Boolean);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: "0.82rem", color: "#94AEC8" }}>
        <Link href="/scar" style={{ color: "#94AEC8", textDecoration: "none" }}>SCAR 管理</Link>
        <i className="bi bi-chevron-right" style={{ fontSize: "0.7rem" }} />
        <span style={{ color: "#5B8FD9", fontWeight: 600 }}>{scar.scar_number}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div className="page-title">{scar.scar_number}</div>
            <span className={`ev-badge ${sc.bg} ${sc.text}`} style={{ fontSize: "0.88rem" }}>
              <span className={`ev-badge-dot ${sc.dot}`} />
              {SCAR_STATUS_LABELS[currentStatus]}
            </span>
          </div>
          <div className="page-subtitle">
            {scar.supplier_name} ／ {scar.supplier_code} ／ 問題類別：{scar.category}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ev-btn ev-btn-ghost" onClick={() => printScarReport({ ...scar, status: currentStatus })}>
            <i className="bi bi-printer" /> 列印 PDF
          </button>
          <button className="ev-btn ev-btn-secondary" onClick={() => exportScarsToExcel([{ ...scar, status: currentStatus }])}>
            <i className="bi bi-file-earmark-excel" /> Excel
          </button>
          {canUpdate && nextFlow && (
            <button
              className="ev-btn ev-btn-primary"
              style={{ background: nextFlow.color, borderColor: nextFlow.color }}
              onClick={() => setShowConfirm(nextFlow.to)}
            >
              <i className={`bi ${nextFlow.icon}`} /> {nextFlow.label}
            </button>
          )}
        </div>
      </div>

      {/* Confirm status change modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setShowConfirm(null)}
        >
          <div
            style={{
              background: "white", borderRadius: 16, padding: "28px 32px",
              maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "1.05rem", marginBottom: 8 }}>
              確認狀態變更
            </div>
            <div style={{ color: "#5F7A9B", marginBottom: 20, fontSize: "0.875rem" }}>
              是否確認將 SCAR 狀態從
              <span className={`ev-badge ${getScarStatusColor(currentStatus).bg} ${getScarStatusColor(currentStatus).text}`} style={{ margin: "0 6px" }}>
                {SCAR_STATUS_LABELS[currentStatus]}
              </span>
              更新為
              <span className={`ev-badge ${getScarStatusColor(showConfirm).bg} ${getScarStatusColor(showConfirm).text}`} style={{ margin: "0 6px" }}>
                {SCAR_STATUS_LABELS[showConfirm]}
              </span>
              ？
              <br /><span style={{ fontSize: "0.8rem", color: "#F59E0B", marginTop: 6, display: "block" }}>
                （Demo 模式：重新整理後會恢復原狀態）
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="ev-btn ev-btn-ghost" onClick={() => setShowConfirm(null)}>取消</button>
              <button className="ev-btn ev-btn-primary" onClick={() => confirmStatusChange(showConfirm)}>確認變更</button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="ev-card" style={{ padding: "20px 24px", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 16, fontSize: "0.9rem" }}>
          <i className="bi bi-clock-history" style={{ color: "#5B8FD9", marginRight: 8 }} />
          改善進度時間軸
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {TIMELINE_STEPS.map((step, i) => {
            const isDone = STATUS_ORDER[step.status] <= currentOrder;
            const isCurrent = step.status === currentStatus || (currentStatus === "overdue" && step.status === "in_progress");
            return (
              <div key={step.status} style={{ display: "flex", alignItems: "center", flex: i < TIMELINE_STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 }}>
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: isDone ? (isCurrent ? "#5B8FD9" : "#22C55E") : "#EDF3FA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: isCurrent ? "3px solid #5B8FD9" : isDone ? "3px solid #22C55E" : "2px solid #D0DEF0",
                      boxShadow: isCurrent ? "0 0 0 4px rgba(91,143,217,0.15)" : "none",
                      transition: "all 0.3s",
                    }}
                  >
                    <i
                      className={`bi ${step.icon}`}
                      style={{
                        fontSize: "1rem",
                        color: isDone ? "white" : "#94AEC8",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: isDone ? "#1E3A5F" : "#94AEC8", fontWeight: isDone ? 600 : 400, marginTop: 6, textAlign: "center" }}>
                    {step.label}
                  </div>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1, height: 3, marginBottom: 20,
                      background: STATUS_ORDER[TIMELINE_STEPS[i + 1].status] <= currentOrder
                        ? "linear-gradient(90deg,#22C55E,#22C55E)"
                        : "#E0EBF8",
                      transition: "all 0.3s",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Key info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="ev-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginBottom: 4 }}>文件登入日期</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E3A5F" }}>
            {scar.created_at.slice(0, 10)}
          </div>
        </div>
        <div className="ev-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginBottom: 4 }}>觸發分數</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: scoreColor(scar.triggered_score) }}>
            {scar.triggered_score}
          </div>
        </div>
        <div className="ev-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginBottom: 6 }}>觸發等級</div>
          <span className={`ev-badge ${tierC.bg} ${tierC.text}`} style={{ fontSize: "0.88rem" }}>
            <span className={`ev-badge-dot ${tierC.dot}`} />
            {scar.triggered_tier ? TIER_LABELS[scar.triggered_tier as SupplierTier] : "—"}
          </span>
        </div>
        <div className="ev-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginBottom: 4 }}>目標完成日</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E3A5F" }}>{scar.target_date}</div>
        </div>
        <div className="ev-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginBottom: 4 }}>驗證日期</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: scar.verified_date ? "#22C55E" : "#94AEC8" }}>
            {scar.verified_date ? scar.verified_date.slice(0, 10) : "尚未驗證"}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Issue + Root cause */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ev-card" style={{ padding: "20px 22px" }}>
            <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 10, fontSize: "0.9rem" }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: "#EF4444", marginRight: 8 }} />
              問題描述
            </div>
            <div
              style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: 8, padding: "12px 14px",
                color: "#5F7A9B", fontSize: "0.875rem", lineHeight: 1.8,
              }}
            >
              {scar.issue_description}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: "0.78rem" }}>
              <span><span style={{ color: "#94AEC8" }}>供應商：</span><strong style={{ color: "#1E3A5F" }}>{scar.supplier_name}</strong></span>
              <span><span style={{ color: "#94AEC8" }}>類別：</span>
                <span style={{ background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 4 }}>{scar.category}</span>
              </span>
            </div>
          </div>

          <div className="ev-card" style={{ padding: "20px 22px" }}>
            <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 10, fontSize: "0.9rem" }}>
              <i className="bi bi-search" style={{ color: "#F59E0B", marginRight: 8 }} />
              根本原因分析
            </div>
            <div
              style={{
                background: "#FFF7ED", border: "1px solid #FED7AA",
                borderRadius: 8, padding: "12px 14px",
                color: "#5F7A9B", fontSize: "0.875rem", lineHeight: 1.8,
              }}
            >
              {scar.root_cause}
            </div>
          </div>
        </div>

        {/* Corrective action */}
        <div className="ev-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 10, fontSize: "0.9rem" }}>
            <i className="bi bi-tools" style={{ color: "#22C55E", marginRight: 8 }} />
            矯正措施計畫
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {caLines.map((line: string, i: number) => {
              const isCompleted = line.includes("已完成") || line.includes("已上線") || line.includes("已補充");
              return (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: isCompleted ? "#F0FDF4" : "#F7FAFF",
                    border: `1px solid ${isCompleted ? "#BBF7D0" : "#EAF1FB"}`,
                    borderRadius: 8, padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      background: isCompleted ? "#22C55E" : "#EDF3FA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <i
                      className={`bi ${isCompleted ? "bi-check-lg" : "bi-circle"}`}
                      style={{ fontSize: "0.75rem", color: isCompleted ? "white" : "#94AEC8" }}
                    />
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#5F7A9B", lineHeight: 1.6, flex: 1 }}>
                    {line}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary bar */}
          {caLines.length > 0 && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: "#EDF3FA", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 600 }}>完成進度</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#5B8FD9" }}>
                  {caLines.filter((l: string) => l.includes("已完成") || l.includes("已上線") || l.includes("已補充")).length}
                  /{caLines.length} 項
                </span>
              </div>
              <div style={{ height: 6, background: "#C5D8F0", borderRadius: 999 }}>
                <div
                  style={{
                    height: "100%", borderRadius: 999,
                    background: "linear-gradient(90deg,#5B8FD9,#22C55E)",
                    width: `${(caLines.filter((l: string) => l.includes("已完成") || l.includes("已上線") || l.includes("已補充")).length / caLines.length) * 100}%`,
                    transition: "width 0.5s",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related links */}
      <div className="ev-card" style={{ padding: "16px 22px", marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ fontSize: "0.82rem", color: "#5F7A9B" }}>相關連結：</span>
        <Link href={`/suppliers/${scar.supplier_id}`}>
          <button className="ev-btn ev-btn-ghost" style={{ fontSize: "0.8rem", padding: "5px 12px" }}>
            <i className="bi bi-building" /> 查看供應商
          </button>
        </Link>
        <Link href={`/evaluations/${scar.evaluation_id}`}>
          <button className="ev-btn ev-btn-ghost" style={{ fontSize: "0.8rem", padding: "5px 12px" }}>
            <i className="bi bi-clipboard2-check" /> 查看觸發評鑑
          </button>
        </Link>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="ev-btn ev-btn-secondary" onClick={() => router.push("/scar")}>← 回 SCAR 列表</button>
      </div>
    </div>
  );
}
