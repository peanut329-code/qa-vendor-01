"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SUPPLIERS, CRITERIA } from "@/lib/mock-data";
import { scoreToTier, getTierColor } from "@/lib/utils";
import { TIER_LABELS } from "@/types";

const PERIODS = [
  "2025-Q2", "2025-Q1", "2024-Q4", "2024-Q3", "2024-Q2", "2024-Q1",
];

export default function NewEvaluationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [supplierId, setSupplierId] = useState(searchParams.get("supplier") ?? "");
  const [period, setPeriod] = useState("2025-Q2");
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(CRITERIA.map((c) => [c.id, 80]))
  );
  const [notesMap, setNotesMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(CRITERIA.map((c) => [c.id, ""]))
  );
  const [evalNotes, setEvalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Access guard
  useEffect(() => {
    if (user && user.role === "viewer") router.replace("/dashboard");
  }, [user, router]);

  if (user?.role === "viewer") return null;

  // Live total
  const total = useMemo(
    () =>
      CRITERIA.reduce((acc, c) => acc + (scores[c.id] ?? 0) * c.weight / 100, 0),
    [scores]
  );
  const tier = scoreToTier(total);
  const tierC = getTierColor(tier);

  const selectedSupplier = SUPPLIERS.find((s) => s.id === supplierId);

  function setScore(id: string, val: number) {
    setScores((prev) => ({ ...prev, [id]: Math.max(0, Math.min(100, val)) }));
  }

  async function handleSubmit(isDraft: boolean) {
    if (!supplierId) { alert("請選擇供應商"); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#22C55E,#16A34A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", boxShadow: "0 4px 20px rgba(34,197,94,0.35)",
          }}
        >
          <i className="bi bi-check-lg" style={{ fontSize: "2rem", color: "white" }} />
        </div>
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1E3A5F", marginBottom: 8 }}>
          評鑑已成功送出
        </div>
        <div style={{ color: "#5F7A9B", fontSize: "0.875rem", marginBottom: 28 }}>
          {selectedSupplier?.name} ／ {period}　總分 {total.toFixed(1)} 分
          <span className={`ev-badge ${tierC.bg} ${tierC.text}`} style={{ marginLeft: 8 }}>
            {TIER_LABELS[tier]}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="ev-btn ev-btn-ghost" onClick={() => router.push("/evaluations")}>
            <i className="bi bi-arrow-left" /> 回評鑑列表
          </button>
          <button className="ev-btn ev-btn-primary" onClick={() => {
            setSubmitted(false);
            setSupplierId("");
            setScores(Object.fromEntries(CRITERIA.map((c) => [c.id, 80])));
          }}>
            <i className="bi bi-plus-lg" /> 新增另一筆評鑑
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Link href="/evaluations" style={{ color: "#94AEC8", fontSize: "0.82rem", textDecoration: "none" }}>
              評鑑作業
            </Link>
            <i className="bi bi-chevron-right" style={{ color: "#C5D8F0", fontSize: "0.7rem" }} />
            <span style={{ color: "#5B8FD9", fontSize: "0.82rem", fontWeight: 600 }}>新增評鑑</span>
          </div>
          <div className="page-title">新增供應商評鑑</div>
          <div className="page-subtitle">依各指標評分後系統自動計算加權總分與等級</div>
        </div>

        {/* Live score preview */}
        <div
          style={{
            background: "white",
            border: "1.5px solid #E0EBF8",
            borderRadius: 12,
            padding: "12px 20px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(91,143,217,0.1)",
          }}
        >
          <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginBottom: 4 }}>即時加權總分</div>
          <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#1E3A5F", lineHeight: 1 }}>
            {total.toFixed(1)}
          </div>
          <span className={`ev-badge ${tierC.bg} ${tierC.text}`} style={{ marginTop: 6, display: "inline-flex" }}>
            <span className={`ev-badge-dot ${tierC.dot}`} />
            {TIER_LABELS[tier]}
          </span>
        </div>
      </div>

      {/* Basic info */}
      <div className="ev-card" style={{ padding: "20px 24px", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 16 }}>
          <i className="bi bi-info-circle-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
          基本資訊
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>
              供應商 <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <select
              className="ev-select"
              style={{ width: "100%" }}
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">— 請選擇供應商 —</option>
              {SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}　{s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>
              評鑑期間 <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <select
              className="ev-select"
              style={{ width: "100%" }}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          {selectedSupplier && (
            <div style={{ gridColumn: "span 2", background: "#F7FAFF", border: "1px solid #EAF1FB", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <span><span style={{ color: "#94AEC8" }}>分類：</span><strong>{selectedSupplier.category}</strong></span>
                <span><span style={{ color: "#94AEC8" }}>聯絡人：</span><strong>{selectedSupplier.contact_name}</strong></span>
                <span><span style={{ color: "#94AEC8" }}>現有等級：</span>
                  <span className={`ev-badge ${getTierColor(selectedSupplier.tier).bg} ${getTierColor(selectedSupplier.tier).text}`} style={{ marginLeft: 4 }}>
                    {TIER_LABELS[selectedSupplier.tier]}
                  </span>
                </span>
                <span><span style={{ color: "#94AEC8" }}>歷史最新分：</span><strong>{selectedSupplier.overall_score.toFixed(1)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Criteria scoring */}
      <div className="ev-card" style={{ padding: 0, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #EAF1FB", background: "#FAFCFF" }}>
          <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem" }}>
            <i className="bi bi-sliders2-vertical" style={{ color: "#5B8FD9", marginRight: 8 }} />
            評鑑項目評分
          </span>
          <span style={{ marginLeft: 12, fontSize: "0.78rem", color: "#94AEC8" }}>
            各項目 0–100 分，系統依權重自動計算加權得分
          </span>
        </div>

        <div style={{ padding: "0 24px" }}>
          {/* Category groups */}
          {["品質", "交期", "價格", "服務", "技術", "財務", "合規"].map((cat) => {
            const catCriteria = CRITERIA.filter((c) => c.category === cat);
            if (!catCriteria.length) return null;
            return (
              <div key={cat}>
                <div
                  style={{
                    padding: "10px 0 4px",
                    fontSize: "0.75rem",
                    color: "#5B8FD9",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    borderBottom: "1px dashed #EAF1FB",
                    marginBottom: 2,
                  }}
                >
                  {cat}
                </div>
                {catCriteria.map((c) => {
                  const s = scores[c.id] ?? 80;
                  const ws = +(s * c.weight / 100).toFixed(2);
                  const scoreColor =
                    s >= 90 ? "#22C55E" : s >= 70 ? "#5B8FD9" : s >= 50 ? "#F59E0B" : "#EF4444";
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "200px 1fr 160px 90px",
                        gap: 16,
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: "1px solid #F0F5FF",
                      }}
                    >
                      {/* Criteria name */}
                      <div>
                        <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.87rem" }}>{c.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94AEC8", marginTop: 2 }}>{c.description}</div>
                        <div style={{ fontSize: "0.72rem", color: "#5B8FD9", fontWeight: 600, marginTop: 2 }}>
                          權重 {c.weight}%
                        </div>
                      </div>

                      {/* Slider */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="range"
                          min={0} max={100} step={1}
                          value={s}
                          onChange={(e) => setScore(c.id, Number(e.target.value))}
                          style={{ flex: 1, accentColor: scoreColor, height: 4 }}
                        />
                        <div
                          style={{
                            fontSize: "0.65rem", color: "#94AEC8",
                            display: "flex", justifyContent: "space-between",
                            width: 46,
                          }}
                        >
                          <span>0</span><span>100</span>
                        </div>
                      </div>

                      {/* Note input */}
                      <input
                        className="ev-input"
                        placeholder="評語（選填）"
                        style={{ fontSize: "0.78rem", padding: "6px 10px" }}
                        value={notesMap[c.id]}
                        onChange={(e) => setNotesMap((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      />

                      {/* Score */}
                      <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                          <input
                            type="number"
                            min={0} max={100}
                            value={s}
                            onChange={(e) => setScore(c.id, Number(e.target.value))}
                            style={{
                              width: 52, textAlign: "center", fontWeight: 800,
                              fontSize: "1.1rem", color: scoreColor,
                              border: `1.5px solid ${scoreColor}40`,
                              borderRadius: 6, padding: "2px 4px",
                              background: `${scoreColor}10`,
                            }}
                          />
                          <span style={{ fontSize: "0.7rem", color: "#94AEC8" }}>分</span>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginTop: 3 }}>
                          加權 <strong style={{ color: scoreColor }}>{ws}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Total row */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 20,
              padding: "16px 0",
              borderTop: "2px solid #EAF1FB",
              marginTop: 4,
            }}
          >
            <div style={{ color: "#5F7A9B", fontSize: "0.9rem" }}>
              加權總分：
              <span
                style={{
                  fontSize: "1.8rem", fontWeight: 800, color: "#1E3A5F",
                  marginLeft: 8,
                }}
              >
                {total.toFixed(2)}
              </span>
            </div>
            <span className={`ev-badge ${tierC.bg} ${tierC.text}`} style={{ fontSize: "0.88rem", padding: "4px 14px" }}>
              <span className={`ev-badge-dot ${tierC.dot}`} />
              {TIER_LABELS[tier]}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="ev-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E3A5F", display: "block", marginBottom: 10 }}>
          <i className="bi bi-chat-square-text" style={{ color: "#5B8FD9", marginRight: 8 }} />
          評鑑總結備註
        </label>
        <textarea
          className="ev-input"
          rows={4}
          placeholder="請填寫整體評鑑總結、特殊事項或改善建議..."
          value={evalNotes}
          onChange={(e) => setEvalNotes(e.target.value)}
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Link href="/evaluations">
          <button className="ev-btn ev-btn-ghost">
            <i className="bi bi-x-lg" /> 取消
          </button>
        </Link>
        <button
          className="ev-btn ev-btn-secondary"
          disabled={submitting}
          onClick={() => handleSubmit(true)}
        >
          <i className="bi bi-save" /> 儲存草稿
        </button>
        <button
          className="ev-btn ev-btn-primary"
          disabled={submitting || !supplierId}
          onClick={() => handleSubmit(false)}
        >
          {submitting ? (
            <><i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite" }} /> 送出中...</>
          ) : (
            <><i className="bi bi-send-fill" /> 提交評鑑</>
          )}
        </button>
      </div>
    </div>
  );
}
