"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CERTIFICATIONS, SUPPLIERS } from "@/lib/mock-data";
import { getCertStatus, getCertStatusColor, getDaysUntilExpiry, formatDate } from "@/lib/utils";
import { CERT_STATUS_LABELS } from "@/types";
import type { CertStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { exportCertificationsToExcel } from "@/lib/export";

const CERT_TYPES = ["全部", "ISO 9001:2015", "IATF 16949:2016", "ISO 14001:2015", "ISO 45001:2018", "ISO/IEC 17025:2017", "AEC-Q102", "RoHS 合規聲明"];

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號無法存取此功能，請聯絡系統管理員。</div>
    </div>
  );
}

export default function CertificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<CertStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [supplierFilter, setSupplierFilter] = useState("全部");
  const [search, setSearch] = useState("");

  const [certList, setCertList] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewForm, setRenewForm] = useState({
    cert_number: "",
    issued_by: "",
    issue_date: "",
    expiry_date: "",
    updated_at: "",
    notes: ""
  });

  const getDemoHistory = (cert: any) => {
    if (!cert.issue_date || !cert.cert_number) return [];
    try {
      const curIssue = new Date(cert.issue_date);
      if (isNaN(curIssue.getTime())) return [];
      const prevIssue = new Date(curIssue.getFullYear() - 3, curIssue.getMonth(), curIssue.getDate()).toISOString().slice(0, 10);
      const prevExpiryDate = new Date(curIssue.getTime() - 24 * 60 * 60 * 1000);
      const prevExpiry = isNaN(prevExpiryDate.getTime()) ? "" : prevExpiryDate.toISOString().slice(0, 10);
      
      const parts = cert.cert_number.split("-");
      let prevNumber = cert.cert_number;
      if (parts.length > 2) {
        prevNumber = parts.map((p: string) => p.match(/^\d{4}$/) ? String(Number(p) - 3) : p).join("-");
      }
      return [
        {
          cert_number: prevNumber,
          issued_by: cert.issued_by,
          issue_date: prevIssue,
          expiry_date: prevExpiry,
          updated_at: prevIssue,
          notes: "前次換證紀錄，已由新證證號替代結案",
        }
      ];
    } catch (e) {
      return [];
    }
  };

  function handleRenewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCert) return;

    const currentBackup = {
      cert_number: selectedCert.cert_number,
      issued_by: selectedCert.issued_by,
      issue_date: selectedCert.issue_date,
      expiry_date: selectedCert.expiry_date,
      updated_at: selectedCert.updated_at || selectedCert.issue_date,
      notes: selectedCert.notes || "舊證書存檔"
    };

    const pastHistory = selectedCert.history || getDemoHistory(selectedCert);
    const newHistory = [currentBackup, ...pastHistory];

    const updatedCert = {
      ...selectedCert,
      cert_number: renewForm.cert_number,
      issued_by: renewForm.issued_by,
      issue_date: renewForm.issue_date,
      expiry_date: renewForm.expiry_date,
      updated_at: renewForm.updated_at,
      notes: renewForm.notes,
      history: newHistory
    };

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("certifications-custom");
      let customCerts: any[] = [];
      if (saved) {
        try { customCerts = JSON.parse(saved); } catch (e) {}
      }

      const isCustom = customCerts.some(c => c.id === selectedCert.id);
      let updatedCustom: any[];
      if (isCustom) {
        updatedCustom = customCerts.map(c => c.id === selectedCert.id ? updatedCert : c);
      } else {
        updatedCustom = [...customCerts, updatedCert];
      }
      localStorage.setItem("certifications-custom", JSON.stringify(updatedCustom));
      
      setCertList(prev => {
        const hasId = prev.some(c => c.id === selectedCert.id);
        if (hasId) {
          return prev.map(c => c.id === selectedCert.id ? updatedCert : c);
        } else {
          return [...prev, updatedCert];
        }
      });
    }

    setSelectedCert(updatedCert);
    setIsRenewing(false);
    alert("換證更新成功！新證書已生效，舊證書已移入換證歷史紀錄以供追溯。");
  }

  const [newCert, setNewCert] = useState({
    supplier_id: "",
    cert_type: "ISO 9001:2015",
    cert_number: "",
    issued_by: "",
    issue_date: "",
    expiry_date: "",
    notes: "",
  });

  useEffect(() => {
    if (user && !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCerts = localStorage.getItem("certifications-custom");
      let customCerts: any[] = [];
      if (savedCerts) {
        try {
          customCerts = JSON.parse(savedCerts);
        } catch (e) {}
      }
      const customIds = new Set(customCerts.map((c) => c.id));
      const filteredDefault = CERTIFICATIONS.filter((c) => !customIds.has(c.id));
      setCertList([...filteredDefault, ...customCerts]);

      const savedSups = localStorage.getItem("suppliers-custom");
      let customSups: any[] = [];
      if (savedSups) {
        try {
          customSups = JSON.parse(savedSups);
        } catch (e) {}
      }
      const allSups = [...SUPPLIERS, ...customSups];
      setSuppliersList(allSups);
      if (allSups.length > 0) {
        setNewCert((prev) => ({ ...prev, supplier_id: allSups[0].id }));
      }
    }
  }, []);

  if (!user || !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
    return <AccessDenied />;
  }

  const canExport = user && ["super_admin", "admin", "manager"].includes(user.role);

  // Compute statuses
  const certsWithStatus = useMemo(
    () => certList.map((c) => ({ ...c, status: getCertStatus(c.expiry_date), days: getDaysUntilExpiry(c.expiry_date) })),
    [certList]
  );

  const expiredCount = certsWithStatus.filter((c) => c.status === "expired").length;
  const expiringSoonCount = certsWithStatus.filter((c) => c.status === "expiring_soon").length;

  const supplierNames = ["全部", ...Array.from(new Set(certList.map((c) => c.supplier_name)))];

  const filtered = certsWithStatus.filter((c) => {
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchType = typeFilter === "全部" || c.cert_type === typeFilter;
    const matchSupplier = supplierFilter === "全部" || c.supplier_name === supplierFilter;
    const matchSearch = !search || c.cert_type.toLowerCase().includes(search.toLowerCase()) || c.supplier_name.toLowerCase().includes(search.toLowerCase()) || c.cert_number.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSupplier && matchSearch;
  });

  function handleAddCert(e: React.FormEvent) {
    e.preventDefault();
    const targetSup = suppliersList.find((s) => s.id === newCert.supplier_id);
    if (!targetSup) return;

    const itemToAdd = {
      id: `cert-${Date.now()}`,
      supplier_id: targetSup.id,
      supplier_name: targetSup.name,
      supplier_code: targetSup.code,
      cert_type: newCert.cert_type,
      cert_number: newCert.cert_number,
      issued_by: newCert.issued_by,
      issue_date: newCert.issue_date,
      expiry_date: newCert.expiry_date,
      notes: newCert.notes,
    };

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("certifications-custom");
      let current: any[] = [];
      if (saved) {
        try {
          current = JSON.parse(saved);
        } catch (e) {}
      }
      current.push(itemToAdd);
      localStorage.setItem("certifications-custom", JSON.stringify(current));
    }

    setCertList((prev) => [...prev, itemToAdd]);
    setShowAddModal(false);
    setNewCert((prev) => ({
      ...prev,
      cert_number: "",
      issued_by: "",
      issue_date: "",
      expiry_date: "",
      notes: "",
    }));
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">品質證書認證效期管理</div>
          <div className="page-subtitle">追蹤各供應商品質認證有效期，提前預警即將到期項目</div>
        </div>
        {canExport && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ev-btn ev-btn-ghost" onClick={() => exportCertificationsToExcel(filtered)}>
              <i className="bi bi-file-earmark-excel" /> Excel 匯出
            </button>
            <button className="ev-btn ev-btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg" /> 新增認證
            </button>
          </div>
        )}
      </div>

      {/* Alert banners */}
      {expiredCount > 0 && (
        <div
          style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
            padding: "12px 18px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10,
            color: "#991B1B", fontSize: "0.875rem", fontWeight: 600,
          }}
        >
          <i className="bi bi-x-circle-fill" style={{ fontSize: "1.1rem" }} />
          <span>{expiredCount} 張認證已過期，請立即安排重新複審或申請！</span>
          <button
            onClick={() => setStatusFilter("expired")}
            style={{ marginLeft: "auto", background: "#FEE2E2", border: "none", borderRadius: 6, padding: "4px 12px", color: "#DC2626", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
          >
            查看 →
          </button>
        </div>
      )}
      {expiringSoonCount > 0 && (
        <div
          style={{
            background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10,
            padding: "12px 18px", marginBottom: 18,
            display: "flex", alignItems: "center", gap: 10,
            color: "#92400E", fontSize: "0.875rem", fontWeight: 600,
          }}
        >
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "1.1rem" }} />
          <span>{expiringSoonCount} 張認證將在 90 天內到期，請提前安排複查作業。</span>
          <button
            onClick={() => setStatusFilter("expiring_soon")}
            style={{ marginLeft: "auto", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 6, padding: "4px 12px", color: "#92400E", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
          >
            查看 →
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 14, padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.5fr", gap: 12, alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>認證狀態</label>
            <select
              className="ev-select"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">全部狀態</option>
              <option value="valid">有效</option>
              <option value="expiring_soon">即將到期</option>
              <option value="expired">已過期</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>認證類別</label>
            <select
              className="ev-select"
              style={{ width: "100%" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {CERT_TYPES.map((t) => (
                <option key={t} value={t}>{t === "全部" ? "全部類別" : t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商</label>
            <select
              className="ev-select"
              style={{ width: "100%" }}
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              {supplierNames.map((n) => (
                <option key={n} value={n}>{n === "全部" ? "全部供應商" : n}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>關鍵字搜尋</label>
            <div style={{ position: "relative" }}>
              <i className="bi bi-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94AEC8" }} />
              <input
                className="input"
                style={{ width: "100%", paddingLeft: 34 }}
                placeholder="搜尋證書編號 / 頒發機構..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-title"><i className="bi bi-patch-check" /> 認證清單</div>
          <div className="card-header-count">共 {filtered.length} 筆</div>
        </div>
        <div className="card-body p-0" style={{ overflowX: "auto" }}>
          <table className="tbl" style={{ width: "100%", minWidth: 1100 }}>
            <thead>
              <tr>
                <th>供應商名稱</th>
                <th style={{ width: 140 }}>認證類別</th>
                <th style={{ width: 150 }}>證書編號</th>
                <th style={{ width: 130 }}>頒發機構</th>
                <th style={{ width: 100, textAlign: "center" }}>發證日期</th>
                <th style={{ width: 100, textAlign: "center" }}>有效截止日</th>
                <th style={{ width: 100, textAlign: "center" }}>剩餘天數</th>
                <th style={{ width: 90 }}>狀態</th>
                <th>備註</th>
                <th style={{ width: 80, textAlign: "center" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => {
                const sc = getCertStatusColor(cert.status);
                const days = cert.days;
                let daysDisplay: React.ReactNode;
                if (days < 0) {
                  daysDisplay = (
                    <span style={{ color: "#DC2626", fontWeight: 700 }}>逾期 {Math.abs(days)} 天</span>
                  );
                } else if (days <= 30) {
                  daysDisplay = (
                    <span style={{ color: "#EF4444", fontWeight: 700 }}>{days} 天</span>
                  );
                } else if (days <= 90) {
                  daysDisplay = (
                    <span style={{ color: "#F59E0B", fontWeight: 700 }}>{days} 天</span>
                  );
                } else {
                  daysDisplay = (
                    <span style={{ color: "#22C55E", fontWeight: 600 }}>{days} 天</span>
                  );
                }

                return (
                  <tr key={cert.id}>
                    <td>
                      <Link href={`/suppliers/${cert.supplier_id}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem", cursor: "pointer" }}>
                          {cert.supplier_name}
                        </div>
                        <div style={{ color: "#94AEC8", fontSize: "0.75rem", fontFamily: "monospace" }}>
                          {cert.supplier_code}
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#EDF3FA", color: "#5B8FD9",
                          padding: "3px 9px", borderRadius: 6,
                          fontSize: "0.78rem", fontWeight: 600,
                        }}
                      >
                        {cert.cert_type}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#5F7A9B" }}>
                      {cert.cert_number}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#5F7A9B" }}>{cert.issued_by}</td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", fontSize: "0.8rem", color: "#5F7A9B" }}>
                      {cert.issue_date}
                    </td>
                    <td style={{ textAlign: "center", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600, color: "#1E3A5F" }}>
                      {cert.expiry_date}
                    </td>
                    <td style={{ textAlign: "center" }}>{daysDisplay}</td>
                    <td>
                      <span className={`ev-badge ${sc.bg} ${sc.text}`}>
                        <span className={`ev-badge-dot ${sc.dot}`} />
                        {CERT_STATUS_LABELS[cert.status as CertStatus]}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, fontSize: "0.78rem", color: "#5F7A9B" }}>
                      <div
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        title={cert.notes}
                      >
                        {cert.notes}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button 
                        className="ev-btn ev-btn-ghost" 
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                        onClick={() => setSelectedCert(cert)}
                      >
                        <i className="bi bi-eye" /> 查看
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#94AEC8" }}>
            <i className="bi bi-patch-check" style={{ fontSize: "2.2rem", display: "block", marginBottom: 8 }} />
            沒有符合條件的認證紀錄
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: "0.78rem", color: "#5F7A9B" }}>
        <span><span style={{ color: "#22C55E", fontWeight: 700 }}>●</span> 有效（&gt;90 天）</span>
        <span><span style={{ color: "#F59E0B", fontWeight: 700 }}>●</span> 即將到期（30–90 天）</span>
        <span><span style={{ color: "#EF4444", fontWeight: 700 }}>●</span> 緊急（≤30 天）</span>
        <span><span style={{ color: "#DC2626", fontWeight: 700 }}>●</span> 已過期</span>
      </div>

      {selectedCert && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="ev-card" style={{
            width: "90%", maxWidth: 640, padding: 24, 
            boxShadow: "0 10px 30px rgba(30,58,95,0.15)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #EAF1FB", paddingBottom: 12 }}>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1E3A5F" }}>認證效期與換證詳情</div>
                <div style={{ fontSize: "0.78rem", color: "#94AEC8", marginTop: 4 }}>
                  {selectedCert.supplier_name} ({selectedCert.supplier_code})
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedCert(null);
                  setIsRenewing(false);
                }}
                style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {!isRenewing ? (
              <div>
                {/* 證照主卡資訊 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, background: "#F5F8FC", padding: 18, borderRadius: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>認證類別</div>
                    <div style={{ fontWeight: 700, color: "#1E3A5F" }}>{selectedCert.cert_type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>證書編號</div>
                    <div style={{ fontFamily: "monospace", fontWeight: 600, color: "#1E3A5F" }}>{selectedCert.cert_number}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>頒發機構</div>
                    <div style={{ color: "#1E3A5F" }}>{selectedCert.issued_by}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>證書更新日期</div>
                    <div style={{ color: "#5B8FD9", fontWeight: 700 }}>
                      {selectedCert.updated_at ? selectedCert.updated_at.slice(0,10) : selectedCert.issue_date}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>最新發證日期</div>
                    <div style={{ color: "#1E3A5F" }}>{selectedCert.issue_date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#5F7A9B", marginBottom: 4 }}>有效截止日</div>
                    <div style={{ color: "#EF4444", fontWeight: 700 }}>{selectedCert.expiry_date}</div>
                  </div>
                </div>

                {/* 換證紀錄 */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E3A5F" }}>
                      <i className="bi bi-clock-history" style={{ marginRight: 6, color: "#5B8FD9" }} /> 換證歷史紀錄 (供追溯)
                    </div>
                    {user?.role !== "viewer" && (
                      <button 
                        className="ev-btn ev-btn-primary" 
                        style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                        onClick={() => {
                          setIsRenewing(true);
                          setRenewForm({
                            cert_number: "",
                            issued_by: selectedCert.issued_by,
                            issue_date: "",
                            expiry_date: "",
                            updated_at: new Date().toISOString().slice(0, 10),
                            notes: "常規換證更新"
                          });
                        }}
                      >
                        <i className="bi bi-arrow-repeat" /> 執行換證更新
                      </button>
                    )}
                  </div>

                  <div style={{ background: "#FAFCFF", border: "1px solid #EAF1FB", borderRadius: 8, padding: 12, overflowX: "auto" }}>
                    {((selectedCert.history || getDemoHistory(selectedCert)).length === 0) ? (
                      <div style={{ textAlign: "center", padding: "16px 0", color: "#94AEC8", fontSize: "0.8rem" }}>
                        無歷史換證紀錄
                      </div>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "1.5px solid #EAF1FB", color: "#5F7A9B", textAlign: "left" }}>
                            <th style={{ padding: "6px 4px" }}>證書編號</th>
                            <th style={{ padding: "6px 4px" }}>發證日期</th>
                            <th style={{ padding: "6px 4px" }}>截止日期</th>
                            <th style={{ padding: "6px 4px" }}>更新日期</th>
                            <th style={{ padding: "6px 4px" }}>備註</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedCert.history || getDemoHistory(selectedCert)).map((h: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #F3F7FC" }}>
                              <td style={{ padding: "8px 4px", fontFamily: "monospace", color: "#1E3A5F" }}>{h.cert_number}</td>
                              <td style={{ padding: "8px 4px", color: "#5F7A9B" }}>{h.issue_date}</td>
                              <td style={{ padding: "8px 4px", color: "#5F7A9B" }}>{h.expiry_date}</td>
                              <td style={{ padding: "8px 4px", color: "#5B8FD9" }}>{h.updated_at ? h.updated_at.slice(0,10) : h.issue_date}</td>
                              <td style={{ padding: "8px 4px", color: "#94AEC8" }}>{h.notes || "自動歷史存檔"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    className="ev-btn ev-btn-ghost" 
                    onClick={() => {
                      setSelectedCert(null);
                      setIsRenewing(false);
                    }}
                  >
                    關閉
                  </button>
                </div>
              </div>
            ) : (
              // 換證更新的表單
              <form onSubmit={handleRenewSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", padding: 12, borderRadius: 8, fontSize: "0.78rem", color: "#92400E" }}>
                    <i className="bi bi-info-circle-fill" style={{ marginRight: 6 }} />
                    換證更新後，原有的證書（編號：{selectedCert.cert_number}）將自動存檔至下方的「換證歷史紀錄」中以供追溯，本卡片資訊將被最新證書所替換。
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>最新證書編號 *</label>
                    <input 
                      className="ev-input" style={{ width: "100%" }} required
                      value={renewForm.cert_number} onChange={(e) => setRenewForm({...renewForm, cert_number: e.target.value})}
                      placeholder="例：TUV-16949-2027-0715"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>頒發機構 *</label>
                    <input 
                      className="ev-input" style={{ width: "100%" }} required
                      value={renewForm.issued_by} onChange={(e) => setRenewForm({...renewForm, issued_by: e.target.value})}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>發證日期 *</label>
                      <input 
                        type="date" className="ev-input" style={{ width: "100%" }} required
                        value={renewForm.issue_date} 
                        onChange={(e) => {
                          const iDate = e.target.value;
                          let eDate = "";
                          if (iDate) {
                            const d = new Date(iDate);
                            d.setFullYear(d.getFullYear() + 3);
                            d.setDate(d.getDate() - 1);
                            eDate = d.toISOString().slice(0, 10);
                          }
                          setRenewForm({...renewForm, issue_date: iDate, expiry_date: eDate});
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>有效截止日 *</label>
                      <input 
                        type="date" className="ev-input" style={{ width: "100%" }} required
                        value={renewForm.expiry_date} onChange={(e) => setRenewForm({...renewForm, expiry_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>證書更新日期 *</label>
                    <input 
                      type="date" className="ev-input" style={{ width: "100%" }} required
                      value={renewForm.updated_at} onChange={(e) => setRenewForm({...renewForm, updated_at: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>更新備註</label>
                    <input 
                      className="ev-input" style={{ width: "100%" }}
                      value={renewForm.notes} onChange={(e) => setRenewForm({...renewForm, notes: e.target.value})}
                      placeholder="例如：2027年期中複審換新證"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #EAF1FB", paddingTop: 16 }}>
                  <button type="button" className="ev-btn ev-btn-ghost" onClick={() => setIsRenewing(false)}>返回詳情</button>
                  <button type="submit" className="ev-btn ev-btn-primary">確認更新換證</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="ev-card" style={{
            width: "100%", maxWidth: 480, padding: 24, 
            boxShadow: "0 10px 30px rgba(30,58,95,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F" }}>新增供應商認證</div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleAddCert}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商 *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }} required
                    value={newCert.supplier_id} onChange={(e) => setNewCert({...newCert, supplier_id: e.target.value})}
                  >
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>認證類別 *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }}
                    value={newCert.cert_type} onChange={(e) => setNewCert({...newCert, cert_type: e.target.value})}
                  >
                    {CERT_TYPES.filter(t => t !== "全部").map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>證書編號 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} required
                    value={newCert.cert_number} onChange={(e) => setNewCert({...newCert, cert_number: e.target.value})}
                    placeholder="例：TUV-16949-2024-0715"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>頒發機構 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} required
                    value={newCert.issued_by} onChange={(e) => setNewCert({...newCert, issued_by: e.target.value})}
                    placeholder="例：SGS Taiwan、TÜV Rheinland"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>發證日期 *</label>
                    <input 
                      type="date" className="ev-input" style={{ width: "100%" }} required
                      value={newCert.issue_date} onChange={(e) => setNewCert({...newCert, issue_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>到期日期 *</label>
                    <input 
                      type="date" className="ev-input" style={{ width: "100%" }} required
                      value={newCert.expiry_date} onChange={(e) => setNewCert({...newCert, expiry_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>備註</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }}
                    value={newCert.notes} onChange={(e) => setNewCert({...newCert, notes: e.target.value})}
                    placeholder="認證特殊說明、年度複審提醒..."
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #EAF1FB", paddingTop: 16 }}>
                <button type="button" className="ev-btn ev-btn-ghost" onClick={() => setShowAddModal(false)}>取消</button>
                <button type="submit" className="ev-btn ev-btn-primary">確認新增</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
