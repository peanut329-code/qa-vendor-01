"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SUPPLIER_RISKS, SUPPLIERS } from "@/lib/mock-data";
import { getRiskLevel, getRiskColor } from "@/lib/utils";
import { RISK_LEVEL_LABELS, TIER_LABELS } from "@/types";
import type { RiskLevel, SupplierTier } from "@/types";
import { exportRiskToExcel } from "@/lib/export";

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號無法存取此功能，請聯絡系統管理員。</div>
    </div>
  );
}

// 5×5 matrix background colors: [impact row 5→1][likelihood col 1→5]
// score = likelihood × impact
// low (<4), medium (4-8), high (9-15), critical (16-25)
function getMatrixCellColor(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return "#FCA5A5"; // critical — red
  if (score >= 9)  return "#FDE68A"; // high — amber
  if (score >= 4)  return "#BBF7D0"; // medium — green-light
  return "#DCFCE7";                  // low — green-lighter
}

function getMatrixTextColor(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return "#7F1D1D";
  if (score >= 9)  return "#78350F";
  if (score >= 4)  return "#14532D";
  return "#166534";
}

const TIER_COLORS: Record<SupplierTier, { bg: string; text: string }> = {
  A: { bg: "#D1FAE5", text: "#065F46" },
  B: { bg: "#DBEAFE", text: "#1E40AF" },
  C: { bg: "#FEF3C7", text: "#92400E" },
  D: { bg: "#FEE2E2", text: "#991B1B" },
};

const SUPPLIER_COLORS = ["#5B8FD9", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#3B82F6", "#10B981", "#EC4899", "#6366F1"];
const IMPACT_LABELS = ["", "極低", "低", "中", "高", "極高"];
const LIKELIHOOD_LABELS = ["", "極低", "低", "中", "高", "極高"];

export default function RiskPage() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"matrix" | "list">("matrix");
  const [risks, setRisks] = useState<any[]>([]);
  const [activeLevelFilter, setActiveLevelFilter] = useState<RiskLevel | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any | null>(null);
  const [newRisk, setNewRisk] = useState({
    supplier_id: "",
    likelihood: 3,
    impact: 3,
    mitigation: "",
    owner: "",
    last_reviewed: "",
    risk_factors_text: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCustom = localStorage.getItem("risks-custom");
      let custom: any[] = [];
      if (savedCustom) {
        try { custom = JSON.parse(savedCustom); } catch (e) {}
      }

      const savedDeleted = localStorage.getItem("risks-deleted");
      let deleted: string[] = [];
      if (savedDeleted) {
        try { deleted = JSON.parse(savedDeleted); } catch (e) {}
      }

      const savedEdited = localStorage.getItem("risks-edited");
      let edited: Record<string, any> = {};
      if (savedEdited) {
        try { edited = JSON.parse(savedEdited); } catch (e) {}
      }

      const all = [...SUPPLIER_RISKS, ...custom];
      const updated = all
        .filter((r) => !deleted.includes(r.supplier_id))
        .map((r) => {
          let current = { ...r };
          if (edited[r.supplier_id]) {
            current = { ...current, ...edited[r.supplier_id] };
          }
          return current;
        });
      setRisks(updated);
    }
  }, []);

  if (!user || !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
    return <AccessDenied />;
  }

  const canExport = user && ["super_admin", "admin", "manager"].includes(user.role);
  const selectedRisk = selectedId ? risks.find((r) => r.supplier_id === selectedId) : null;

  const riskCounts: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  risks.forEach((r) => {
    const lvl = r.risk_level as RiskLevel;
    if (riskCounts[lvl] !== undefined) {
      riskCounts[lvl]++;
    }
  });

  const RISK_STAT_COLORS: Record<RiskLevel, { count: string; bg: string; icon: string }> = {
    low:      { count: "#22C55E", bg: "#F0FDF4", icon: "bi-check-circle-fill" },
    medium:   { count: "#F59E0B", bg: "#FEF3C7", icon: "bi-dash-circle-fill" },
    high:     { count: "#EF4444", bg: "#FEF2F2", icon: "bi-exclamation-circle-fill" },
    critical: { count: "#DC2626", bg: "#FFF1F2", icon: "bi-x-octagon-fill" },
  };

  const filtered = risks
    .filter((r) => {
      if (activeLevelFilter && r.risk_level !== activeLevelFilter) return false;
      return true;
    });

  function openAddModal() {
    setEditingRisk(null);
    setNewRisk({
      supplier_id: SUPPLIERS.find(s => !risks.some(r => r.supplier_id === s.id))?.id || SUPPLIERS[0]?.id || "",
      likelihood: 3,
      impact: 3,
      mitigation: "",
      owner: "",
      last_reviewed: new Date().toISOString().slice(0, 10),
      risk_factors_text: "",
    });
    setShowModal(true);
  }

  function openEditModal(risk: any) {
    setEditingRisk(risk);
    setNewRisk({
      supplier_id: risk.supplier_id,
      likelihood: risk.likelihood,
      impact: risk.impact,
      mitigation: risk.mitigation || "",
      owner: risk.owner || "",
      last_reviewed: risk.last_reviewed || new Date().toISOString().slice(0, 10),
      risk_factors_text: risk.risk_factors ? risk.risk_factors.join("\n") : "",
    });
    setShowModal(true);
  }

  function handleDeleteRisk(supplierId: string) {
    if (!confirm("確定要刪除此供應商的風險評估嗎？")) return;

    if (typeof window !== "undefined") {
      const savedCustom = localStorage.getItem("risks-custom");
      let custom: any[] = [];
      if (savedCustom) {
        try { custom = JSON.parse(savedCustom); } catch (e) {}
      }

      // If it is custom created
      if (custom.some(x => x.supplier_id === supplierId)) {
        const filteredCustom = custom.filter(x => x.supplier_id !== supplierId);
        localStorage.setItem("risks-custom", JSON.stringify(filteredCustom));
      } else {
        const savedDeleted = localStorage.getItem("risks-deleted");
        let deleted: string[] = [];
        if (savedDeleted) {
          try { deleted = JSON.parse(savedDeleted); } catch (e) {}
        }
        if (!deleted.includes(supplierId)) {
          deleted.push(supplierId);
          localStorage.setItem("risks-deleted", JSON.stringify(deleted));
        }
      }
    }

    setRisks(prev => prev.filter(r => r.supplier_id !== supplierId));
    if (selectedId === supplierId) setSelectedId(null);
  }

  function handleSaveRisk(e: React.FormEvent) {
    e.preventDefault();
    const supplier = SUPPLIERS.find(s => s.id === newRisk.supplier_id);
    if (!supplier) return;

    const score = newRisk.likelihood * newRisk.impact;
    const level: RiskLevel = 
      score >= 16 ? "critical" :
      score >= 9 ? "high" :
      score >= 4 ? "medium" : "low";

    const factors = newRisk.risk_factors_text
      ? newRisk.risk_factors_text.split("\n").map(f => f.trim()).filter(Boolean)
      : ["未指定具體風險因子"];

    if (editingRisk) {
      const updated = {
        ...editingRisk,
        likelihood: newRisk.likelihood,
        impact: newRisk.impact,
        risk_score: score,
        risk_level: level,
        risk_factors: factors,
        mitigation: newRisk.mitigation,
        owner: newRisk.owner,
        last_reviewed: newRisk.last_reviewed,
      };

      if (typeof window !== "undefined") {
        const savedCustom = localStorage.getItem("risks-custom");
        let custom: any[] = [];
        if (savedCustom) {
          try { custom = JSON.parse(savedCustom); } catch (e) {}
        }

        if (custom.some(x => x.supplier_id === editingRisk.supplier_id)) {
          const idx = custom.findIndex(x => x.supplier_id === editingRisk.supplier_id);
          if (idx > -1) {
            custom[idx] = updated;
            localStorage.setItem("risks-custom", JSON.stringify(custom));
          }
        } else {
          const savedEdited = localStorage.getItem("risks-edited");
          let edited: Record<string, any> = {};
          if (savedEdited) {
            try { edited = JSON.parse(savedEdited); } catch (e) {}
          }
          edited[editingRisk.supplier_id] = updated;
          localStorage.setItem("risks-edited", JSON.stringify(edited));
        }
      }

      setRisks(prev => prev.map(r => r.supplier_id === editingRisk.supplier_id ? updated : r));
    } else {
      const added = {
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_code: supplier.code,
        category: supplier.category,
        tier: supplier.tier,
        likelihood: newRisk.likelihood,
        impact: newRisk.impact,
        risk_score: score,
        risk_level: level,
        risk_factors: factors,
        mitigation: newRisk.mitigation,
        owner: newRisk.owner,
        last_reviewed: newRisk.last_reviewed,
      };

      if (typeof window !== "undefined") {
        const savedCustom = localStorage.getItem("risks-custom");
        let custom: any[] = [];
        if (savedCustom) {
          try { custom = JSON.parse(savedCustom); } catch (e) {}
        }
        custom.push(added);
        localStorage.setItem("risks-custom", JSON.stringify(custom));
      }

      setRisks(prev => [...prev, added]);
    }

    setShowModal(false);
    setEditingRisk(null);
  }

  const calculatedScore = newRisk.likelihood * newRisk.impact;
  const calculatedLevel: RiskLevel = 
    calculatedScore >= 16 ? "critical" :
    calculatedScore >= 9 ? "high" :
    calculatedScore >= 4 ? "medium" : "low";
  const calculatedColor = getRiskColor(calculatedLevel);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">風險評估矩陣</div>
          <div className="page-subtitle">供應商採購風險視覺化分析 — 可能性 × 影響程度熱力圖</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", background: "#EDF3FA", borderRadius: 8, padding: 3, gap: 2 }}>
            {(["matrix", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "5px 14px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 600, border: "none",
                  background: view === v ? "white" : "transparent",
                  color: view === v ? "#1E3A5F" : "#5F7A9B",
                  cursor: "pointer", boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s",
                }}
              >
                <i className={`bi ${v === "matrix" ? "bi-grid-3x3-gap" : "bi-list-ul"}`} style={{ marginRight: 5 }} />
                {v === "matrix" ? "矩陣圖" : "清單"}
              </button>
            ))}
          </div>
          {canExport && (
            <button className="ev-btn ev-btn-secondary" onClick={() => exportRiskToExcel(risks)}>
              <i className="bi bi-file-earmark-excel" /> Excel 匯出
            </button>
          )}
          <button className="ev-btn ev-btn-primary" onClick={openAddModal}>
            <i className="bi bi-plus-lg" /> 新增評估
          </button>
        </div>
      </div>

      {/* Critical alert */}
      {riskCounts.critical > 0 && (
        <div style={{
          background: "#FFF1F2", border: "1px solid #FECACA", borderRadius: 10,
          padding: "12px 18px", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 10,
          color: "#7F1D1D", fontSize: "0.875rem", fontWeight: 600,
        }}>
          <i className="bi bi-x-octagon-fill" style={{ fontSize: "1.1rem", color: "#DC2626" }} />
          <span>{riskCounts.critical} 家供應商評估為緊急風險（風險分數 ≥ 16），請立即啟動風險緩解措施！</span>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {(["critical", "high", "medium", "low"] as RiskLevel[]).map((level) => {
          const cc = RISK_STAT_COLORS[level];
          const isActive = activeLevelFilter === level;
          return (
            <div 
              key={level} 
              onClick={() => setActiveLevelFilter(isActive ? null : level)}
              style={{
                background: cc.bg,
                border: isActive ? `2px solid ${cc.count}` : `1.5px solid ${cc.count}30`,
                borderRadius: 12, padding: "14px 18px",
                boxShadow: isActive ? `0 4px 12px ${cc.count}30` : "0 1px 4px rgba(91,143,217,0.06)",
                cursor: "pointer",
                transform: isActive ? "scale(1.02)" : "scale(1)",
                opacity: activeLevelFilter && !isActive ? 0.6 : 1,
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>
                  {RISK_LEVEL_LABELS[level]} {isActive && " (已選)"}
                </span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: cc.bg, border: `1px solid ${cc.count}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`bi ${cc.icon}`} style={{ color: cc.count, fontSize: "0.85rem" }} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: cc.count }}>{riskCounts[level]}</div>
            </div>
          );
        })}
      </div>

      {view === "matrix" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
          {/* Matrix */}
          <div className="ev-card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem" }}>風險熱力矩陣</div>
                <div style={{ fontSize: "0.78rem", color: "#5F7A9B", marginTop: 2 }}>縱軸：影響程度（Impact）｜橫軸：發生可能性（Likelihood）</div>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: "0.72rem" }}>
                {([
                  { label: "低風險", color: "#DCFCE7", text: "#166534" },
                  { label: "中風險", color: "#BBF7D0", text: "#14532D" },
                  { label: "高風險", color: "#FDE68A", text: "#78350F" },
                  { label: "緊急", color: "#FCA5A5", text: "#7F1D1D" },
                ]).map(({ label, color, text }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 12, height: 12, background: color, borderRadius: 3, border: `1px solid ${text}30` }} />
                    <span style={{ color: "#5F7A9B" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: "flex", gap: 0 }}>
              {/* Y-axis label */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, flexShrink: 0 }}>
                <div style={{
                  fontSize: "0.7rem", color: "#5F7A9B", fontWeight: 600, letterSpacing: "0.06em",
                  writingMode: "vertical-rl", transform: "rotate(180deg)",
                }}>
                  影響程度 (Impact) →
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {/* Y-axis ticks + rows */}
                {[5, 4, 3, 2, 1].map((impact) => (
                  <div key={impact} style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 4 }}>
                    {/* Y label */}
                    <div style={{
                      width: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end",
                      paddingRight: 10, fontSize: "0.72rem", color: "#5F7A9B", fontWeight: 600,
                    }}>
                      <span>{impact}</span>
                      <span style={{ fontSize: "0.6rem", color: "#94AEC8", marginLeft: 2 }}>{IMPACT_LABELS[impact]}</span>
                    </div>

                    {/* Cells */}
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const cellBg = getMatrixCellColor(likelihood, impact);
                      const cellText = getMatrixTextColor(likelihood, impact);
                      const score = likelihood * impact;

                      // Find suppliers at this cell
                      const suppliersHere = filtered.filter(
                        (r) => r.likelihood === likelihood && r.impact === impact
                      );

                      return (
                        <div
                          key={likelihood}
                          style={{
                            flex: 1,
                            minHeight: 90,
                            background: cellBg,
                            border: "2px solid white",
                            borderRadius: 8,
                            padding: "6px 8px",
                            position: "relative",
                            transition: "filter 0.12s",
                            cursor: suppliersHere.length > 0 ? "pointer" : "default",
                          }}
                          onClick={() => {
                            if (suppliersHere.length === 1) {
                              setSelectedId(selectedId === suppliersHere[0].supplier_id ? null : suppliersHere[0].supplier_id);
                            }
                          }}
                        >
                          {/* Score in corner */}
                          <div style={{ fontSize: "0.65rem", color: cellText, fontWeight: 700, opacity: 0.6, position: "absolute", top: 5, right: 7 }}>
                            {score}
                          </div>

                          {/* Supplier dots */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                            {suppliersHere.map((r) => {
                              const supplierIdx = risks.findIndex((s) => s.supplier_id === r.supplier_id);
                              const color = supplierIdx >= 0 ? SUPPLIER_COLORS[supplierIdx % SUPPLIER_COLORS.length] : "#8B5CF6";
                              const isSelected = selectedId === r.supplier_id;
                              return (
                                <div
                                  key={r.supplier_id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : r.supplier_id); }}
                                  style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    background: isSelected ? "white" : "rgba(255,255,255,0.75)",
                                    borderRadius: 6, padding: "3px 6px",
                                    cursor: "pointer",
                                    border: isSelected ? `2px solid ${color}` : "2px solid transparent",
                                    boxShadow: isSelected ? `0 2px 8px ${color}40` : "none",
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <div style={{
                                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                                    background: color,
                                    boxShadow: `0 0 0 2px ${color}40`,
                                  }} />
                                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#1E3A5F", whiteSpace: "nowrap" }}>
                                    {r.supplier_code}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* X-axis */}
                <div style={{ display: "flex", marginTop: 4, paddingLeft: 56 }}>
                  {[1, 2, 3, 4, 5].map((l) => (
                    <div key={l} style={{ flex: 1, textAlign: "center", fontSize: "0.68rem", color: "#5F7A9B", fontWeight: 600 }}>
                      <div>{l}</div>
                      <div style={{ fontSize: "0.58rem", color: "#94AEC8" }}>{LIKELIHOOD_LABELS[l]}</div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center", fontSize: "0.7rem", color: "#5F7A9B", marginTop: 4, fontWeight: 600, letterSpacing: "0.04em" }}>
                  發生可能性 (Likelihood) →
                </div>
              </div>
            </div>

            {/* Supplier legend */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #EAF1FB" }}>
              <div style={{ fontSize: "0.75rem", color: "#5F7A9B", fontWeight: 600, marginBottom: 10 }}>供應商圖例</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {filtered.map((r) => {
                  const rc = getRiskColor(r.risk_level);
                  const isSelected = selectedId === r.supplier_id;
                  const supplierIdx = risks.findIndex((s) => s.supplier_id === r.supplier_id);
                  const color = supplierIdx >= 0 ? SUPPLIER_COLORS[supplierIdx % SUPPLIER_COLORS.length] : "#8B5CF6";
                  return (
                    <div
                      key={r.supplier_id}
                      onClick={() => setSelectedId(isSelected ? null : r.supplier_id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "6px 12px", borderRadius: 8,
                        background: isSelected ? "#EDF3FA" : "#F7FAFF",
                        border: `1.5px solid ${isSelected ? color : "#E0EBF8"}`,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 12, height: 12, borderRadius: "50%",
                        background: color,
                        boxShadow: `0 0 0 3px ${color}30`,
                        flexShrink: 0,
                      }} />
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F" }}>{r.supplier_code}</div>
                        <div style={{ fontSize: "0.65rem", color: "#5F7A9B" }}>
                          {r.supplier_name.replace(/股份有限公司|有限公司/, "")}
                        </div>
                      </div>
                      <div style={{
                        fontSize: "0.65rem", fontWeight: 700,
                        padding: "2px 6px", borderRadius: 5,
                        background: rc.cell, color: rc.text,
                      }}>
                        {RISK_LEVEL_LABELS[r.risk_level as RiskLevel]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div style={{ width: 300 }}>
            {selectedRisk ? (
              <div className="ev-card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Panel header */}
                <div style={{
                  background: getRiskColor(selectedRisk.risk_level).cell,
                  padding: "16px 18px",
                  borderBottom: "1px solid #EAF1FB",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem", marginBottom: 4 }}>
                        {selectedRisk.supplier_name.replace(/股份有限公司|有限公司/, "")}
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#5F7A9B" }}>{selectedRisk.supplier_code}</div>
                    </div>
                    <button
                      onClick={() => setSelectedId(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#94AEC8", padding: 4 }}
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                  {/* Score display */}
                  <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
                    <div style={{
                      background: "white", borderRadius: 10, padding: "10px 16px", flex: 1, textAlign: "center",
                      border: `2px solid ${getRiskColor(selectedRisk.risk_level).border}`,
                    }}>
                      <div style={{ fontSize: "0.65rem", color: "#5F7A9B", marginBottom: 2 }}>風險分數</div>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: getRiskColor(selectedRisk.risk_level).text, lineHeight: 1 }}>
                        {selectedRisk.risk_score}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: getRiskColor(selectedRisk.risk_level).text, marginTop: 2, fontWeight: 600 }}>
                        {RISK_LEVEL_LABELS[selectedRisk.risk_level as RiskLevel]}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ background: "white", borderRadius: 8, padding: "6px 12px", textAlign: "center", border: "1px solid #EAF1FB" }}>
                        <div style={{ fontSize: "0.6rem", color: "#5F7A9B" }}>可能性</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F" }}>{selectedRisk.likelihood}</div>
                        <div style={{ fontSize: "0.6rem", color: "#5F7A9B" }}>{LIKELIHOOD_LABELS[selectedRisk.likelihood]}</div>
                      </div>
                      <div style={{ background: "white", borderRadius: 8, padding: "6px 12px", textAlign: "center", border: "1px solid #EAF1FB" }}>
                        <div style={{ fontSize: "0.6rem", color: "#5F7A9B" }}>影響度</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F" }}>{selectedRisk.impact}</div>
                        <div style={{ fontSize: "0.6rem", color: "#5F7A9B" }}>{IMPACT_LABELS[selectedRisk.impact]}</div>
                      </div>
                    </div>
                  </div>
                  {/* Badges */}
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <span style={{
                      background: selectedRisk.tier ? TIER_COLORS[selectedRisk.tier as SupplierTier]?.bg || "#EAF1FB" : "#EAF1FB",
                      color: selectedRisk.tier ? TIER_COLORS[selectedRisk.tier as SupplierTier]?.text || "#5F7A9B" : "#5F7A9B",
                      padding: "2px 8px", borderRadius: 5, fontSize: "0.72rem", fontWeight: 700,
                    }}>
                      {selectedRisk.tier ? TIER_LABELS[selectedRisk.tier as SupplierTier] : "—"}
                    </span>
                    <span style={{ background: "#EDF3FA", color: "#5B8FD9", padding: "2px 8px", borderRadius: 5, fontSize: "0.72rem", fontWeight: 600 }}>
                      {selectedRisk.category}
                    </span>
                  </div>
                </div>

                {/* Risk factors */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAF1FB" }}>
                  <div style={{ fontSize: "0.72rem", color: "#EF4444", fontWeight: 700, marginBottom: 8 }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 5 }} />
                    主要風險因子
                  </div>
                  {selectedRisk.risk_factors.map((f: string, i: number) => (
                    <div key={i} style={{
                      display: "flex", gap: 8, marginBottom: 6,
                      fontSize: "0.78rem", color: "#5F7A9B", lineHeight: 1.5,
                    }}>
                      <span style={{ color: "#EF4444", fontWeight: 700, flexShrink: 0 }}>•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Mitigation */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAF1FB" }}>
                  <div style={{ fontSize: "0.72rem", color: "#22C55E", fontWeight: 700, marginBottom: 8 }}>
                    <i className="bi bi-shield-check" style={{ marginRight: 5 }} />
                    緩解措施
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#5F7A9B", lineHeight: 1.6 }}>
                    {selectedRisk.mitigation}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ padding: "12px 18px", background: "#FAFCFF" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                    <div>
                      <div style={{ color: "#94AEC8", marginBottom: 2 }}>負責人</div>
                      <div style={{ color: "#1E3A5F", fontWeight: 600 }}>{selectedRisk.owner}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#94AEC8", marginBottom: 2 }}>最後複評</div>
                      <div style={{ color: "#1E3A5F", fontFamily: "monospace" }}>{selectedRisk.last_reviewed}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "12px 18px", borderTop: "1px solid #EAF1FB", display: "flex", gap: 10, justifyContent: "flex-end", background: "#FAFCFF" }}>
                  <button className="ev-btn ev-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => openEditModal(selectedRisk)}>
                    <i className="bi bi-pencil-fill" /> 編輯
                  </button>
                  <button className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem", color: "#EF4444" }} onClick={() => handleDeleteRisk(selectedRisk.supplier_id)}>
                    <i className="bi bi-trash-fill" /> 刪除
                  </button>
                </div>
              </div>
            ) : (
              <div className="ev-card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <i className="bi bi-cursor-fill" style={{ fontSize: "2rem", color: "#C5D8F0", display: "block", marginBottom: 10 }} />
                <div style={{ color: "#5F7A9B", fontSize: "0.85rem", fontWeight: 600 }}>點選矩陣中的供應商</div>
                <div style={{ color: "#94AEC8", fontSize: "0.75rem", marginTop: 4 }}>即可查看詳細風險分析</div>
              </div>
            )}

            {/* Score guide */}
            <div className="ev-card" style={{ marginTop: 16, padding: 16 }}>
              <div style={{ fontSize: "0.72rem", color: "#5F7A9B", fontWeight: 700, marginBottom: 10 }}>風險評分說明</div>
              <div style={{ fontSize: "0.72rem", color: "#5F7A9B", lineHeight: 1.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4, borderBottom: "1px solid #EAF1FB", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "#94AEC8" }}>分數區間</span>
                  <span style={{ fontWeight: 600, color: "#94AEC8" }}>等級</span>
                </div>
                {([
                  { range: "1 – 3",   level: "low",      label: "低風險" },
                  { range: "4 – 8",   level: "medium",   label: "中風險" },
                  { range: "9 – 15",  level: "high",     label: "高風險" },
                  { range: "16 – 25", level: "critical", label: "緊急風險" },
                ] as { range: string; level: RiskLevel; label: string }[]).map(({ range, level, label }) => {
                  const rc = getRiskColor(level);
                  return (
                    <div key={level} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: "monospace" }}>{range}</span>
                      <span style={{
                        background: rc.cell, color: rc.text,
                        padding: "1px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700,
                      }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 8, color: "#94AEC8", fontSize: "0.68rem", lineHeight: 1.6 }}>
                  風險分數 = 發生可能性（1–5）× 影響程度（1–5）
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List view */
        <div className="ev-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ev-table">
              <thead>
                <tr>
                  <th>供應商</th>
                  <th>類別</th>
                  <th style={{ textAlign: "center" }}>評鑑等級</th>
                  <th style={{ textAlign: "center" }}>可能性</th>
                  <th style={{ textAlign: "center" }}>影響程度</th>
                  <th style={{ textAlign: "center" }}>風險分數</th>
                  <th>風險等級</th>
                  <th>負責人</th>
                  <th>緩解措施</th>
                  <th style={{ textAlign: "center" }}>最後複評</th>
                  <th style={{ textAlign: "center" }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice().sort((a, b) => b.risk_score - a.risk_score).map((r) => {
                  const rc = getRiskColor(r.risk_level);
                  const tc = TIER_COLORS[r.tier as SupplierTier];
                  const supplierIdx = risks.findIndex((s) => s.supplier_id === r.supplier_id);
                  const color = supplierIdx >= 0 ? SUPPLIER_COLORS[supplierIdx % SUPPLIER_COLORS.length] : "#8B5CF6";
                  return (
                    <tr
                      key={r.supplier_id}
                      style={{ cursor: "pointer" }}
                      onClick={() => { setSelectedId(r.supplier_id); setView("matrix"); }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem" }}>
                          {r.supplier_name}
                        </div>
                        <div style={{ color: "#94AEC8", fontSize: "0.75rem", fontFamily: "monospace" }}>
                          {r.supplier_code}
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "#EDF3FA", color: "#5B8FD9", padding: "3px 9px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600 }}>
                          {r.category}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ background: tc?.bg || "#EAF1FB", color: tc?.text || "#5F7A9B", padding: "2px 10px", borderRadius: 5, fontSize: "0.78rem", fontWeight: 700 }}>
                          {r.tier ? TIER_LABELS[r.tier as SupplierTier] : "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#1E3A5F", fontSize: "1rem" }}>
                        {r.likelihood}
                        <div style={{ fontSize: "0.65rem", color: "#94AEC8", fontWeight: 400 }}>{LIKELIHOOD_LABELS[r.likelihood]}</div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#1E3A5F", fontSize: "1rem" }}>
                        {r.impact}
                        <div style={{ fontSize: "0.65rem", color: "#94AEC8", fontWeight: 400 }}>{IMPACT_LABELS[r.impact]}</div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 40, height: 40, borderRadius: "50%",
                          background: rc.cell, color: rc.text,
                          fontSize: "1.1rem", fontWeight: 800,
                          border: `2px solid ${rc.border}`,
                        }}>
                          {r.risk_score}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: rc.cell, color: rc.text,
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: "0.78rem", fontWeight: 700,
                          border: `1px solid ${rc.border}40`,
                        }}>
                          {RISK_LEVEL_LABELS[r.risk_level as RiskLevel]}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "#5F7A9B" }}>{r.owner}</td>
                      <td style={{ maxWidth: 220, fontSize: "0.75rem", color: "#5F7A9B" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.mitigation}>
                          {r.mitigation}
                        </div>
                      </td>
                      <td style={{ textAlign: "center", fontFamily: "monospace", fontSize: "0.78rem", color: "#5F7A9B" }}>
                        {r.last_reviewed}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
                          <button 
                            className="ev-btn ev-btn-ghost" 
                            style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#5B8FD9" }}
                            onClick={(e) => { e.stopPropagation(); openEditModal(r); }}
                            title="編輯"
                          >
                            <i className="bi bi-pencil-fill" />
                          </button>
                          <button 
                            className="ev-btn ev-btn-ghost" 
                            style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#EF4444" }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteRisk(r.supplier_id); }}
                            title="刪除"
                          >
                            <i className="bi bi-trash-fill" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="ev-card" style={{
            width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto",
            padding: 24, boxShadow: "0 10px 30px rgba(30,58,95,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F" }}>
                {editingRisk ? "編輯風險評估" : "新增風險評估"}
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveRisk}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商 *</label>
                  {editingRisk ? (
                    <div style={{ padding: "8px 12px", background: "#EDF3FA", borderRadius: 6, fontWeight: 700, color: "#1E3A5F" }}>
                      {editingRisk.supplier_name} ({editingRisk.supplier_code})
                    </div>
                  ) : (
                    <select 
                      className="ev-select" style={{ width: "100%" }}
                      value={newRisk.supplier_id} onChange={(e) => setNewRisk({...newRisk, supplier_id: e.target.value})}
                    >
                      {SUPPLIERS.map((s) => (
                        <option key={s.id} value={s.id}>{s.code}　{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>發生可能性 (Likelihood) *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }}
                    value={newRisk.likelihood} onChange={(e) => setNewRisk({...newRisk, likelihood: Number(e.target.value)})}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num} - {LIKELIHOOD_LABELS[num]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>影響程度 (Impact) *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }}
                    value={newRisk.impact} onChange={(e) => setNewRisk({...newRisk, impact: Number(e.target.value)})}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num} - {IMPACT_LABELS[num]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>負責人 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} required
                    value={newRisk.owner} onChange={(e) => setNewRisk({...newRisk, owner: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>最後複評日期 *</label>
                  <input 
                    type="date" className="ev-input" style={{ width: "100%" }} required
                    value={newRisk.last_reviewed} onChange={(e) => setNewRisk({...newRisk, last_reviewed: e.target.value})}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>風險因素 (每行代表一個因子) *</label>
                  <textarea 
                    className="ev-input" style={{ width: "100%", height: 70, resize: "none", fontFamily: "inherit" }} required
                    placeholder="請輸入風險因子，例如：&#10;供料高度集中：300 mm 晶圓單一來源&#10;地緣政治停產風險"
                    value={newRisk.risk_factors_text} onChange={(e) => setNewRisk({...newRisk, risk_factors_text: e.target.value})}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>緩解措施 *</label>
                  <textarea 
                    className="ev-input" style={{ width: "100%", height: 60, resize: "none", fontFamily: "inherit" }} required
                    value={newRisk.mitigation} onChange={(e) => setNewRisk({...newRisk, mitigation: e.target.value})}
                  />
                </div>
              </div>

              {/* 動態計算區塊 */}
              <div style={{
                background: "#EDF3FA", borderRadius: 8, padding: "12px 16px", marginBottom: 18,
                display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem"
              }}>
                <span style={{ fontWeight: 600, color: "#1E3A5F" }}>自動風險計算：</span>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span>分數：<strong style={{ fontSize: "1.1rem", color: "#1E3A5F" }}>{newRisk.likelihood * newRisk.impact}</strong> 分</span>
                  <span>
                    等級：
                    <span className="ev-badge" style={{
                      background: getRiskColor(calculatedLevel).cell, color: getRiskColor(calculatedLevel).text,
                      padding: "3px 10px", borderRadius: 6, fontWeight: 700, border: `1px solid ${getRiskColor(calculatedLevel).border}40`
                    }}>
                      {RISK_LEVEL_LABELS[calculatedLevel]}
                    </span>
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #EAF1FB", paddingTop: 16 }}>
                <button type="button" className="ev-btn ev-btn-ghost" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="ev-btn ev-btn-primary">確認儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
