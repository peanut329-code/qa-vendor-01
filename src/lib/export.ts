import type { Supplier, Evaluation, EvaluationScore, Scar, Certification, AuditEvent, AslRecord, SupplierRisk } from "@/types";
import { TIER_LABELS, EVAL_STATUS_LABELS, SCAR_STATUS_LABELS, STATUS_LABELS, CERT_STATUS_LABELS, AUDIT_EVENT_TYPE_LABELS, AUDIT_EVENT_STATUS_LABELS, ASL_STATUS_LABELS, RISK_LEVEL_LABELS } from "@/types";
import { getCertStatus, getDaysUntilExpiry } from "@/lib/utils";
import { EVALUATIONS } from "@/lib/mock-data";

// ── Excel Export (xlsx) ─────────────────────────────────────────────

export async function exportSuppliersToExcel(suppliers: Supplier[]): Promise<void> {
  const XLSX = await import("xlsx");
  const data = suppliers.map((s) => ({
    "供應商代碼": s.code,
    "供應商名稱": s.name,
    "分類": s.category,
    "等級": TIER_LABELS[s.tier],
    "最新分數": s.overall_score,
    "評鑑次數": EVALUATIONS.filter((e) => e.supplier_id === s.id).length,
    "聯絡人": s.contact_name,
    "聯絡電話": s.contact_phone,
    "電子郵件": s.contact_email,
    "地址": s.address,
    "狀態": STATUS_LABELS[s.status],
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [12, 30, 10, 8, 10, 8, 10, 14, 25, 30, 8].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "供應商清單");
  XLSX.writeFile(wb, `供應商清單_${today()}.xlsx`);
}

export async function exportEvaluationToExcel(
  evaluation: Evaluation,
  scores: EvaluationScore[]
): Promise<void> {
  const XLSX = await import("xlsx");
  const infoRows = [
    { "欄位": "供應商", "內容": evaluation.supplier_name },
    { "欄位": "供應商代碼", "內容": evaluation.supplier_code },
    { "欄位": "評鑑期間", "內容": evaluation.period },
    { "欄位": "評鑑人員", "內容": evaluation.evaluator_name },
    { "欄位": "狀態", "內容": EVAL_STATUS_LABELS[evaluation.status] },
    { "欄位": "總分", "內容": evaluation.total_score?.toFixed(1) ?? "—" },
    { "欄位": "等級", "內容": evaluation.tier ? TIER_LABELS[evaluation.tier] : "—" },
    { "欄位": "備註", "內容": evaluation.notes },
  ];
  const scoreRows = scores.map((s) => ({
    "評鑑項目": s.criteria_name,
    "類別": s.category,
    "權重(%)": s.weight,
    "得分": s.score,
    "加權得分": +s.weighted_score.toFixed(2),
    "備註": s.notes,
  }));
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(infoRows);
  ws1["!cols"] = [14, 40].map((w) => ({ wch: w }));
  const ws2 = XLSX.utils.json_to_sheet(scoreRows);
  ws2["!cols"] = [16, 8, 8, 8, 10, 40].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws1, "評鑑資訊");
  XLSX.utils.book_append_sheet(wb, ws2, "詳細分數");
  XLSX.writeFile(wb, `評鑑報告_${evaluation.supplier_code}_${evaluation.period}.xlsx`);
}

export async function exportCertificationsToExcel(certs: Certification[]): Promise<void> {
  const XLSX = await import("xlsx");
  const data = certs.map((c) => {
    const status = getCertStatus(c.expiry_date);
    const days = getDaysUntilExpiry(c.expiry_date);
    return {
      "供應商": c.supplier_name,
      "代碼": c.supplier_code,
      "認證類別": c.cert_type,
      "認證編號": c.cert_number,
      "認證機構": c.issued_by,
      "核發日期": c.issue_date,
      "到期日期": c.expiry_date,
      "剩餘天數": days,
      "狀態": CERT_STATUS_LABELS[status],
      "備註": c.notes,
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [28, 10, 18, 24, 20, 12, 12, 10, 10, 40].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "認證效期清單");
  XLSX.writeFile(wb, `認證效期清單_${today()}.xlsx`);
}

export async function exportAuditEventsToExcel(events: AuditEvent[]): Promise<void> {
  const XLSX = await import("xlsx");
  const data = events.map((e) => ({
    "日期": e.date,
    "事件類型": AUDIT_EVENT_TYPE_LABELS[e.event_type],
    "標題": e.title,
    "供應商": e.supplier_name,
    "代碼": e.supplier_code,
    "狀態": AUDIT_EVENT_STATUS_LABELS[e.status],
    "備註": e.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [12, 12, 32, 28, 10, 12, 40].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "稽核行事曆");
  XLSX.writeFile(wb, `稽核行事曆_${today()}.xlsx`);
}

export async function exportAslToExcel(records: AslRecord[]): Promise<void> {
  const XLSX = await import("xlsx");
  const data = records.map((r) => ({
    "供應商代碼": r.supplier_code,
    "供應商名稱": r.supplier_name,
    "類別": r.category,
    "核准範圍": r.scope,
    "狀態": ASL_STATUS_LABELS[r.status],
    "核准人員": r.approved_by,
    "核准日期": r.approved_date,
    "有效期限": r.valid_until,
    "下次複評": r.review_date,
    "附帶條件": r.conditions || "—",
    "備註": r.notes,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [10, 28, 10, 40, 8, 10, 12, 12, 12, 40, 40].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "合格供應商名單 ASL");
  XLSX.writeFile(wb, `合格供應商名單_ASL_${today()}.xlsx`);
}

export async function exportRiskToExcel(risks: SupplierRisk[]): Promise<void> {
  const XLSX = await import("xlsx");
  const data = risks.map((r) => ({
    "供應商代碼": r.supplier_code,
    "供應商名稱": r.supplier_name,
    "類別": r.category,
    "評鑑等級": TIER_LABELS[r.tier],
    "發生可能性 (L)": r.likelihood,
    "影響程度 (I)": r.impact,
    "風險分數": r.risk_score,
    "風險等級": RISK_LEVEL_LABELS[r.risk_level],
    "主要風險因子": r.risk_factors.join("；"),
    "緩解措施": r.mitigation,
    "負責人": r.owner,
    "最後複評日": r.last_reviewed,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [10, 28, 10, 8, 12, 12, 10, 8, 50, 40, 8, 12].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "風險評估矩陣");
  XLSX.writeFile(wb, `風險評估矩陣_${today()}.xlsx`);
}

export async function exportScarsToExcel(scars: Scar[]): Promise<void> {
  const XLSX = await import("xlsx");
  const data = scars.map((s) => ({
    "SCAR 編號": s.scar_number,
    "供應商": s.supplier_name,
    "代碼": s.supplier_code,
    "觸發分數": s.triggered_score,
    "觸發等級": TIER_LABELS[s.triggered_tier],
    "問題描述": s.issue_description,
    "類別": s.category,
    "根本原因": s.root_cause,
    "矯正措施": s.corrective_action,
    "目標完成日": s.target_date,
    "驗證日期": s.verified_date ?? "—",
    "狀態": SCAR_STATUS_LABELS[s.status],
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [16, 28, 10, 10, 8, 40, 8, 40, 40, 12, 12, 8].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SCAR 清單");
  XLSX.writeFile(wb, `SCAR清單_${today()}.xlsx`);
}

// ── PDF (Browser Print) ─────────────────────────────────────────────

const BASE_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; font-size: 13px; color: #1E3A5F; line-height: 1.6; padding: 20px; }
  h1 { font-size: 20px; color: #1E3A5F; font-weight: 800; }
  h2 { font-size: 13px; color: #5B8FD9; font-weight: 700; border-bottom: 1.5px solid #C5D8F0; padding-bottom: 5px; margin: 18px 0 10px; }
  .subtitle { color: #5F7A9B; font-size: 11px; margin-top: 2px; }
  .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 16px; margin: 14px 0; background: #F7FAFF; border: 1px solid #EAF1FB; border-radius: 8px; padding: 12px 16px; }
  .meta-label { font-size: 10px; color: #5F7A9B; margin-bottom: 2px; }
  .meta-value { font-weight: 600; font-size: 13px; }
  .score-hero { font-size: 32px; font-weight: 800; }
  .tier-badge { display: inline-block; padding: 2px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; margin-left: 8px; }
  .tier-A { background: #D1FAE5; color: #065F46; }
  .tier-B { background: #DBEAFE; color: #1E40AF; }
  .tier-C { background: #FEF3C7; color: #92400E; }
  .tier-D { background: #FEE2E2; color: #991B1B; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
  thead { background: #EDF3FA; }
  th { padding: 7px 10px; text-align: left; color: #5B8FD9; font-size: 11px; font-weight: 600; }
  td { padding: 7px 10px; border-bottom: 1px solid #EAF1FB; vertical-align: top; }
  .total-row { background: #EDF3FA; font-weight: 700; }
  .notes-box { background: #F7FAFF; border: 1px solid #EAF1FB; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #5F7A9B; white-space: pre-wrap; }
  .footer { margin-top: 32px; border-top: 1px solid #EAF1FB; padding-top: 10px; text-align: center; font-size: 10px; color: #94AEC8; }
  @media print { body { padding: 0; } @page { margin: 15mm; } }
`;

export function printEvaluationReport(
  evaluation: Evaluation,
  scores: EvaluationScore[]
): void {
  const total = scores.reduce((a, s) => a + s.weighted_score, 0);
  const html = `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8">
  <title>評鑑報告 — ${evaluation.supplier_name}</title>
  <style>${BASE_STYLE}</style></head><body>
  <h1>供應商評鑑報告</h1>
  <div class="subtitle">QA Vendor Evaluation System ｜ Designed &amp; Developed by Lingo｜2026</div>

  <div class="meta-grid">
    <div><div class="meta-label">供應商名稱</div><div class="meta-value">${evaluation.supplier_name}</div></div>
    <div><div class="meta-label">供應商代碼</div><div class="meta-value">${evaluation.supplier_code}</div></div>
    <div><div class="meta-label">評鑑期間</div><div class="meta-value">${evaluation.period}</div></div>
    <div><div class="meta-label">評鑑人員</div><div class="meta-value">${evaluation.evaluator_name}</div></div>
    <div><div class="meta-label">評鑑狀態</div><div class="meta-value">${EVAL_STATUS_LABELS[evaluation.status]}</div></div>
    <div>
      <div class="meta-label">總分 / 等級</div>
      <div class="meta-value">
        <span class="score-hero">${evaluation.total_score?.toFixed(1) ?? "—"}</span>
        ${evaluation.tier ? `<span class="tier-badge tier-${evaluation.tier}">${TIER_LABELS[evaluation.tier]}</span>` : ""}
      </div>
    </div>
  </div>

  <h2>評鑑明細</h2>
  <table>
    <thead><tr><th>#</th><th>評鑑項目</th><th>類別</th><th>權重</th><th>得分</th><th>加權得分</th><th>備註</th></tr></thead>
    <tbody>
      ${scores.map((s, i) => `
        <tr>
          <td style="color:#94AEC8">${i + 1}</td>
          <td><strong>${s.criteria_name}</strong></td>
          <td>${s.category}</td>
          <td>${s.weight}%</td>
          <td><strong>${s.score}</strong></td>
          <td>${s.weighted_score.toFixed(2)}</td>
          <td style="color:#5F7A9B;font-size:11px">${s.notes || "—"}</td>
        </tr>`).join("")}
      <tr class="total-row">
        <td colspan="5" style="text-align:right">合計</td>
        <td>${total.toFixed(2)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  ${evaluation.notes ? `<h2>評鑑備註</h2><div class="notes-box">${evaluation.notes}</div>` : ""}

  <div class="footer">
    列印時間：${new Date().toLocaleString("zh-TW")} ｜ Designed &amp; Developed by Lingo｜2026
  </div>
  </body></html>`;

  openPrintWindow(html);
}

export function printScarReport(scar: Scar): void {
  const html = `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8">
  <title>SCAR 報告 — ${scar.scar_number}</title>
  <style>${BASE_STYLE}</style></head><body>
  <h1>矯正行動要求（SCAR）</h1>
  <div class="subtitle">QA Vendor Evaluation System ｜ Designed &amp; Developed by Lingo｜2026</div>

  <div class="meta-grid">
    <div><div class="meta-label">SCAR 編號</div><div class="meta-value">${scar.scar_number}</div></div>
    <div><div class="meta-label">供應商</div><div class="meta-value">${scar.supplier_name}</div></div>
    <div><div class="meta-label">供應商代碼</div><div class="meta-value">${scar.supplier_code}</div></div>
    <div><div class="meta-label">觸發分數</div><div class="meta-value score-hero">${scar.triggered_score}</div></div>
    <div><div class="meta-label">觸發等級</div><div class="meta-value"><span class="tier-badge tier-${scar.triggered_tier}">${TIER_LABELS[scar.triggered_tier]}</span></div></div>
    <div><div class="meta-label">目前狀態</div><div class="meta-value">${SCAR_STATUS_LABELS[scar.status]}</div></div>
    <div><div class="meta-label">問題類別</div><div class="meta-value">${scar.category}</div></div>
    <div><div class="meta-label">目標完成日</div><div class="meta-value">${scar.target_date}</div></div>
    <div><div class="meta-label">驗證日期</div><div class="meta-value">${scar.verified_date ?? "尚未驗證"}</div></div>
  </div>

  <h2>問題描述</h2>
  <div class="notes-box">${scar.issue_description}</div>

  <h2>根本原因分析</h2>
  <div class="notes-box">${scar.root_cause}</div>

  <h2>矯正措施計畫</h2>
  <div class="notes-box" style="white-space:pre-wrap">${scar.corrective_action}</div>

  <div class="footer">
    列印時間：${new Date().toLocaleString("zh-TW")} ｜ Designed &amp; Developed by Lingo｜2026
  </div>
  </body></html>`;

  openPrintWindow(html);
}

// ── Helper ──────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function openPrintWindow(html: string): void {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("請允許彈出視窗以便列印 PDF");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 800);
}
