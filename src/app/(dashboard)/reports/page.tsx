"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { SUPPLIERS, MONTHLY_TRENDS, TIER_DISTRIBUTION, CATEGORY_SCORES, EVALUATIONS } from "@/lib/mock-data";
import { getTierColor } from "@/lib/utils";
import { TIER_LABELS } from "@/types";
import type { SupplierTier } from "@/types";
import { exportSuppliersToExcel } from "@/lib/export";
import { useAuth } from "@/contexts/AuthContext";

const TOP_PERFORMERS = SUPPLIERS.filter((s) => s.tier === "A" || s.overall_score >= 85)
  .sort((a, b) => b.overall_score - a.overall_score)
  .slice(0, 5);

const NEEDS_ATTENTION = SUPPLIERS.filter((s) => s.tier === "C" || s.tier === "D")
  .sort((a, b) => a.overall_score - b.overall_score);

export default function ReportsPage() {
  const { user } = useAuth();
  const [evalList, setEvalList] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updated = EVALUATIONS.map((e) => {
        let current = { ...e };
        const savedStatus = localStorage.getItem(`eval-status-${e.id}`);
        const savedDetail = localStorage.getItem(`eval-detail-${e.id}`);
        if (savedStatus) {
          current.status = savedStatus as any;
        }
        if (savedDetail) {
          try {
            const parsed = JSON.parse(savedDetail);
            current = { ...current, ...parsed };
          } catch (err) {}
        }
        return current;
      });

      const savedCustom = localStorage.getItem("evaluations-custom");
      let custom: any[] = [];
      if (savedCustom) {
        try {
          custom = JSON.parse(savedCustom);
        } catch (e) {}
      }
      
      const merged = [...updated, ...custom];
      const ordered = merged
        .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
        .map((e, idx) => ({
          ...e,
          evl_code: `EVL-${String(idx + 1).padStart(3, "0")}`
        }));
      setEvalList(ordered);
    }
  }, []);

  const completedEvals = evalList.filter(e => e.status === "completed" || e.status === "approved");

  const avgScore = completedEvals.length > 0 
    ? +(completedEvals.reduce((sum, e) => sum + (e.total_score || 0), 0) / completedEvals.length).toFixed(1)
    : 82.6;

  const topPerformers = completedEvals.filter(e => e.tier === "A" || e.tier === "B")
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

  const needsAttention = completedEvals.filter(e => e.tier === "C" || e.tier === "D")
    .sort((a, b) => (a.total_score || 0) - (b.total_score || 0));

  const canExport = user && ["super_admin", "admin", "manager"].includes(user.role);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">報表分析</div>
          <div className="page-subtitle">供應商評鑑綜合分析與趨勢報告</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canExport && (
            <button className="ev-btn ev-btn-secondary" onClick={() => exportSuppliersToExcel(SUPPLIERS)}>
              <i className="bi bi-file-earmark-excel" /> Excel 匯出
            </button>
          )}
          <button className="ev-btn ev-btn-primary" onClick={() => window.print()}>
            <i className="bi bi-printer" /> 列印報表
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { key: "avg", label: "整體平均分數", value: avgScore.toFixed(1), icon: "bi-graph-up", color: "#5B8FD9", bg: "#EDF5FF", sub: "點擊查看計算來源" },
          { key: "top", label: "優選供應商", value: String(topPerformers.length), sub: `占 ${completedEvals.length > 0 ? ((topPerformers.length / completedEvals.length) * 100).toFixed(0) : "0"}%`, icon: "bi-star-fill", color: "#22C55E", bg: "#DCFCE7" },
          { key: "needs", label: "需要關注", value: String(needsAttention.length), sub: "C+D 級", icon: "bi-exclamation-triangle-fill", color: "#F59E0B", bg: "#FEF3C7" },
          { key: "completed", label: "本期完成評鑑", value: String(completedEvals.length), sub: `共 ${evalList.length} 件`, icon: "bi-check2-all", color: "#8B5CF6", bg: "#EDE9FE" },
        ].map((s) => (
          <div 
            key={s.label} 
            className="ev-card" 
            onClick={() => setActiveModal(s.key)}
            style={{ 
              padding: "16px 18px", 
              cursor: "pointer", 
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(91,143,217,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>{s.label}</span>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: "0.85rem" }} />
              </div>
            </div>
            <div className="score-display" style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1E3A5F" }}>
              {s.value}
            </div>
            {s.sub && <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginTop: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{s.sub}</span>
              <span style={{ fontSize: "0.68rem", color: s.color, opacity: 0.8 }}>查看 <i className="bi bi-chevron-right" /></span>
            </div>}
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Score trend */}
        <div className="ev-card" style={{ padding: "20px 24px" }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 4 }}>評鑑分數趨勢</div>
          <div style={{ color: "#5F7A9B", fontSize: "0.78rem", marginBottom: 18 }}>近 6 個月月均分走勢</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF1FB" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#5F7A9B" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis domain={[70, 95]} tick={{ fontSize: 11, fill: "#5F7A9B" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #C5D8F0", fontSize: 13 }}
                formatter={(v: number) => [`${v} 分`, "平均分數"]}
              />
              <Line
                type="monotone"
                dataKey="avg_score"
                stroke="#5B8FD9"
                strokeWidth={2.5}
                dot={{ fill: "#5B8FD9", r: 4 }}
                activeDot={{ r: 6, fill: "#3A6FBF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category scores */}
        <div className="ev-card" style={{ padding: "20px 24px" }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 4 }}>各指標平均分數</div>
          <div style={{ color: "#5F7A9B", fontSize: "0.78rem", marginBottom: 18 }}>本期各評鑑維度平均得分</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORY_SCORES} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF1FB" horizontal={false} />
              <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 11, fill: "#5F7A9B" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: "#1E3A5F" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #C5D8F0", fontSize: 13 }}
                formatter={(v: number) => [`${v} 分`, "平均分數"]}
              />
              <Bar dataKey="avg" radius={[0, 6, 6, 0]} fill="#5B8FD9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tier distribution + tables */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, marginBottom: 8 }}>
        {/* Pie chart */}
        <div className="ev-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 4 }}>等級分佈</div>
          <div style={{ color: "#5F7A9B", fontSize: "0.78rem", marginBottom: 10 }}>本期供應商等級占比</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={TIER_DISTRIBUTION} dataKey="count" cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={3}>
                {TIER_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [`${v} 家`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {TIER_DISTRIBUTION.map((item) => (
              <div key={item.tier} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, display: "inline-block" }} />
                  <span style={{ color: "#1E3A5F", fontWeight: 500 }}>{item.tier}</span>
                </div>
                <span className="score-display" style={{ color: "#5F7A9B" }}>{item.count} 家</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance tables */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top performers */}
          <div className="ev-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAF1FB" }}>
              <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>
                <i className="bi bi-trophy-fill" style={{ color: "#F59E0B", marginRight: 6 }} />
                優良供應商 TOP 5
              </span>
            </div>
            <table className="ev-table" style={{ fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 18 }}>#</th>
                  <th>供應商</th>
                  <th>分類</th>
                  <th>分數</th>
                  <th>等級</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PERFORMERS.map((s, i) => {
                  const tc = getTierColor(s.tier);
                  return (
                    <tr key={s.id}>
                      <td style={{ paddingLeft: 18 }}>
                        <span style={{ fontWeight: 700, color: i === 0 ? "#F59E0B" : i === 1 ? "#6B7280" : "#92400E", fontSize: "0.9rem" }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "#1E3A5F" }}>{s.name}</td>
                      <td>
                        <span style={{ background: "#EDF3FA", color: "#5B8FD9", padding: "1px 7px", borderRadius: 4, fontSize: "0.75rem" }}>
                          {s.category}
                        </span>
                      </td>
                      <td>
                        <span className="score-display" style={{ fontWeight: 700, color: "#1E3A5F" }}>
                          {s.overall_score.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`ev-badge ${tc.bg} ${tc.text}`}>
                          <span className={`ev-badge-dot ${tc.dot}`} />
                          {TIER_LABELS[s.tier]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Needs attention */}
          <div className="ev-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAF1FB" }}>
              <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: "#EF4444", marginRight: 6 }} />
                需要關注的供應商
              </span>
            </div>
            <table className="ev-table" style={{ fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th>供應商</th>
                  <th>分類</th>
                  <th>分數</th>
                  <th>等級</th>
                  <th>建議行動</th>
                </tr>
              </thead>
              <tbody>
                {NEEDS_ATTENTION.map((s) => {
                  const tc = getTierColor(s.tier);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: "#1E3A5F" }}>{s.name}</td>
                      <td>
                        <span style={{ background: "#EDF3FA", color: "#5B8FD9", padding: "1px 7px", borderRadius: 4, fontSize: "0.75rem" }}>
                          {s.category}
                        </span>
                      </td>
                      <td>
                        <span className="score-display" style={{ fontWeight: 700, color: s.tier === "D" ? "#EF4444" : "#F59E0B" }}>
                          {s.overall_score.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`ev-badge ${tc.bg} ${tc.text}`}>
                          <span className={`ev-badge-dot ${tc.dot}`} />
                          {TIER_LABELS[s.tier]}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: s.tier === "D" ? "#DC2626" : "#92400E",
                            fontWeight: 500,
                          }}
                        >
                          {s.tier === "D" ? "建議終止合作" : "列入觀察，排定輔導"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      {activeModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="ev-card" style={{
            width: "100%", maxWidth: 680, maxHeight: "85vh", overflowY: "auto",
            padding: 24, boxShadow: "0 10px 30px rgba(30,58,95,0.15)",
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1E3A5F", display: "flex", alignItems: "center", gap: 8 }}>
                <i className={`bi ${
                  activeModal === "avg" ? "bi-graph-up" :
                  activeModal === "top" ? "bi-star-fill" :
                  activeModal === "needs" ? "bi-exclamation-triangle-fill" : "bi-check2-all"
                }`} style={{
                  color: 
                    activeModal === "avg" ? "#5B8FD9" :
                    activeModal === "top" ? "#22C55E" :
                    activeModal === "needs" ? "#F59E0B" : "#8B5CF6"
                }} />
                {activeModal === "avg" && "整體平均分數計算來源"}
                {activeModal === "top" && "優選供應商名單 (A/B級)"}
                {activeModal === "needs" && "需要關注供應商名單 (C/D級)"}
                {activeModal === "completed" && "本期完成評鑑清單"}
              </div>
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ overflowX: "auto" }}>
              {activeModal === "avg" && (
                <div>
                  <table className="ev-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>評鑑單號</th>
                        <th>供應商名稱</th>
                        <th>評鑑期間</th>
                        <th style={{ textAlign: "right" }}>評鑑得分</th>
                        <th>評鑑等級</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedEvals.map((e) => (
                        <tr key={e.id}>
                          <td style={{ fontFamily: "monospace", color: "#5F7A9B" }}>{e.evl_code || e.id}</td>
                          <td style={{ fontWeight: 600, color: "#1E3A5F" }}>{e.supplier_name}</td>
                          <td>{e.period}</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#5B8FD9" }}>{e.total_score?.toFixed(1) ?? "—"}</td>
                          <td>
                            <span className={`ev-badge ${getTierColor(e.tier as SupplierTier).bg} ${getTierColor(e.tier as SupplierTier).text}`} style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                              {e.tier ? TIER_LABELS[e.tier as SupplierTier] : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{
                    marginTop: 16, padding: "12px 16px", background: "#EDF3FA", borderRadius: 8,
                    fontSize: "0.85rem", color: "#1E3A5F", fontWeight: 600, display: "flex", justifyContent: "space-between"
                  }}>
                    <span>平均數計算公式：</span>
                    <span>
                      總得分之和 ({completedEvals.reduce((sum, e) => sum + (e.total_score || 0), 0).toFixed(1)} 分) 
                      ÷ 評鑑件數 ({completedEvals.length} 件) 
                      = <span style={{ fontSize: "1rem", color: "#5B8FD9", fontWeight: 800 }}>{avgScore.toFixed(1)} 分</span>
                    </span>
                  </div>
                </div>
              )}

              {activeModal === "top" && (
                <table className="ev-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>供應商代碼</th>
                      <th>供應商名稱</th>
                      <th>評鑑期間</th>
                      <th style={{ textAlign: "right" }}>評鑑得分</th>
                      <th>評鑑等級</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontFamily: "monospace", color: "#5F7A9B" }}>{e.supplier_code}</td>
                        <td style={{ fontWeight: 600, color: "#1E3A5F" }}>{e.supplier_name}</td>
                        <td>{e.period}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#22C55E" }}>{e.total_score?.toFixed(1) ?? "—"}</td>
                        <td>
                          <span className={`ev-badge ${getTierColor(e.tier as SupplierTier).bg} ${getTierColor(e.tier as SupplierTier).text}`} style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                            {e.tier ? TIER_LABELS[e.tier as SupplierTier] : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeModal === "needs" && (
                <table className="ev-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>供應商代碼</th>
                      <th>供應商名稱</th>
                      <th>評鑑得分</th>
                      <th>評鑑等級</th>
                      <th>問題備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {needsAttention.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontFamily: "monospace", color: "#5F7A9B" }}>{e.supplier_code}</td>
                        <td style={{ fontWeight: 600, color: "#1E3A5F" }}>{e.supplier_name}</td>
                        <td style={{ fontWeight: 700, color: "#F59E0B" }}>{e.total_score?.toFixed(1) ?? "—"}</td>
                        <td>
                          <span className={`ev-badge ${getTierColor(e.tier as SupplierTier).bg} ${getTierColor(e.tier as SupplierTier).text}`} style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                            {e.tier ? TIER_LABELS[e.tier as SupplierTier] : "—"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.75rem", color: "#E07A5F", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.notes}>
                          {e.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeModal === "completed" && (
                <table className="ev-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>評鑑單號</th>
                      <th>供應商名稱</th>
                      <th>評鑑期間</th>
                      <th style={{ textAlign: "right" }}>總分</th>
                      <th>評鑑等級</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedEvals.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontFamily: "monospace", color: "#5F7A9B" }}>{e.evl_code || e.id}</td>
                        <td style={{ fontWeight: 600, color: "#1E3A5F" }}>{e.supplier_name}</td>
                        <td>{e.period}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#5B8FD9" }}>{e.total_score?.toFixed(1) ?? "—"}</td>
                        <td>
                          <span className={`ev-badge ${getTierColor(e.tier as SupplierTier).bg} ${getTierColor(e.tier as SupplierTier).text}`} style={{ padding: "1px 6px", fontSize: "0.7rem" }}>
                            {e.tier ? TIER_LABELS[e.tier as SupplierTier] : "—"}
                          </span>
                        </td>
                        <td>
                          <span className="ev-badge ev-badge-success" style={{ background: "#D1FAE5", color: "#065F46", padding: "1px 6px", fontSize: "0.7rem" }}>
                            已核准
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, borderTop: "1px solid #EAF1FB", paddingTop: 16 }}>
              <button type="button" className="ev-btn ev-btn-primary" onClick={() => setActiveModal(null)}>關閉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
