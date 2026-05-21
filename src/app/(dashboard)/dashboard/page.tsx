"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SUPPLIERS, EVALUATIONS, MONTHLY_TRENDS, TIER_DISTRIBUTION } from "@/lib/mock-data";
import { getTierColor, getEvalStatusColor, formatDate } from "@/lib/utils";
import { TIER_LABELS, EVAL_STATUS_LABELS } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const KPI_CARDS = [
  {
    title: "供應商總數",
    value: 10,
    sub: "較上季 +2",
    icon: "bi-building-fill",
    color: "#5B8FD9",
    bgClass: "kpi-blue",
  },
  {
    title: "本季評鑑數",
    value: 6,
    sub: "進行中 2 件",
    icon: "bi-clipboard2-check-fill",
    color: "#22C55E",
    bgClass: "kpi-green",
  },
  {
    title: "平均評鑑分數",
    value: "84.6",
    sub: "較上季 ↑ 3.2 分",
    icon: "bi-graph-up-arrow",
    color: "#F59E0B",
    bgClass: "kpi-orange",
  },
  {
    title: "待審核件數",
    value: 1,
    sub: "需要主管確認",
    icon: "bi-hourglass-split",
    color: "#8B5CF6",
    bgClass: "kpi-purple",
  },
];

const RECENT_EVALS = EVALUATIONS.slice(0, 6);

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
          歡迎回來，{user?.full_name} 👋
        </h2>
        <p style={{ color: "#5F7A9B", margin: "4px 0 0", fontSize: "0.875rem" }}>
          以下是今日供應商評鑑系統概況
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {KPI_CARDS.map((card) => (
          <div key={card.title} className="ev-card" style={{ overflow: "hidden" }}>
            <div className={card.bgClass} style={{ padding: "18px 20px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.78rem", fontWeight: 500, marginBottom: 6 }}>
                    {card.title}
                  </div>
                  <div
                    className="score-display"
                    style={{ color: "white", fontSize: "2rem", fontWeight: 800, lineHeight: 1, textShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
                  >
                    {card.value}
                  </div>
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className={`bi ${card.icon}`} style={{ color: "white", fontSize: "1.1rem" }} />
                </div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.74rem", marginTop: 10 }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, marginBottom: 24 }}>
        {/* Monthly trend chart */}
        <div className="ev-card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem" }}>月度評鑑趨勢</div>
              <div style={{ color: "#5F7A9B", fontSize: "0.78rem" }}>近 6 個月平均分數</div>
            </div>
            <span
              className="ev-badge"
              style={{ background: "#EDF3FA", color: "#5B8FD9", border: "1px solid #C5D8F0", fontSize: "0.72rem" }}
            >
              <i className="bi bi-calendar3" /> 2024.09 — 2025.02
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_TRENDS} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF1FB" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#5F7A9B" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fontSize: 11, fill: "#5F7A9B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #C5D8F0", boxShadow: "0 4px 12px rgba(91,143,217,0.15)", fontSize: 13 }}
                formatter={(v: number) => [`${v} 分`, "平均分數"]}
              />
              <Bar dataKey="avg_score" radius={[6, 6, 0, 0]}>
                {MONTHLY_TRENDS.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={i === MONTHLY_TRENDS.length - 1 ? "#5B8FD9" : "#B8D4F5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier distribution */}
        <div className="ev-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 4 }}>
            供應商等級分佈
          </div>
          <div style={{ color: "#5F7A9B", fontSize: "0.78rem", marginBottom: 18 }}>
            本期共 {SUPPLIERS.length} 家供應商
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TIER_DISTRIBUTION.map((item) => {
              const pct = Math.round((item.count / SUPPLIERS.length) * 100);
              return (
                <div key={item.tier}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.82rem" }}>
                    <span style={{ color: "#1E3A5F", fontWeight: 500 }}>{item.tier}</span>
                    <span style={{ color: "#5F7A9B", fontFamily: "monospace" }}>
                      {item.count} 家 ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#EDF3FA", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: item.color,
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20 }}>
            {[
              { tier: "A" as const, label: "優選 ≥90分" },
              { tier: "B" as const, label: "合格 70-89分" },
              { tier: "C" as const, label: "觀察 50-69分" },
              { tier: "D" as const, label: "不合格 <50分" },
            ].map(({ tier, label }) => {
              const c = getTierColor(tier);
              return (
                <div key={tier} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#5F7A9B" }}>
                  <span className={`ev-badge-dot ${c.dot}`} />
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent evaluations */}
      <div className="ev-card" style={{ marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #EAF1FB",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem" }}>最新評鑑紀錄</div>
            <div style={{ color: "#5F7A9B", fontSize: "0.78rem" }}>最近 6 筆評鑑作業</div>
          </div>
          <a href="/evaluations" className="ev-btn ev-btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
            查看全部 <i className="bi bi-arrow-right" />
          </a>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>供應商</th>
                <th>評鑑期間</th>
                <th>評鑑人員</th>
                <th>分數</th>
                <th>等級</th>
                <th>狀態</th>
                <th>更新日期</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_EVALS.map((ev) => {
                const statusC = getEvalStatusColor(ev.status);
                const tierC = ev.tier ? getTierColor(ev.tier) : null;
                return (
                  <tr key={ev.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.85rem" }}>{ev.supplier_name}</div>
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
                        <span className="score-display" style={{ fontSize: "1rem", color: "#1E3A5F" }}>
                          {ev.total_score.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: "#94AEC8", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td>
                      {tierC && ev.tier ? (
                        <span className={`ev-badge ${tierC.bg} ${tierC.text}`}>
                          <span className={`ev-badge-dot ${tierC.dot}`} />
                          {TIER_LABELS[ev.tier]}
                        </span>
                      ) : (
                        <span style={{ color: "#94AEC8", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`ev-badge ${statusC.bg} ${statusC.text}`}>
                        {EVAL_STATUS_LABELS[ev.status]}
                      </span>
                    </td>
                    <td style={{ color: "#5F7A9B", fontSize: "0.82rem", fontFamily: "monospace" }}>
                      {formatDate(ev.updated_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
