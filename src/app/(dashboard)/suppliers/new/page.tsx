"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_LABELS, STATUS_LABELS } from "@/types";
import type { SupplierTier, SupplierStatus } from "@/types";
import { getTierColor } from "@/lib/utils";

const CATEGORIES = [
  "矽晶圓", "特殊氣體", "光罩製造", "封裝測試", "製程化學品",
  "機械零件", "電子元件", "化工原料", "包裝材料", "物流服務",
  "橡膠製品", "鋼鐵材料", "扣件緊固", "印刷包裝", "設備維修",
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function NewSupplierPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "矽晶圓",
    tier: "B" as SupplierTier,
    status: "active" as SupplierStatus,
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user || !["super_admin", "admin"].includes(user.role)) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B" }}>存取受限</div>
      </div>
    );
  }

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = "請輸入供應商代碼";
    else if (!/^[A-Z0-9\-]+$/.test(form.code.trim())) newErrors.code = "代碼僅允許大寫英文、數字、連字號";
    if (!form.name.trim()) newErrors.name = "請輸入供應商名稱";
    if (!form.contact_name.trim()) newErrors.contact_name = "請輸入聯絡人姓名";
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email))
      newErrors.contact_email = "電子郵件格式不正確";
    if (!form.address.trim()) newErrors.address = "請輸入供應商地址";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  }

  const tierC = getTierColor(form.tier);

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg,#22C55E,#16A34A)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", boxShadow: "0 4px 20px rgba(34,197,94,0.35)",
        }}>
          <i className="bi bi-check-lg" style={{ fontSize: "2rem", color: "white" }} />
        </div>
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1E3A5F", marginBottom: 8 }}>
          供應商已成功建立
        </div>
        <div style={{ color: "#5F7A9B", fontSize: "0.875rem", marginBottom: 28 }}>
          {form.name}（{form.code}）已加入合格供應商清單
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="ev-btn ev-btn-ghost" onClick={() => router.push("/suppliers")}>
            <i className="bi bi-arrow-left" /> 回供應商列表
          </button>
          <button className="ev-btn ev-btn-primary" onClick={() => {
            setSubmitted(false);
            setForm({ code: "", name: "", category: "矽晶圓", tier: "B", status: "active", contact_name: "", contact_email: "", contact_phone: "", address: "", notes: "" });
          }}>
            <i className="bi bi-plus-lg" /> 新增另一家
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
            <Link href="/suppliers" style={{ color: "#94AEC8", fontSize: "0.82rem", textDecoration: "none" }}>
              供應商管理
            </Link>
            <i className="bi bi-chevron-right" style={{ color: "#C5D8F0", fontSize: "0.7rem" }} />
            <span style={{ color: "#5B8FD9", fontSize: "0.82rem", fontWeight: 600 }}>新增供應商</span>
          </div>
          <div className="page-title">新增供應商</div>
          <div className="page-subtitle">填寫基本資料後加入合格供應商清單</div>
        </div>
        {/* Tier preview */}
        <div style={{ background: "white", border: "1.5px solid #E0EBF8", borderRadius: 12, padding: "12px 20px", textAlign: "center", boxShadow: "0 2px 10px rgba(91,143,217,0.1)" }}>
          <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginBottom: 6 }}>初始等級</div>
          <span className={`ev-badge ${tierC.bg} ${tierC.text}`} style={{ fontSize: "0.95rem", padding: "6px 18px" }}>
            <span className={`ev-badge-dot ${tierC.dot}`} />
            {TIER_LABELS[form.tier]}
          </span>
        </div>
      </div>

      {/* 基本資料 */}
      <div className="ev-card" style={{ padding: "20px 24px", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 18 }}>
          <i className="bi bi-building-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
          基本資料
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="供應商代碼" required>
            <input
              className="ev-input"
              style={{ width: "100%", borderColor: errors.code ? "#EF4444" : undefined }}
              placeholder="例：SUP-006"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
            />
            {errors.code && <div style={{ color: "#EF4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.code}</div>}
          </Field>

          <Field label="供應商名稱" required>
            <input
              className="ev-input"
              style={{ width: "100%", borderColor: errors.name ? "#EF4444" : undefined }}
              placeholder="例：○○股份有限公司"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <div style={{ color: "#EF4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.name}</div>}
          </Field>

          <Field label="供應商分類" required>
            <select className="ev-select" style={{ width: "100%" }} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="狀態">
            <select className="ev-select" style={{ width: "100%" }} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">正常合作中</option>
              <option value="inactive">停用</option>
              <option value="suspended">暫停</option>
            </select>
          </Field>

          <Field label="地址" required>
            <input
              className="ev-input"
              style={{ width: "100%", borderColor: errors.address ? "#EF4444" : undefined }}
              placeholder="例：新竹科學園區力行一路 1 號"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
            {errors.address && <div style={{ color: "#EF4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.address}</div>}
          </Field>

          {/* Tier picker */}
          <Field label="初始等級">
            <div style={{ display: "flex", gap: 8 }}>
              {(["A", "B", "C", "D"] as SupplierTier[]).map((t) => {
                const c = getTierColor(t);
                const isActive = form.tier === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("tier", t)}
                    className={`ev-badge ${isActive ? c.bg : ""} ${isActive ? c.text : ""}`}
                    style={{
                      cursor: "pointer", flex: 1, justifyContent: "center",
                      border: `2px solid ${isActive ? "currentColor" : "#E0EBF8"}`,
                      padding: "7px 4px", fontSize: "0.8rem", fontWeight: 700,
                      background: isActive ? undefined : "white",
                      color: isActive ? undefined : "#94AEC8",
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94AEC8", marginTop: 5 }}>
              A≥90 · B 70–89 · C 50–69 · D&lt;50（可於首次評鑑後自動更新）
            </div>
          </Field>
        </div>
      </div>

      {/* 聯絡資訊 */}
      <div className="ev-card" style={{ padding: "20px 24px", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 18 }}>
          <i className="bi bi-person-lines-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
          聯絡資訊
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field label="聯絡人姓名" required>
            <input
              className="ev-input"
              style={{ width: "100%", borderColor: errors.contact_name ? "#EF4444" : undefined }}
              placeholder="姓名"
              value={form.contact_name}
              onChange={(e) => set("contact_name", e.target.value)}
            />
            {errors.contact_name && <div style={{ color: "#EF4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.contact_name}</div>}
          </Field>

          <Field label="電子郵件">
            <input
              className="ev-input"
              style={{ width: "100%", borderColor: errors.contact_email ? "#EF4444" : undefined }}
              placeholder="example@company.com"
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
            />
            {errors.contact_email && <div style={{ color: "#EF4444", fontSize: "0.72rem", marginTop: 4 }}>{errors.contact_email}</div>}
          </Field>

          <Field label="聯絡電話">
            <input
              className="ev-input"
              style={{ width: "100%" }}
              placeholder="例：03-1234-5678"
              value={form.contact_phone}
              onChange={(e) => set("contact_phone", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* 備註 */}
      <div className="ev-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <Field label="備註說明">
          <textarea
            className="ev-input"
            rows={3}
            placeholder="供應商特殊說明、合約條件、注意事項..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            style={{ width: "100%", resize: "vertical" }}
          />
        </Field>
      </div>

      {/* Required hint */}
      <div style={{ fontSize: "0.75rem", color: "#94AEC8", marginBottom: 12, textAlign: "right" }}>
        <span style={{ color: "#EF4444" }}>*</span> 為必填欄位
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Link href="/suppliers">
          <button className="ev-btn ev-btn-ghost">
            <i className="bi bi-x-lg" /> 取消
          </button>
        </Link>
        <button
          className="ev-btn ev-btn-primary"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <><i className="bi bi-arrow-repeat" style={{ animation: "spin 1s linear infinite" }} /> 建立中...</>
          ) : (
            <><i className="bi bi-plus-lg" /> 建立供應商</>
          )}
        </button>
      </div>
    </div>
  );
}
