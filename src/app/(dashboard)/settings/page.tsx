"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CRITERIA } from "@/lib/mock-data";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"criteria" | "company" | "notifications">("criteria");

  if (!user || !["super_admin", "admin"].includes(user.role)) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
        <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您沒有權限查看此頁面。</div>
      </div>
    );
  }

  const totalWeight = CRITERIA.reduce((sum, c) => sum + c.weight, 0);

  const TABS = [
    { key: "criteria" as const, label: "評鑑指標設定", icon: "bi-sliders" },
    { key: "company" as const, label: "公司基本設定", icon: "bi-building" },
    { key: "notifications" as const, label: "通知設定", icon: "bi-bell" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">系統設定</div>
          <div className="page-subtitle">設定評鑑指標、公司資料及系統通知</div>
        </div>
        <button className="ev-btn ev-btn-primary">
          <i className="bi bi-check-lg" /> 儲存設定
        </button>
      </div>

      {/* Tabs + content */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 18 }}>
        {/* Tab nav */}
        <div className="ev-card" style={{ padding: "10px 8px", height: "fit-content" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background: activeTab === tab.key ? "#EDF3FA" : "transparent",
                color: activeTab === tab.key ? "#5B8FD9" : "#5F7A9B",
                fontWeight: activeTab === tab.key ? 600 : 500,
                fontSize: "0.855rem",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: 2,
                transition: "all 0.15s",
              }}
            >
              <i className={`bi ${tab.icon}`} style={{ fontSize: "0.9rem" }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "criteria" && (
            <div>
              {/* Weight summary */}
              <div
                className="ev-card"
                style={{
                  padding: "14px 18px",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: totalWeight === 100 ? "#ECFDF5" : "#FEF3C7",
                  border: `1px solid ${totalWeight === 100 ? "#A7F3D0" : "#FCD34D"}`,
                }}
              >
                <i
                  className={`bi ${totalWeight === 100 ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}
                  style={{ color: totalWeight === 100 ? "#22C55E" : "#F59E0B", fontSize: "1.1rem" }}
                />
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: totalWeight === 100 ? "#166534" : "#92400E" }}>
                    總權重：{totalWeight}%
                  </span>
                  <span style={{ fontSize: "0.8rem", color: totalWeight === 100 ? "#15803D" : "#B45309", marginLeft: 8 }}>
                    {totalWeight === 100 ? "配置正確，所有指標總和等於 100%" : "請調整各指標權重，確保總和為 100%"}
                  </span>
                </div>
              </div>

              <div className="ev-card" style={{ overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderBottom: "1px solid #EAF1FB",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>評鑑指標管理</span>
                  <button className="ev-btn ev-btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                    <i className="bi bi-plus" /> 新增指標
                  </button>
                </div>
                <table className="ev-table">
                  <thead>
                    <tr>
                      <th>順序</th>
                      <th>指標名稱</th>
                      <th>類別</th>
                      <th>權重 (%)</th>
                      <th>最高分</th>
                      <th>說明</th>
                      <th>狀態</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRITERIA.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span style={{ color: "#94AEC8", fontSize: "0.8rem", fontFamily: "monospace" }}>
                            {c.sort_order}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#1E3A5F" }}>{c.name}</td>
                        <td>
                          <span style={{ background: "#EDF3FA", color: "#5B8FD9", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem" }}>
                            {c.category}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="score-display" style={{ fontWeight: 700, color: "#1E3A5F" }}>
                              {c.weight}%
                            </span>
                            <div style={{ width: 60, height: 5, background: "#EDF3FA", borderRadius: 3, overflow: "hidden" }}>
                              <div
                                style={{
                                  height: "100%",
                                  width: `${c.weight * 4}%`,
                                  background: "#5B8FD9",
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: "monospace", color: "#5F7A9B" }}>{c.max_score}</td>
                        <td style={{ color: "#5F7A9B", fontSize: "0.8rem", maxWidth: 180 }}>
                          {c.description}
                        </td>
                        <td>
                          {c.is_active ? (
                            <span className="ev-badge bg-emerald-100 text-emerald-700">
                              <span className="ev-badge-dot bg-emerald-500" />
                              啟用
                            </span>
                          ) : (
                            <span className="ev-badge bg-gray-100 text-gray-500">停用</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="ev-btn ev-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                              <i className="bi bi-pencil" />
                            </button>
                            <button className="ev-btn ev-btn-danger" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "company" && (
            <div className="ev-card" style={{ padding: "24px" }}>
              <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 20 }}>公司基本資料</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {[
                  { label: "公司名稱", placeholder: "請輸入公司全名", defaultValue: "範例科技股份有限公司" },
                  { label: "統一編號", placeholder: "請輸入統一編號", defaultValue: "12345678" },
                  { label: "評鑑週期", placeholder: "例：季評鑑", defaultValue: "季評鑑（每季一次）" },
                  { label: "系統管理員", placeholder: "管理員姓名", defaultValue: "陳志明" },
                  { label: "聯絡電話", placeholder: "02-xxxx-xxxx", defaultValue: "02-2345-6789" },
                  { label: "電子郵件", placeholder: "admin@company.com", defaultValue: "admin@example.com" },
                ].map((field) => (
                  <div key={field.label}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#5F7A9B", display: "block", marginBottom: 6 }}>
                      {field.label}
                    </label>
                    <input
                      className="ev-input"
                      placeholder={field.placeholder}
                      defaultValue={field.defaultValue}
                    />
                  </div>
                ))}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#5F7A9B", display: "block", marginBottom: 6 }}>
                    公司地址
                  </label>
                  <input className="ev-input" defaultValue="台北市信義區忠孝東路五段 150 號 8 樓" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="ev-card" style={{ padding: "24px" }}>
              <div style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.95rem", marginBottom: 20 }}>通知設定</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "評鑑到期提醒", sub: "在評鑑截止日 7 天前發送提醒通知", checked: true },
                  { label: "新評鑑指派通知", sub: "當有新評鑑指派給您時，立即發送通知", checked: true },
                  { label: "審核結果通知", sub: "評鑑審核完成後通知評鑑人員", checked: true },
                  { label: "供應商等級變更提醒", sub: "供應商等級升降時發送主管通知", checked: false },
                  { label: "月報表自動發送", sub: "每月 1 日自動寄送上月彙整報表", checked: false },
                  { label: "D 級供應商警示", sub: "有供應商跌至 D 級時發送緊急通知", checked: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "#F8FBFF",
                      border: "1px solid #EAF1FB",
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1E3A5F" }}>{item.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "#5F7A9B", marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <label
                      style={{
                        position: "relative",
                        width: 40,
                        height: 22,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <input type="checkbox" defaultChecked={item.checked} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 11,
                          background: item.checked ? "#5B8FD9" : "#C5D8F0",
                          transition: "background 0.2s",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "white",
                            top: 3,
                            left: item.checked ? 21 : 3,
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
