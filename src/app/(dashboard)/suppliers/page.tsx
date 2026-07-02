"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SUPPLIERS, EVALUATIONS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { TIER_LABELS } from "@/types";
import type { SupplierTier } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { exportSuppliersToExcel } from "@/lib/export";

const CATEGORIES = ["全部", "矽晶圓", "特殊氣體", "光罩製造", "封裝測試", "製程化學品",
  "機構零件", "電子元件", "塑膠原料", "原物料", "加工製造", "包裝", "口鼻罩", "頸部"];

const TIER_COLORS: Record<string, string> = {
  A: "#10B981", B: "#5B8FD9", C: "#F59E0B", D: "#EF4444",
};

type TierTab = SupplierTier | "ALL";

export default function SuppliersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab]           = useState<TierTab>("ALL");
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("全部");
  const [suppliersList, setSuppliersList] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("suppliers-custom");
      let custom: any[] = [];
      if (saved) {
        try {
          custom = JSON.parse(saved);
        } catch (e) {}
      }
      setSuppliersList([...SUPPLIERS, ...custom]);
    }
  }, []);

  async function handleXlsxImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        
        const { read, utils } = await import("xlsx");
        const workbook = read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows: any[] = utils.sheet_to_json(worksheet);
        if (!rows.length) {
          alert("Excel 檔案為空，請確認內容！");
          return;
        }

        const importedList: any[] = [];
        rows.forEach((row, i) => {
          const name = row["供應商名稱"] || row["名稱"] || row["name"] || row["Name"] || "";
          const code = row["供應商代碼"] || row["代碼"] || row["code"] || row["Code"] || "";
          const category = row["供應商品類"] || row["類別"] || row["category"] || row["Category"] || "原物料";
          const email = row["電子郵件"] || row["信箱"] || row["Email"] || row["email"] || row["contact_email"] || "";
          const phone = row["電話"] || row["Phone"] || row["phone"] || row["contact_phone"] || "";
          const address = row["地址"] || row["Address"] || row["address"] || "";
          const score = Number(row["最新分數"] || row["分數"] || row["overall_score"] || row["score"] || 100);
          
          let tier = row["等級"] || row["tier"] || row["Tier"] || "";
          if (!tier) {
            if (score >= 90) tier = "A";
            else if (score >= 80) tier = "B";
            else if (score >= 70) tier = "C";
            else tier = "D";
          }

          if (!name || !code) {
            return;
          }

          importedList.push({
            id: `s-${Date.now()}-${i}`,
            name,
            code,
            category,
            contact_email: email,
            contact_phone: phone,
            address,
            overall_score: score,
            tier: tier.toUpperCase(),
            status: "active",
            created_at: new Date().toISOString(),
          });
        });

        if (importedList.length === 0) {
          alert("沒有成功解析出任何供應商資料。請確認 Excel 包含「供應商名稱」與「代碼」！");
          return;
        }

        const saved = localStorage.getItem("suppliers-custom");
        let custom: any[] = [];
        if (saved) {
          try { custom = JSON.parse(saved); } catch (e) {}
        }
        
        const existingCodes = new Set([...SUPPLIERS, ...custom].map(s => s.code));
        const filteredImported = importedList.filter(s => {
          if (existingCodes.has(s.code)) {
            return false;
          }
          return true;
        });

        if (filteredImported.length === 0) {
          alert("匯入的所有供應商代碼均與系統現有廠商重複！");
          return;
        }

        const updatedCustom = [...custom, ...filteredImported];
        localStorage.setItem("suppliers-custom", JSON.stringify(updatedCustom));
        setSuppliersList([...SUPPLIERS, ...updatedCustom]);
        
        alert(`成功匯入 ${filteredImported.length} 家供應商！${importedList.length - filteredImported.length > 0 ? `（其中 ${importedList.length - filteredImported.length} 家因代碼重複跳過）` : ""}`);
      } catch (err) {
        console.error(err);
        alert("Excel 檔案解析失敗，請確認檔案格式是否正確。");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  function downloadTemplate() {
    import("xlsx").then(({ utils, write }) => {
      const headers = [
        "供應商名稱",
        "供應商代碼",
        "供應商品類",
        "最新分數",
        "電子郵件",
        "電話",
        "地址"
      ];
      
      const sampleData = [
        {
          "供應商名稱": "範例半導體股份有限公司",
          "供應商代碼": "SUP-999",
          "供應商品類": "矽晶圓",
          "最新分數": 95,
          "電子郵件": "service@sample.com",
          "電話": "02-2345-6789",
          "地址": "新竹市科學園區研發一路 1 號"
        },
        {
          "供應商名稱": "測試封測技術有限公司",
          "供應商代碼": "SUP-888",
          "供應商品類": "封裝測試",
          "最新分數": 82,
          "電子郵件": "contact@testpack.com",
          "電話": "03-9876-5432",
          "地址": "桃園市龍潭區科學路 88 號"
        }
      ];

      const ws = utils.json_to_sheet(sampleData, { header: headers });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "供應商匯入範本");

      const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "供應商匯入範本.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  const canEdit = user && ["super_admin", "admin"].includes(user.role);

  const tierCounts = {
    A: suppliersList.filter((s) => s.tier === "A").length,
    B: suppliersList.filter((s) => s.tier === "B").length,
    C: suppliersList.filter((s) => s.tier === "C").length,
    D: suppliersList.filter((s) => s.tier === "D").length,
  };

  const TABS: { key: TierTab; label: string; count: number }[] = [
    { key: "ALL", label: "全部",        count: suppliersList.length },
    { key: "A",   label: "A 級",        count: tierCounts.A },
    { key: "B",   label: "B 級",        count: tierCounts.B },
    { key: "C",   label: "C 級 / 觀察", count: tierCounts.C },
    { key: "D",   label: "D 級 / 不合格", count: tierCounts.D },
  ];

  const filtered = suppliersList.filter((s) => {
    const matchTab = tab === "ALL" || s.tier === tab;
    const matchSearch = !search || s.name.includes(search) || s.code.includes(search);
    const matchCat = catFilter === "全部" || s.category === catFilter;
    return matchTab && matchSearch && matchCat;
  });

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">供應商管理</div>
          <div className="page-subtitle">共 {suppliersList.length} 家供應商，{suppliersList.filter((s) => s.status === "active").length} 家正常合作中</div>
        </div>
        {canEdit && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn" style={{ background: "white", color: "var(--primary)", borderColor: "var(--primary)" }} onClick={downloadTemplate}>
              <i className="bi bi-file-earmark-arrow-down" /> 下載範本
            </button>
            <button className="btn" onClick={() => document.getElementById("xlsx-import-input")?.click()}>
              <i className="bi bi-upload" /> 匯入 Excel
            </button>
            <input 
              type="file" 
              id="xlsx-import-input" 
              accept=".xlsx, .xls" 
              style={{ display: "none" }} 
              onChange={handleXlsxImport}
            />
            <button className="btn" onClick={() => exportSuppliersToExcel(suppliersList)}>
              <i className="bi bi-download" /> 匯出
            </button>
            <button className="btn btn-primary" onClick={() => router.push("/suppliers/new")}>
              <i className="bi bi-plus-circle" /> 新增供應商
            </button>
          </div>
        )}
      </div>

      {/* Tier tab pills */}
      <div className="card" style={{ marginBottom: 14, padding: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: "10px 14px", border: "none", borderRadius: 8,
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "white" : "var(--text-muted)",
                  fontSize: "0.92rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.12s",
                }}
              >
                {t.label}
                <span style={{
                  padding: "1px 8px", borderRadius: 12,
                  background: isActive ? "rgba(255,255,255,0.25)" : "var(--surface2)",
                  color: isActive ? "white" : "var(--text-dim)",
                  fontSize: "0.78rem", fontWeight: 700,
                }}>{t.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 14, padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "0 0 280px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="搜尋名稱 / 代碼..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="ev-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{ width: 140 }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === "全部" ? "全部類別" : c}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)", fontSize: "0.85rem" }}>
          顯示 {filtered.length} / {suppliersList.length} 筆
        </span>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-title"><i className="bi bi-list-ul" /> 供應商清單</div>
          <div className="card-header-count">共 {filtered.length} 家</div>
        </div>
        <div className="card-body p-0">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 100 }}>代碼</th>
                <th>供應商名稱</th>
                <th style={{ width: 120 }}>類別</th>
                <th style={{ width: 80 }}>評鑑次數</th>
                <th style={{ width: 150, textAlign: "right" }}>最新分數</th>
                <th style={{ width: 90, textAlign: "center" }}>等級</th>
                <th style={{ width: 130 }}>建立日期</th>
                <th style={{ width: 90 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const color = TIER_COLORS[s.tier] ?? "var(--primary)";
                return (
                  <tr key={s.id} style={{ cursor: "pointer" }}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)", fontWeight: 700, fontSize: "0.82rem" }}>
                        {s.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{s.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{s.contact_email}</div>
                    </td>
                    <td><span className="code-pill">{s.category}</span></td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", textAlign: "center" }}>
                      {EVALUATIONS.filter((e) => e.supplier_id === s.id).length}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${s.overall_score}%`, background: color }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem" }}>
                          {s.overall_score.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge tier-${s.tier}`}>{s.tier}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {formatDate(s.created_at)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Link href={`/suppliers/${s.id}`}>
                          <button className="btn" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                            <i className="bi bi-eye" /> 查看
                          </button>
                        </Link>
                        {canEdit && (
                          <button className="btn" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
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
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-dim)" }}>
              <i className="bi bi-search" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
              查無符合條件的供應商
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
