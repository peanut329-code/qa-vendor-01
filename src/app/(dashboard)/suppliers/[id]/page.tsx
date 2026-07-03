"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { SUPPLIERS, EVALUATIONS, SCARS } from "@/lib/mock-data";
import { getTierColor, getEvalStatusColor, getSupplierStatusColor, getScarStatusColor, formatDate, scoreColor } from "@/lib/utils";
import { TIER_LABELS, EVAL_STATUS_LABELS, STATUS_LABELS, SCAR_STATUS_LABELS } from "@/types";
import type { Supplier, EvaluationStatus, SupplierTier } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { exportSuppliersToExcel } from "@/lib/export";

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierEvals, setSupplierEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("suppliers-custom");
      let custom: any[] = [];
      if (saved) {
        try {
          custom = JSON.parse(saved);
        } catch (e) {}
      }
      const all = [...SUPPLIERS, ...custom];
      const found = all.find((s) => s.id === id);
      setSupplier(found || null);

      // 載入評鑑 (包含 evaluations-custom)，並同步狀態與分數
      const savedCustomEvals = localStorage.getItem("evaluations-custom");
      let customEvals: any[] = [];
      if (savedCustomEvals) {
        try {
          customEvals = JSON.parse(savedCustomEvals);
        } catch (e) {}
      }
      const allEvals = [...EVALUATIONS, ...customEvals];
      const filteredEvals = allEvals.filter((e) => e.supplier_id === id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));

      filteredEvals.forEach((e) => {
        const savedStatus = localStorage.getItem(`eval-status-${e.id}`);
        const savedDetail = localStorage.getItem(`eval-detail-${e.id}`);
        if (savedStatus && e.status !== savedStatus) {
          e.status = savedStatus as any;
        }
        if (savedDetail) {
          try {
            const parsed = JSON.parse(savedDetail);
            if (parsed.total_score !== e.total_score || parsed.tier !== e.tier) {
              e.total_score = parsed.total_score;
              e.tier = parsed.tier;
              e.updated_at = parsed.updated_at;
            }
          } catch (err) {}
        }
      });

      setSupplierEvals(filteredEvals);
      setLoading(false);
    }
  }, [id]);

  const supplierScars = SCARS.filter((sc) => sc.supplier_id === id);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#5F7A9B" }}>
        載入中...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <i className="bi bi-building-x" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B" }}>找不到此供應商</div>
        <button className="ev-btn ev-btn-ghost" style={{ marginTop: 20 }} onClick={() => router.push("/suppliers")}>← 回供應商列表</button>
      </div>
    );
  }

  const tierC = getTierColor(supplier.tier);
  const statusC = getSupplierStatusColor(supplier.status);
  const canEdit = user && ["super_admin", "admin"].includes(user.role ?? "");

  // Score history for chart (approved evaluations only, sorted by period)
  const scoreHistory = supplierEvals
    .filter((e) => e.total_score !== null)
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((e) => ({ period: e.period, score: e.total_score as number, tier: e.tier }));

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: "0.82rem", color: "#94AEC8" }}>
        <Link href="/suppliers" style={{ color: "#94AEC8", textDecoration: "none" }}>供應商管理</Link>
        <i className="bi bi-chevron-right" style={{ fontSize: "0.7rem" }} />
        <span style={{ color: "#5B8FD9", fontWeight: 600 }}>{supplier.code}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div className="page-title">{supplier.name}</div>
            <span className={`ev-badge ${tierC.bg} ${tierC.text}`}>
              <span className={`ev-badge-dot ${tierC.dot}`} />
              {TIER_LABELS[supplier.tier]}
            </span>
            <span className={`ev-badge ${statusC.bg} ${statusC.text}`}>
              {STATUS_LABELS[supplier.status]}
            </span>
          </div>
          <div className="page-subtitle">{supplier.code} ／ {supplier.category} ／ 建立：{formatDate(supplier.created_at)}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="ev-btn ev-btn-ghost"
            onClick={() => exportSuppliersToExcel([supplier])}
          >
            <i className="bi bi-download" /> 匯出
          </button>
          {canEdit && (
            <button className="ev-btn ev-btn-secondary">
              <i className="bi bi-pencil" /> 編輯
            </button>
          )}
          <Link href={`/evaluations/new?supplier=${supplier.id}`}>
            <button className="ev-btn ev-btn-primary">
              <i className="bi bi-plus-lg" /> 新增評鑑
            </button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>最新評鑑分數</div>
          <div
            style={{
              fontSize: "2.2rem", fontWeight: 800,
              color: scoreColor(supplier.overall_score),
            }}
          >
            {supplier.overall_score.toFixed(1)}
          </div>
        </div>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 8 }}>供應商等級</div>
          <span className={`ev-badge ${tierC.bg} ${tierC.text}`} style={{ fontSize: "0.9rem" }}>
            <span className={`ev-badge-dot ${tierC.dot}`} />
            {TIER_LABELS[supplier.tier]}
          </span>
        </div>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>歷次評鑑次數</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1E3A5F" }}>
            {supplierEvals.length}
          </div>
        </div>
        <div className="ev-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>SCAR 件數</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: supplierScars.length > 0 ? "#F59E0B" : "#1E3A5F" }}>
            {supplierScars.length}
          </div>
        </div>
      </div>

      {/* Info card + Score chart */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, marginBottom: 18 }}>
        {/* Supplier info */}
        <div className="ev-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 14, fontSize: "0.9rem" }}>
            <i className="bi bi-building-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
            供應商資訊
          </div>
          {[
            { icon: "bi-tag-fill", label: "供應商代碼", value: supplier.code },
            { icon: "bi-grid-1x2-fill", label: "採購分類", value: supplier.category },
            { icon: "bi-person-fill", label: "主要聯絡人", value: supplier.contact_name },
            { icon: "bi-envelope-fill", label: "電子郵件", value: supplier.contact_email },
            { icon: "bi-telephone-fill", label: "聯絡電話", value: supplier.contact_phone },
            { icon: "bi-geo-alt-fill", label: "公司地址", value: supplier.address },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <i
                className={`bi ${icon}`}
                style={{ color: "#5B8FD9", fontSize: "0.85rem", marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: "0.7rem", color: "#94AEC8" }}>{label}</div>
                <div style={{ fontSize: "0.85rem", color: "#1E3A5F", fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Score history chart */}
        <div className="ev-card" style={{ padding: "20px 24px" }}>
          <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 4, fontSize: "0.9rem" }}>
            <i className="bi bi-graph-up" style={{ color: "#5B8FD9", marginRight: 8 }} />
            評鑑分數歷史趨勢
          </div>
          <div style={{ color: "#5F7A9B", fontSize: "0.78rem", marginBottom: 16 }}>歷次評鑑加權總分走勢</div>
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreHistory} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAF1FB" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#5F7A9B" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#5F7A9B" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #C5D8F0", fontSize: 12 }}
                  formatter={(v: number) => [`${v.toFixed(1)} 分`, "加權總分"]}
                />
                <ReferenceLine y={90} stroke="#22C55E" strokeDasharray="4 3" label={{ value: "A", fill: "#22C55E", fontSize: 11 }} />
                <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 3" label={{ value: "B/C", fill: "#F59E0B", fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#5B8FD9"
                  strokeWidth={2.5}
                  dot={{ fill: "#5B8FD9", r: 5, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94AEC8", fontSize: "0.875rem" }}>
              <i className="bi bi-graph-up" style={{ fontSize: "2rem", display: "block", marginBottom: 8, color: "#C5D8F0" }} />
              尚無評鑑分數記錄
            </div>
          )}
        </div>
      </div>

      {/* Evaluations history */}
      <div className="ev-card" style={{ overflow: "hidden", marginBottom: 18 }}>
        <div
          style={{
            padding: "14px 18px", borderBottom: "1px solid #EAF1FB",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>
            <i className="bi bi-clipboard2-check-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
            評鑑紀錄
          </span>
          <Link href={`/evaluations/new?supplier=${supplier.id}`}>
            <button className="ev-btn ev-btn-ghost" style={{ fontSize: "0.78rem", padding: "4px 12px" }}>
              <i className="bi bi-plus-lg" /> 新增評鑑
            </button>
          </Link>
        </div>
        {supplierEvals.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="ev-table">
              <thead>
                <tr>
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
                {supplierEvals.map((ev) => {
                  const sc = getEvalStatusColor(ev.status as EvaluationStatus);
                  const tc = ev.tier ? getTierColor(ev.tier as SupplierTier) : null;
                  return (
                    <tr key={ev.id}>
                      <td>
                        <span
                          style={{
                            background: "#EDF3FA", color: "#5B8FD9",
                            padding: "2px 8px", borderRadius: 4,
                            fontSize: "0.78rem", fontWeight: 600, fontFamily: "monospace",
                          }}
                        >
                          {ev.period}
                        </span>
                      </td>
                      <td style={{ color: "#5F7A9B", fontSize: "0.85rem" }}>{ev.evaluator_name}</td>
                      <td>
                        {ev.total_score !== null ? (
                          <span style={{ fontWeight: 700, color: scoreColor(ev.total_score), fontSize: "1rem" }}>
                            {ev.total_score.toFixed(1)}
                          </span>
                        ) : (
                          <span style={{ color: "#C5D8F0" }}>—</span>
                        )}
                      </td>
                      <td>
                        {tc && ev.tier ? (
                          <span className={`ev-badge ${tc.bg} ${tc.text}`}>
                            <span className={`ev-badge-dot ${tc.dot}`} />
                            {TIER_LABELS[ev.tier as SupplierTier]}
                          </span>
                        ) : <span style={{ color: "#C5D8F0" }}>—</span>}
                      </td>
                      <td>
                        <span className={`ev-badge ${sc.bg} ${sc.text}`}>
                          {EVAL_STATUS_LABELS[ev.status as EvaluationStatus]}
                        </span>
                      </td>
                      <td style={{ color: "#5F7A9B", fontSize: "0.8rem", fontFamily: "monospace" }}>
                        {formatDate(ev.updated_at)}
                      </td>
                      <td>
                        <Link href={`/evaluations/${ev.id}`}>
                          <button className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                            <i className="bi bi-eye" /> 查看
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "32px 20px", color: "#94AEC8" }}>
            <i className="bi bi-clipboard2-x" style={{ fontSize: "1.8rem", display: "block", marginBottom: 8 }} />
            尚無評鑑紀錄
          </div>
        )}
      </div>

      {/* SCAR history */}
      {supplierScars.length > 0 && (
        <div className="ev-card" style={{ overflow: "hidden", marginBottom: 18 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #EAF1FB" }}>
            <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: "#F59E0B", marginRight: 8 }} />
              SCAR 矯正行動
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="ev-table">
              <thead>
                <tr>
                  <th>SCAR 編號</th>
                  <th>問題類別</th>
                  <th>問題描述</th>
                  <th>觸發分數</th>
                  <th>目標完成日</th>
                  <th>狀態</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {supplierScars.map((sc) => {
                  const c = getScarStatusColor(sc.status);
                  return (
                    <tr key={sc.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600 }}>
                          {sc.scar_number}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: "#FEF3C7", color: "#92400E", padding: "1px 7px", borderRadius: 4, fontSize: "0.75rem" }}>
                          {sc.category}
                        </span>
                      </td>
                      <td style={{ color: "#5F7A9B", fontSize: "0.82rem", maxWidth: 260 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sc.issue_description}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: scoreColor(sc.triggered_score) }}>
                          {sc.triggered_score}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#5F7A9B" }}>
                        {sc.target_date}
                      </td>
                      <td>
                        <span className={`ev-badge ${c.bg} ${c.text}`}>
                          <span className={`ev-badge-dot ${c.dot}`} />
                          {SCAR_STATUS_LABELS[sc.status]}
                        </span>
                      </td>
                      <td>
                        <Link href={`/scar/${sc.id}`}>
                          <button className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                            <i className="bi bi-eye" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="ev-btn ev-btn-secondary" onClick={() => router.push("/suppliers")}>← 回供應商列表</button>
      </div>
    </div>
  );
}
