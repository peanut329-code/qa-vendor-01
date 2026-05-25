"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { EVALUATIONS, EVALUATION_SCORES } from "@/lib/mock-data";
import { getTierColor, getEvalStatusColor, formatDate, scoreColor } from "@/lib/utils";
import { TIER_LABELS, EVAL_STATUS_LABELS } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { printEvaluationReport, exportEvaluationToExcel } from "@/lib/export";

export default function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const ev = EVALUATIONS.find((e) => e.id === id);
  const scores = EVALUATION_SCORES[id] ?? [];

  if (!ev) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <i className="bi bi-file-earmark-x" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B" }}>找不到此評鑑紀錄</div>
        <button className="ev-btn ev-btn-ghost" style={{ marginTop: 20 }} onClick={() => router.push("/evaluations")}>← 回評鑑列表</button>
      </div>
    );
  }

  const currentStatus = (status ?? ev.status) as typeof ev.status;
  const statusC = getEvalStatusColor(currentStatus);
  const tierC = ev.tier ? getTierColor(ev.tier) : null;
  const canReview = user && ["super_admin", "admin", "manager"].includes(user.role);

  const chartData = scores.map((s) => ({
    name: s.criteria_name,
    score: s.score,
    weighted: +s.weighted_score.toFixed(2),
    fill: scoreColor(s.score),
  }));

  async function handleExcelExport() {
    setExporting(true);
    await exportEvaluationToExcel(ev!, scores);
    setExporting(false);
  }

  return (
    <div>
      {/* Breadcrumb + Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: "0.82rem", color: "#94AEC8" }}>
        <Link href="/evaluations" style={{ color: "#94AEC8", textDecoration: "none" }}>評鑑作業</Link>
        <i className="bi bi-chevron-right" style={{ fontSize: "0.7rem" }} />
        <span style={{ color: "#5B8FD9", fontWeight: 600 }}>{ev.supplier_code} — {ev.period}</span>
      </div>

      <div className="page-header">
        <div>
          <div className="page-title">{ev.supplier_name}</div>
          <div className="page-subtitle">
            {ev.supplier_code} ／ {ev.period} ／ 評鑑人：{ev.evaluator_name}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ev-btn ev-btn-ghost" onClick={() => printEvaluationReport(ev, scores)}>
            <i className="bi bi-printer" /> 列印 PDF
          </button>
          <button className="ev-btn ev-btn-secondary" onClick={handleExcelExport} disabled={exporting}>
            <i className="bi bi-file-earmark-excel" /> {exporting ? "匯出中..." : "Excel"}
          </button>
          {canReview && currentStatus === "completed" && (
            <>
              <button
                className="ev-btn ev-btn-primary"
                style={{ background: "#22C55E", borderColor: "#22C55E" }}
                onClick={() => setStatus("approved")}
              >
                <i className="bi bi-shield-check" /> 核准
              </button>
              <button
                className="ev-btn"
                style={{ background: "#EF4444", borderColor: "#EF4444", color: "white" }}
                onClick={() => setStatus("rejected")}
              >
                <i className="bi bi-x-circle" /> 退回
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status change notification */}
      {status && status !== ev.status && (
        <div
          style={{
            background: status === "approved" ? "#D1FAE5" : "#FEE2E2",
            border: `1px solid ${status === "approved" ? "#A7F3D0" : "#FECACA"}`,
            borderRadius: 8, padding: "10px 16px", marginBottom: 16,
            color: status === "approved" ? "#065F46" : "#991B1B",
            fontSize: "0.875rem", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <i className={`bi ${status === "approved" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
          評鑑已{status === "approved" ? "核准" : "退回"}（Demo 模式，重新整理後恢復）
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 8 }}>評鑑狀態</div>
          <span className={`ev-badge ${statusC.bg} ${statusC.text}`} style={{ fontSize: "0.88rem" }}>
            {EVAL_STATUS_LABELS[currentStatus]}
          </span>
        </div>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>加權總分</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#1E3A5F" }}>
            {ev.total_score?.toFixed(1) ?? "—"}
          </div>
        </div>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 8 }}>供應商等級</div>
          {tierC && ev.tier ? (
            <span className={`ev-badge ${tierC.bg} ${tierC.text}`} style={{ fontSize: "0.88rem" }}>
              <span className={`ev-badge-dot ${tierC.dot}`} />
              {TIER_LABELS[ev.tier]}
            </span>
          ) : <span style={{ color: "#C5D8F0" }}>—</span>}
        </div>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>更新時間</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E3A5F" }}>{formatDate(ev.updated_at)}</div>
          <div style={{ fontSize: "0.72rem", color: "#94AEC8", marginTop: 2 }}>建立：{formatDate(ev.created_at)}</div>
        </div>
      </div>

      {/* Chart + Score table */}
      {scores.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          {/* Bar chart */}
          <div className="ev-card" style={{ padding: "20px 24px" }}>
            <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>各項目得分</div>
            <div style={{ color: "#5F7A9B", fontSize: "0.78rem", marginBottom: 16 }}>原始分數（0–100）</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical" barSize={16} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAF1FB" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#5F7A9B" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#1E3A5F" }} axisLine={false} tickLine={false} width={72} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #C5D8F0", fontSize: 12 }}
                  formatter={(v: number) => [`${v} 分`, "得分"]}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score breakdown table */}
          <div className="ev-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAF1FB" }}>
              <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>評分明細</span>
            </div>
            <div style={{ overflowY: "auto", maxHeight: 330 }}>
              <table className="ev-table" style={{ fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>類別</th>
                    <th style={{ textAlign: "center" }}>權重</th>
                    <th style={{ textAlign: "center" }}>得分</th>
                    <th style={{ textAlign: "center" }}>加權</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s) => (
                    <tr key={s.criteria_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#1E3A5F" }}>{s.criteria_name}</div>
                        {s.notes && (
                          <div style={{ fontSize: "0.72rem", color: "#94AEC8", marginTop: 2 }}>{s.notes}</div>
                        )}
                      </td>
                      <td>
                        <span style={{ background: "#EDF3FA", color: "#5B8FD9", padding: "1px 7px", borderRadius: 4, fontSize: "0.72rem" }}>
                          {s.category}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", color: "#5F7A9B" }}>{s.weight}%</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: scoreColor(s.score), fontSize: "1rem" }}>
                          {s.score}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600, color: "#1E3A5F" }}>
                        {s.weighted_score.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: "#EDF3FA", fontWeight: 700 }}>
                    <td colSpan={4} style={{ textAlign: "right", color: "#5F7A9B" }}>合計加權分</td>
                    <td style={{ textAlign: "center", color: "#1E3A5F", fontSize: "1rem" }}>
                      {scores.reduce((a, s) => a + s.weighted_score, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="ev-card" style={{ padding: "40px 20px", textAlign: "center", marginBottom: 18 }}>
          <i className="bi bi-bar-chart-line" style={{ fontSize: "2rem", color: "#C5D8F0", display: "block", marginBottom: 8 }} />
          <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>此評鑑尚無詳細分數資料</div>
        </div>
      )}

      {/* Notes */}
      {ev.notes && (
        <div className="ev-card" style={{ padding: "18px 22px", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 10, fontSize: "0.9rem" }}>
            <i className="bi bi-chat-square-text-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
            評鑑備註
          </div>
          <div style={{ color: "#5F7A9B", lineHeight: 1.8, fontSize: "0.875rem", background: "#F7FAFF", borderRadius: 8, padding: "12px 16px", border: "1px solid #EAF1FB" }}>
            {ev.notes}
          </div>
        </div>
      )}

      {/* Footer action */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="ev-btn ev-btn-ghost" onClick={() => router.push(`/suppliers/${ev.supplier_id}`)}>
          <i className="bi bi-building" /> 查看供應商
        </button>
        <button className="ev-btn ev-btn-secondary" onClick={() => router.push("/evaluations")}>
          ← 回列表
        </button>
      </div>
    </div>
  );
}
