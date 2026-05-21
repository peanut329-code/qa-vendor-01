"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { SUPPLIERS, MONTHLY_TRENDS, TIER_DISTRIBUTION, CATEGORY_SCORES } from "@/lib/mock-data";
import { getTierColor } from "@/lib/utils";
import { TIER_LABELS } from "@/types";
import type { SupplierTier } from "@/types";

const TOP_PERFORMERS = SUPPLIERS.filter((s) => s.tier === "A" || s.overall_score >= 85)
  .sort((a, b) => b.overall_score - a.overall_score)
  .slice(0, 5);

const NEEDS_ATTENTION = SUPPLIERS.filter((s) => s.tier === "C" || s.tier === "D")
  .sort((a, b) => a.overall_score - b.overall_score);

export default function ReportsPage() {
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">報表分析</div>
          <div className="page-subtitle">供應商評鑑綜合分析與趨勢報告</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ev-btn ev-btn-secondary">
            <i className="bi bi-funnel" /> 篩選期間
          </button>
          <button className="ev-btn ev-btn-primary">
            <i className="bi bi-download" /> 匯出報表
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "整體平均分數", value: "82.6", icon: "bi-graph-up", color: "#5B8FD9", bg: "#EDF5FF" },
          { label: "優選供應商", value: "3", sub: "占 30%", icon: "bi-star-fill", color: "#22C55E", bg: "#DCFCE7" },
          { label: "需要關注", value: "3", sub: "C+D 級", icon: "bi-exclamation-triangle-fill", color: "#F59E0B", bg: "#FEF3C7" },
          { label: "本期完成評鑑", value: "8", sub: "共 10 件", icon: "bi-check2-all", color: "#8B5CF6", bg: "#EDE9FE" },
        ].map((s) => (
          <div key={s.label} className="ev-card" style={{ padding: "16px 18px" }}>
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
            {s.sub && <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginTop: 2 }}>{s.sub}</div>}
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
      </div>
    </div>
  );
}
