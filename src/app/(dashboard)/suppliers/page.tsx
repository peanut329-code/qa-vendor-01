"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SUPPLIERS } from "@/lib/mock-data";
import { getTierColor, getSupplierStatusColor, formatDate } from "@/lib/utils";
import { TIER_LABELS, STATUS_LABELS } from "@/types";
import type { SupplierTier, SupplierStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = ["全部", "機械零件", "電子元件", "化工原料", "包裝材料", "物流服務", "橡膠製品", "鋼鐵材料", "扣件緊固", "印刷包裝", "設備維修"];

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號（唯讀觀察者）無法存取此功能，請聯絡系統管理員。</div>
    </div>
  );
}
const TIERS: (SupplierTier | "ALL")[] = ["ALL", "A", "B", "C", "D"];

export default function SuppliersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<SupplierTier | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | "ALL">("ALL");

  useEffect(() => {
    if (user && user.role === "viewer") router.replace("/dashboard");
  }, [user, router]);

  if (user?.role === "viewer") return <AccessDenied />;

  const canEdit = user && ["super_admin", "admin"].includes(user.role);

  const filtered = SUPPLIERS.filter((s) => {
    const matchSearch =
      !search ||
      s.name.includes(search) ||
      s.code.includes(search) ||
      s.contact_name.includes(search);
    const matchTier = tierFilter === "ALL" || s.tier === tierFilter;
    const matchCat = categoryFilter === "全部" || s.category === categoryFilter;
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchTier && matchCat && matchStatus;
  });

  const tierCounts = {
    A: SUPPLIERS.filter((s) => s.tier === "A").length,
    B: SUPPLIERS.filter((s) => s.tier === "B").length,
    C: SUPPLIERS.filter((s) => s.tier === "C").length,
    D: SUPPLIERS.filter((s) => s.tier === "D").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">供應商管理</div>
          <div className="page-subtitle">共 {SUPPLIERS.length} 家供應商，{SUPPLIERS.filter((s) => s.status === "active").length} 家正常合作中</div>
        </div>
        {canEdit && (
          <Link href="/suppliers/new">
            <button className="ev-btn ev-btn-primary">
              <i className="bi bi-plus-lg" /> 新增供應商
            </button>
          </Link>
        )}
      </div>

      {/* Tier summary chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {(["A", "B", "C", "D"] as SupplierTier[]).map((t) => {
          const c = getTierColor(t);
          return (
            <button
              key={t}
              onClick={() => setTierFilter(tierFilter === t ? "ALL" : t)}
              className={`ev-badge ${c.bg} ${c.text}`}
              style={{
                cursor: "pointer",
                border: `1.5px solid ${tierFilter === t ? "currentColor" : "transparent"}`,
                padding: "5px 14px",
                fontSize: "0.8rem",
              }}
            >
              <span className={`ev-badge-dot ${c.dot}`} />
              {TIER_LABELS[t]} ({tierCounts[t]})
            </button>
          );
        })}
        {tierFilter !== "ALL" && (
          <button
            onClick={() => setTierFilter("ALL")}
            className="ev-btn ev-btn-ghost"
            style={{ fontSize: "0.78rem", padding: "4px 12px" }}
          >
            <i className="bi bi-x" /> 清除篩選
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="ev-card" style={{ padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200 }}>
          <i className="bi bi-search" style={{ color: "#94AEC8" }} />
          <input
            className="ev-input"
            placeholder="搜尋供應商名稱、代碼、聯絡人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", boxShadow: "none", padding: "4px 0" }}
          />
        </div>
        <select className="ev-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="ev-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SupplierStatus | "ALL")}>
          <option value="ALL">全部狀態</option>
          <option value="active">正常</option>
          <option value="inactive">停用</option>
          <option value="suspended">暫停</option>
        </select>
        <div style={{ color: "#5F7A9B", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
          共 <strong style={{ color: "#1E3A5F" }}>{filtered.length}</strong> 筆
        </div>
      </div>

      {/* Table */}
      <div className="ev-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="ev-table">
            <thead>
              <tr>
                <th>代碼</th>
                <th>供應商名稱</th>
                <th>分類</th>
                <th>聯絡人</th>
                <th>評鑑次數</th>
                <th>最新分數</th>
                <th>等級</th>
                <th>狀態</th>
                <th>建立日期</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const tierC = getTierColor(s.tier);
                const statusC = getSupplierStatusColor(s.status);
                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#5F7A9B", fontWeight: 600 }}>
                        {s.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem" }}>{s.name}</div>
                      <div style={{ color: "#94AEC8", fontSize: "0.75rem" }}>{s.contact_email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#EDF3FA",
                          color: "#5B8FD9",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "0.78rem",
                          fontWeight: 500,
                        }}
                      >
                        {s.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", color: "#1E3A5F" }}>{s.contact_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#94AEC8" }}>{s.contact_phone}</div>
                    </td>
                    <td>
                      <span className="score-display" style={{ color: "#5F7A9B", fontSize: "0.9rem" }}>
                        {s.eval_count}
                      </span>
                    </td>
                    <td>
                      <span className="score-display" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1E3A5F" }}>
                        {s.overall_score.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`ev-badge ${tierC.bg} ${tierC.text}`}>
                        <span className={`ev-badge-dot ${tierC.dot}`} />
                        {TIER_LABELS[s.tier]}
                      </span>
                    </td>
                    <td>
                      <span className={`ev-badge ${statusC.bg} ${statusC.text}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td style={{ color: "#5F7A9B", fontSize: "0.8rem", fontFamily: "monospace" }}>
                      {formatDate(s.created_at)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Link href={`/suppliers/${s.id}`}>
                          <button className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                            <i className="bi bi-eye" /> 查看
                          </button>
                        </Link>
                        {canEdit && (
                          <button className="ev-btn ev-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                            <i className="bi bi-pencil" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94AEC8" }}>
            <i className="bi bi-search" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
            沒有符合條件的供應商
          </div>
        )}
      </div>
    </div>
  );
}
