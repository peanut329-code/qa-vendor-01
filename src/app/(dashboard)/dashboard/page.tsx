"use client";

import { SUPPLIERS, EVALUATIONS, MONTHLY_TRENDS, TIER_DISTRIBUTION, SCARS } from "@/lib/mock-data";
import { getEvalStatusColor, getTierColor, formatDate } from "@/lib/utils";
import { TIER_LABELS, EVAL_STATUS_LABELS } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// ─── KPI data ────────────────────────────────────────────────
const STATS = {
  totalSuppliers:    SUPPLIERS.length,
  thisQuarterEvals:  EVALUATIONS.filter((e) => e.period?.includes("2025-Q1")).length,
  avgScore:          84.6,
  pendingApproval:   EVALUATIONS.filter((e) => e.status === "completed").length,
  openSCAR:          SCARS.filter((s) => s.status === "open" || s.status === "in_progress").length,
  expiringCerts:     3,
};

const SCORE_DIMS = [
  { name: "品質", weight: 40, current: 87 },
  { name: "交期", weight: 25, current: 92 },
  { name: "價格", weight: 15, current: 78 },
  { name: "服務", weight: 10, current: 85 },
  { name: "ESG",  weight: 10, current: 73 },
];

// ─── Tier stacked bar + cells ────────────────────────────────
function TierDistribution() {
  const dist = TIER_DISTRIBUTION;
  const total = dist.reduce((a, d) => a + d.count, 0) || 1;
  const colorMap: Record<string, string> = {
    "A": "#10B981", "B": "#5B8FD9", "C": "#F59E0B", "D": "#EF4444",
  };

  return (
    <div>
      {/* Stacked bar */}
      <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "var(--surface2)", marginBottom: 18 }}>
        {dist.map((d) => {
          const color = colorMap[d.tier] ?? "#5B8FD9";
          return (
            <div
              key={d.tier}
              title={`${d.tier} 級: ${d.count} 家`}
              style={{ width: `${(d.count / total) * 100}%`, background: color }}
            />
          );
        })}
      </div>
      {/* Tile cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {dist.map((d) => {
          const color = colorMap[d.tier] ?? "#5B8FD9";
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.tier} style={{
              background: `${color}15`, border: `1px solid ${color}33`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
                <span style={{ fontSize: "0.78rem", color, fontWeight: 700 }}>{d.tier} 級</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
                {d.count}
                <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontWeight: 400, marginLeft: 4 }}>
                  / {pct}%
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 4 }}>
                {d.tier === "A" ? "優選 ≥90 分"
                  : d.tier === "B" ? "合格 70-89 分"
                  : d.tier === "C" ? "觀察 50-69 分"
                  : "不合格 <50 分"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SVG monthly trend ───────────────────────────────────────
function MonthlyTrend() {
  const data = MONTHLY_TRENDS.slice(-6);
  const w = 100, h = 50;
  const scores = data.map((d) => d.avg_score);
  const minV = 60, maxV = 100;
  const norm = (v: number) => (1 - (v - minV) / (maxV - minV)) * h;
  const line = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${norm(d.avg_score).toFixed(2)}`;
  }).join(" ");
  const lastScore = scores[scores.length - 1] ?? 0;
  const firstScore = scores[0] ?? 0;
  const delta = (lastScore - firstScore).toFixed(1);
  const area = `M 0 ${h} ${data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    return `L ${x.toFixed(2)} ${norm(d.avg_score).toFixed(2)}`;
  }).join(" ")} L ${w} ${h} Z`;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "2.2rem", fontWeight: 800, color: "var(--primary)" }}>
          {lastScore.toFixed(1)}
        </span>
        <span style={{ fontSize: "0.9rem", color: "var(--success)", fontWeight: 600 }}>
          ↑ +{delta} (近 6 月)
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 140 }}>
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1={0} y1={h * p} x2={w} y2={h * p}
            stroke="#E8EEF6" strokeWidth="0.2" strokeDasharray="0.6" />
        ))}
        <path d={area} fill="rgba(91,143,217,0.15)" />
        <path d={line} fill="none" stroke="#5B8FD9" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * w;
          return <circle key={i} cx={x} cy={norm(d.avg_score)} r="1" fill="#5B8FD9" />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 6 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontFamily: "var(--font-mono)" }}>
            {d.month.slice(5)}月
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Score dimensions ─────────────────────────────────────────
function ScoreDimensions() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {SCORE_DIMS.map((d) => {
        const color = d.current >= 90 ? "var(--success)"
          : d.current >= 70 ? "var(--primary)"
          : d.current >= 50 ? "var(--warning)" : "var(--danger)";
        return (
          <div key={d.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.88rem", color: "var(--text)", fontWeight: 600 }}>
                {d.name}
                <span style={{ color: "var(--text-dim)", fontWeight: 400, marginLeft: 6, fontSize: "0.75rem" }}>
                  權重 {d.weight}%
                </span>
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.92rem", fontWeight: 700, color }}>
                {d.current}
              </span>
            </div>
            <div style={{ height: 7, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${d.current}%`, background: color, borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SCAR alerts ──────────────────────────────────────────────
function RecentSCAR() {
  const recent = SCARS.filter((s) => s.status === "open" || s.status === "in_progress").slice(0, 3);
  const tierSev = (tier: string) =>
    tier === "D" ? { sev: "critical", col: "#EF4444", label: "嚴重" }
    : tier === "C" ? { sev: "major", col: "#F59E0B", label: "重大" }
    : { sev: "minor", col: "#3B82F6", label: "輕微" };

  if (recent.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-dim)" }}>
        <i className="bi bi-check2-all" style={{ fontSize: "2rem", color: "var(--success)", display: "block", marginBottom: 8 }} />
        目前無待處理 SCAR
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {recent.map((s, idx) => {
        const { col, label: sevLabel } = tierSev(s.triggered_tier);
        const openDays = Math.ceil((Date.now() - new Date(s.created_at).getTime()) / 86400000);
        return (
          <div key={s.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 0",
            borderTop: idx === 0 ? "none" : "1px solid var(--border)",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: `${col}15`, color: col,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem",
            }}>
              <i className="bi bi-exclamation-triangle-fill" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--primary)", fontWeight: 700 }}>
                  {s.scar_number}
                </span>
                <span style={{
                  padding: "1px 7px", borderRadius: 10,
                  background: `${col}15`, color: col,
                  fontSize: "0.7rem", fontWeight: 700,
                }}>{sevLabel}</span>
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--text)", fontWeight: 500 }}>
                {s.supplier_name} · {s.issue_description.slice(0, 24)}…
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 2 }}>
                開立 {openDays} 天
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recent evaluations table ──────────────────────────────────
function RecentEvals() {
  const rows = EVALUATIONS.slice(0, 6);
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>編號</th>
          <th>供應商</th>
          <th>期間</th>
          <th>評鑑人</th>
          <th style={{ textAlign: "right" }}>分數</th>
          <th style={{ width: 80 }}>等級</th>
          <th style={{ width: 100 }}>狀態</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((e, i) => {
          const statusC = getEvalStatusColor(e.status);
          const tierC = e.tier ? getTierColor(e.tier) : null;
          return (
            <tr key={e.id} style={{ cursor: "pointer" }}>
              <td>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)", fontWeight: 700, fontSize: "0.82rem" }}>
                  EV-2026-{String(i + 1).padStart(3, "0")}
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>{e.supplier_name}</td>
              <td><span className="code-pill">{e.period}</span></td>
              <td style={{ color: "var(--text-muted)" }}>{e.evaluator_name}</td>
              <td style={{ textAlign: "right" }}>
                {e.total_score !== null
                  ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700 }}>{e.total_score.toFixed(1)}</span>
                  : <span style={{ color: "var(--text-dim)" }}>—</span>}
              </td>
              <td>
                {tierC && e.tier
                  ? <span className={`badge tier-${e.tier}`}>{e.tier}</span>
                  : <span style={{ color: "var(--text-dim)" }}>—</span>}
              </td>
              <td>
                <span className={`ev-badge ${statusC.bg} ${statusC.text}`}>
                  {EVAL_STATUS_LABELS[e.status]}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const s = STATS;

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
          歡迎回來，{user?.full_name} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: "0.9rem" }}>
          以下是今日供應商評鑑系統概況
        </p>
      </div>

      {/* 6 KPI cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(6,1fr)" }}>
        <div className="kpi-card kpi-primary">
          <div className="kpi-row">
            <span className="kpi-label-text">供應商總數</span>
            <span className="kpi-icon-sm" style={{ background: "rgba(91,143,217,0.10)", color: "var(--primary)" }}>
              <i className="bi bi-building-fill" />
            </span>
          </div>
          <div><span className="kpi-num" style={{ color: "var(--primary)" }}>{s.totalSuppliers}</span><span className="kpi-unit">家</span></div>
          <div className="kpi-sub">較上季 +2</div>
        </div>

        <div className="kpi-card kpi-success">
          <div className="kpi-row">
            <span className="kpi-label-text">本季評鑑</span>
            <span className="kpi-icon-sm" style={{ background: "rgba(16,185,129,0.10)", color: "var(--success)" }}>
              <i className="bi bi-clipboard2-check-fill" />
            </span>
          </div>
          <div><span className="kpi-num" style={{ color: "var(--success)" }}>{s.thisQuarterEvals}</span><span className="kpi-unit">件</span></div>
          <div className="kpi-sub">進行中 2 件</div>
        </div>

        <div className="kpi-card kpi-primary">
          <div className="kpi-row">
            <span className="kpi-label-text">平均評鑑分數</span>
            <span className="kpi-icon-sm" style={{ background: "rgba(91,143,217,0.10)", color: "var(--primary)" }}>
              <i className="bi bi-graph-up-arrow" />
            </span>
          </div>
          <div><span className="kpi-num" style={{ color: "var(--primary)" }}>{s.avgScore}</span></div>
          <div className="kpi-sub" style={{ color: "var(--success)" }}>↑ +3.2 較上季</div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-row">
            <span className="kpi-label-text">待審核</span>
            <span className="kpi-icon-sm" style={{ background: "rgba(245,158,11,0.10)", color: "var(--warning)" }}>
              <i className="bi bi-hourglass-split" />
            </span>
          </div>
          <div><span className="kpi-num" style={{ color: "var(--warning)" }}>{s.pendingApproval}</span><span className="kpi-unit">件</span></div>
          <div className="kpi-sub">需主管確認</div>
        </div>

        <div className="kpi-card kpi-danger">
          <div className="kpi-row">
            <span className="kpi-label-text">未結 SCAR</span>
            <span className="kpi-icon-sm" style={{ background: "rgba(239,68,68,0.10)", color: "var(--danger)" }}>
              <i className="bi bi-exclamation-triangle-fill" />
            </span>
          </div>
          <div><span className="kpi-num" style={{ color: "var(--danger)" }}>{s.openSCAR}</span><span className="kpi-unit">件</span></div>
          <div className="kpi-sub">嚴重 1 件</div>
        </div>

        <div className="kpi-card kpi-violet">
          <div className="kpi-row">
            <span className="kpi-label-text">即將到期認證</span>
            <span className="kpi-icon-sm" style={{ background: "rgba(139,92,246,0.10)", color: "var(--violet)" }}>
              <i className="bi bi-patch-check-fill" />
            </span>
          </div>
          <div><span className="kpi-num" style={{ color: "var(--violet)" }}>{s.expiringCerts}</span><span className="kpi-unit">張</span></div>
          <div className="kpi-sub">30 天內</div>
        </div>
      </div>

      {/* Row 1: Tier distribution + Monthly trend */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-header-title"><i className="bi bi-bar-chart-line-fill" /> 供應商等級分布</div>
            <div className="card-header-count">本期共 {s.totalSuppliers} 家</div>
          </div>
          <div className="card-body"><TierDistribution /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-header-title"><i className="bi bi-graph-up-arrow" /> 月度評鑑趨勢</div>
            <div className="card-header-count">近 6 月</div>
          </div>
          <div className="card-body"><MonthlyTrend /></div>
        </div>
      </div>

      {/* Row 2: Score dimensions + SCAR alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-header-title"><i className="bi bi-pie-chart-fill" /> 評鑑維度（本期平均）</div>
          </div>
          <div className="card-body"><ScoreDimensions /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-header-title">
              <i className="bi bi-exclamation-triangle-fill" style={{ color: "var(--danger)" }} /> 待處理 SCAR
            </div>
            <a href="/scar" className="text-link" style={{ fontSize: "0.85rem" }}>查看全部 →</a>
          </div>
          <div className="card-body"><RecentSCAR /></div>
        </div>
      </div>

      {/* Recent evaluations */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-title"><i className="bi bi-clipboard2-check-fill" /> 最新評鑑紀錄</div>
          <a href="/evaluations" className="text-link" style={{ fontSize: "0.85rem" }}>查看全部 →</a>
        </div>
        <div className="card-body p-0"><RecentEvals /></div>
      </div>
    </div>
  );
}
