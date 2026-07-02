import type {
  User, Supplier, Evaluation, EvaluationCriteria, MonthlyTrend, EvaluationScore, Scar,
  Certification, AuditEvent, AslRecord, SupplierRisk
} from "@/types";

// ================================================================
// 登入帳號
// ================================================================
export const LOGIN_ACCOUNTS = [
  { username: "admin01@qa-vendor.com",      password: "qa16949",        userId: "u1" },
  { username: "viewer@qa-vendor.com",       password: "viewer",         userId: "u2" },
  { username: "visit06@qa-vendor.com",      password: "visit06",        userId: "u7" },
  { username: "lin.yating@qa-vendor.com",    password: "lin.yating",     userId: "u3" },
  { username: "wang.jianguo@qa-vendor.com",  password: "wang.jianguo",   userId: "u4" },
  { username: "li.meiling@qa-vendor.com",    password: "li.meiling",     userId: "u5" },
  { username: "zhang.weicheng@qa-vendor.com",password: "zhang.weicheng", userId: "u6" },
];

// ================================================================
// 使用者清單
// ================================================================
export const DEMO_USERS: User[] = [
  { id: "u1", full_name: "系統管理員", email: "admin01@qa-vendor.com", role: "super_admin", department: "系統管理" },
  { id: "u2", full_name: "唯讀觀察者", email: "viewer@qa-vendor.com",  role: "viewer",     department: "管理部"   },
  { id: "u3", full_name: "林雅婷",    email: "lin.yating@qa-vendor.com",    role: "admin",     department: "採購部"   },
  { id: "u4", full_name: "王建國",    email: "wang.jianguo@qa-vendor.com",  role: "manager",   department: "品質部"   },
  { id: "u5", full_name: "李美玲",    email: "li.meiling@qa-vendor.com",    role: "evaluator", department: "採購部"   },
  { id: "u6", full_name: "張偉誠",    email: "zhang.weicheng@qa-vendor.com",role: "evaluator", department: "品質部"   },
  { id: "u7", full_name: "visit06",  email: "visit06@qa-vendor.com",       role: "viewer",    department: "訪客"     },
];

// ================================================================
// 供應商 — 5 家半導體產業範例
// ================================================================
export const SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    code: "SUP-001",
    name: "品晶半導體材料股份有限公司",
    category: "矽晶圓",
    tier: "A",
    overall_score: 93.2,
    eval_count: 6,
    contact_name: "吳昌諺",
    contact_email: "wu.cy@pinjing-semi.com",
    contact_phone: "03-5678-9012",
    address: "新竹科學園區力行一路 88 號",
    status: "active",
    created_at: "2021-06-01T08:00:00Z",
  },
  {
    id: "s2",
    code: "SUP-002",
    name: "正鑫特殊氣體有限公司",
    category: "特殊氣體",
    tier: "A",
    overall_score: 91.5,
    eval_count: 8,
    contact_name: "陳佳蓉",
    contact_email: "chen.jr@chengxin-gas.com",
    contact_phone: "03-3456-7890",
    address: "桃園市觀音區工業一路 120 號",
    status: "active",
    created_at: "2020-09-15T08:00:00Z",
  },
  {
    id: "s3",
    code: "SUP-003",
    name: "光揚光罩科技股份有限公司",
    category: "光罩製造",
    tier: "B",
    overall_score: 84.0,
    eval_count: 5,
    contact_name: "蔡志明",
    contact_email: "tsai.zm@guangyang-mask.com",
    contact_phone: "03-5789-0123",
    address: "新竹縣竹東鎮中興路四段 350 號",
    status: "active",
    created_at: "2022-03-10T08:00:00Z",
  },
  {
    id: "s4",
    code: "SUP-004",
    name: "精密封測服務股份有限公司",
    category: "封裝測試",
    tier: "B",
    overall_score: 79.5,
    eval_count: 4,
    contact_name: "黃怡君",
    contact_email: "huang.yj@jingmi-osat.com",
    contact_phone: "06-234-5678",
    address: "台南市南科園區南科三路 60 號",
    status: "active",
    created_at: "2022-07-20T08:00:00Z",
  },
  {
    id: "s5",
    code: "SUP-005",
    name: "先進製程化學品股份有限公司",
    category: "製程化學品",
    tier: "C",
    overall_score: 67.0,
    eval_count: 3,
    contact_name: "林博仁",
    contact_email: "lin.br@advanced-chem.com",
    contact_phone: "04-2345-9876",
    address: "台中市西屯區工業區十二路 25 號",
    status: "active",
    created_at: "2023-01-05T08:00:00Z",
  },
];

// ================================================================
// 評鑑紀錄
// ================================================================
export const EVALUATIONS: Evaluation[] = [
  // --- SUP-001 品晶半導體材料 ---
  {
    id: "e1",
    supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2026-Q2",
    status: "approved", total_score: 94.5, tier: "A",
    notes: "矽晶圓品質穩定，TTV ≤ 1.5 μm，良率達標，準時交貨率 99.2%。",
    created_at: "2026-05-08T09:00:00Z", updated_at: "2026-05-22T14:00:00Z",
  },
  {
    id: "e2",
    supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2026-Q1",
    status: "approved", total_score: 92.0, tier: "A",
    notes: "12 吋晶圓缺陷密度表現優異，持續列為 A 級供應商。",
    created_at: "2026-02-10T09:00:00Z", updated_at: "2026-02-28T14:00:00Z",
  },

  // --- SUP-002 正鑫特殊氣體 ---
  {
    id: "e3",
    supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2026-Q2",
    status: "approved", total_score: 92.8, tier: "A",
    notes: "NF₃ 純度 ≥ 99.9999%，運送安全紀錄優良，緊急補貨回應 ≤ 4 小時。",
    created_at: "2026-05-10T09:00:00Z", updated_at: "2026-05-25T14:00:00Z",
  },
  {
    id: "e4",
    supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2026-Q1",
    status: "approved", total_score: 90.2, tier: "A",
    notes: "特殊氣體品質穩定，ISO 45001 安衛認證在效。",
    created_at: "2026-02-12T09:00:00Z", updated_at: "2026-03-02T14:00:00Z",
  },

  // --- SUP-003 光揚光罩科技 ---
  {
    id: "e5",
    supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2026-Q2",
    status: "completed", total_score: 85.5, tier: "B",
    notes: "DUV 光罩 CD 精度達標，交期延誤 2 次，建議加強產能規劃。",
    created_at: "2026-05-14T09:00:00Z", updated_at: "2026-06-03T14:00:00Z",
  },
  {
    id: "e6",
    supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2026-Q1",
    status: "approved", total_score: 82.5, tier: "B",
    notes: "EUV 光罩缺陷修補能力提升，整體進步明顯。",
    created_at: "2026-02-15T09:00:00Z", updated_at: "2026-03-05T14:00:00Z",
  },

  // --- SUP-004 精密封測服務 ---
  {
    id: "e7",
    supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2026-Q2",
    status: "in_progress", total_score: null, tier: null,
    notes: "",
    created_at: "2026-06-05T09:00:00Z", updated_at: "2026-06-05T09:00:00Z",
  },
  {
    id: "e8",
    supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2026-Q1",
    status: "approved", total_score: 79.5, tier: "B",
    notes: "Flip-Chip 良率達 98.6%，Burn-In 測試覆蓋率略低，需改善。",
    created_at: "2026-02-18T09:00:00Z", updated_at: "2026-03-08T14:00:00Z",
  },

  // --- SUP-005 先進製程化學品 ---
  {
    id: "e9",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2026-Q2",
    status: "draft", total_score: null, tier: null,
    notes: "",
    created_at: "2026-06-10T09:00:00Z", updated_at: "2026-06-10T09:00:00Z",
  },
  {
    id: "e10",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2026-Q1",
    status: "approved", total_score: 67.0, tier: "C",
    notes: "CMP 漿料批次均一性不足，光阻劑黏度偏差超標 3 次，已發 SCAR 要求改善。",
    created_at: "2026-02-20T09:00:00Z", updated_at: "2026-03-10T14:00:00Z",
  },
];

// ================================================================
// 評鑑指標
// ================================================================
export const CRITERIA: EvaluationCriteria[] = [
  { id: "c1", name: "品質合格率",   category: "品質", weight: 20, max_score: 100, description: "製程材料合格率與批退率",                 is_active: true, sort_order: 1 },
  { id: "c2", name: "交貨準時率",   category: "交期", weight: 20, max_score: 100, description: "依約定日期準時交貨比例（含緊急訂單）",   is_active: true, sort_order: 2 },
  { id: "c3", name: "價格競爭力",   category: "價格", weight: 15, max_score: 100, description: "市場報價合理性與年度降價承諾履行率",       is_active: true, sort_order: 3 },
  { id: "c4", name: "服務回應速度", category: "服務", weight: 10, max_score: 100, description: "技術諮詢、緊急支援、客訴處理效率",         is_active: true, sort_order: 4 },
  { id: "c5", name: "技術能力",     category: "技術", weight: 10, max_score: 100, description: "製程改善能力、技術路線圖完整性",           is_active: true, sort_order: 5 },
  { id: "c6", name: "品質管理系統", category: "品質", weight: 10, max_score: 100, description: "IATF 16949 / ISO 9001 認證、SPC 管制",   is_active: true, sort_order: 6 },
  { id: "c7", name: "財務穩定性",   category: "財務", weight: 10, max_score: 100, description: "資本額、信用評等、BCP 計畫完整性",         is_active: true, sort_order: 7 },
  { id: "c8", name: "環保合規性",   category: "合規", weight:  5, max_score: 100, description: "RoHS / REACH / ESG 合規，廢氣廢水達標",  is_active: true, sort_order: 8 },
];

// ================================================================
// 各評鑑詳細分數（按評鑑 ID 索引）
// ================================================================
export const EVALUATION_SCORES: Record<string, EvaluationScore[]> = {
  // e1 — 品晶半導體 Q1-2025  total ≈ 94.5
  e1: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 95, weighted_score: 19.0, notes: "矽晶圓 TTV 均一性 ≤ 1.5μm，批退率 0.3%，表現優異" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 97, weighted_score: 19.4, notes: "準時交貨率 99.2%，緊急備貨回應迅速" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 90, weighted_score: 13.5, notes: "年降價 2%，報價合理且透明" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 95, weighted_score: 9.5,  notes: "技術諮詢 SLA 4h 達成率 100%" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 96, weighted_score: 9.6,  notes: "8吋→12吋製程延伸技術領先業界" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 94, weighted_score: 9.4,  notes: "IATF 16949 認證有效，SPC 全面導入" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 93, weighted_score: 9.3,  notes: "資本額 5 億，信用評等 A" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 97, weighted_score: 4.85, notes: "ISO 14001 認證，廢水排放達標" },
  ],
  // e2 — 品晶半導體 Q4-2024  total ≈ 92.0
  e2: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 93, weighted_score: 18.6, notes: "12吋晶圓缺陷密度 ≤ 0.08 個/cm²" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 94, weighted_score: 18.8, notes: "Q4 準時交貨率 98.5%" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 88, weighted_score: 13.2, notes: "年降價 1.8%，合約執行穩定" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 92, weighted_score: 9.2,  notes: "客訴處理平均 2 天結案" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 94, weighted_score: 9.4,  notes: "EUV 光罩製程技術配合良好" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 91, weighted_score: 9.1,  notes: "SPC 管制圖完整，Cpk ≥ 1.67" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 92, weighted_score: 9.2,  notes: "財務健全，BCP 計畫完備" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 95, weighted_score: 4.75, notes: "碳盤查報告完整，ESG 達標" },
  ],
  // e3 — 正鑫特殊氣體 Q1-2025  total ≈ 92.8
  e3: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 96, weighted_score: 19.2, notes: "NF₃ 純度 ≥ 99.9999%，批次均一性優" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 94, weighted_score: 18.8, notes: "緊急補貨 ≤ 4h，準時率 98.8%" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 88, weighted_score: 13.2, notes: "長約鎖價，氣體成本波動控制良好" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 97, weighted_score: 9.7,  notes: "24hr 緊急支援，設置專屬服務窗口" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 92, weighted_score: 9.2,  notes: "低溫製程氣體研發能力業界領先" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 93, weighted_score: 9.3,  notes: "ISO 45001 安衛認證有效" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 90, weighted_score: 9.0,  notes: "資本額 3 億，財務穩定" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 97, weighted_score: 4.85, notes: "危險物品運輸 SOP 完善，無事故記錄" },
  ],
  // e4 — 正鑫特殊氣體 Q4-2024  total ≈ 90.3
  e4: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 91, weighted_score: 18.2, notes: "氣體純度穩定，無重大批退紀錄" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 93, weighted_score: 18.6, notes: "Q4 準時交貨率 97.2%" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 87, weighted_score: 13.05, notes: "年降價 1.5%，合理範圍" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 90, weighted_score: 9.0,  notes: "響應速度良好，平均 3h 回覆" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 89, weighted_score: 8.9,  notes: "技術路線圖完整，配合度高" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 90, weighted_score: 9.0,  notes: "ISO 45001 在效，SPC 管制正常" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 88, weighted_score: 8.8,  notes: "財務健全，無負面信用記錄" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 95, weighted_score: 4.75, notes: "廢氣處理合規，符合法規要求" },
  ],
  // e5 — 光揚光罩科技 Q1-2025  total ≈ 85.5
  e5: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 87, weighted_score: 17.4, notes: "DUV 光罩 CD 精度 ±3nm，良率 97.5%" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 80, weighted_score: 16.0, notes: "交期延誤 2 次，共延遲 8 工作天，需改善" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 85, weighted_score: 12.75, notes: "報價合理，但年降不足 1%" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 88, weighted_score: 8.8,  notes: "技術支援配合良好，平均 1 天回覆" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 90, weighted_score: 9.0,  notes: "EUV 光罩缺陷修補能力明顯提升" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 87, weighted_score: 8.7,  notes: "ISO 9001 認證有效，SPC 部分導入" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 86, weighted_score: 8.6,  notes: "財務狀況穩定" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 90, weighted_score: 4.5,  notes: "環保合規，廢液處理符合標準" },
  ],
  // e6 — 光揚光罩科技 Q4-2024  total ≈ 83.3
  e6: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 84, weighted_score: 16.8, notes: "光罩缺陷修補率 95%，品質穩定" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 79, weighted_score: 15.8, notes: "交期略有延誤，改善行動進行中" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 82, weighted_score: 12.3, notes: "報價合理性普通，議價空間有限" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 85, weighted_score: 8.5,  notes: "技術諮詢回應約 2 天" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 88, weighted_score: 8.8,  notes: "EUV 光罩技術配合度良好" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 83, weighted_score: 8.3,  notes: "品質系統待加強，SPC 覆蓋率 60%" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 84, weighted_score: 8.4,  notes: "財務狀況穩定，無重大風險" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 88, weighted_score: 4.4,  notes: "環保合規，符合法規要求" },
  ],
  // e8 — 精密封測服務 Q4-2024  total ≈ 80.15
  e8: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 82, weighted_score: 16.4, notes: "Flip-Chip 良率 98.6%，Burn-In 覆蓋率 85.3% 偏低" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 76, weighted_score: 15.2, notes: "準時交貨率 93.2%，部分急單延誤" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 78, weighted_score: 11.7, notes: "價格競爭力普通，高於市場均價 5%" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 82, weighted_score: 8.2,  notes: "客訴響應平均 3 天，略慢" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 84, weighted_score: 8.4,  notes: "CoWoS 先進封裝技術能力中等" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 80, weighted_score: 8.0,  notes: "AEC-Q102 認證取得中，尚未完成" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 80, weighted_score: 8.0,  notes: "財務狀況穩定，資本額充足" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 85, weighted_score: 4.25, notes: "廢水排放合規，符合環保法規" },
  ],
  // e10 — 先進製程化學品 Q4-2024  total = 67.0
  e10: [
    { criteria_id: "c1", criteria_name: "品質合格率",   category: "品質", weight: 20, score: 60, weighted_score: 12.0, notes: "CMP漿料黏度偏差>±8%，超標3次，嚴重影響製程均一性" },
    { criteria_id: "c2", criteria_name: "交貨準時率",   category: "交期", weight: 20, score: 72, weighted_score: 14.4, notes: "準時交貨率 88%，缺貨 2 次影響產線" },
    { criteria_id: "c3", criteria_name: "價格競爭力",   category: "價格", weight: 15, score: 70, weighted_score: 10.5, notes: "報價高於市場均價，年降承諾未履行" },
    { criteria_id: "c4", criteria_name: "服務回應速度", category: "服務", weight: 10, score: 65, weighted_score: 6.5,  notes: "問題響應慢，平均 5 天才回覆" },
    { criteria_id: "c5", criteria_name: "技術能力",     category: "技術", weight: 10, score: 62, weighted_score: 6.2,  notes: "配方調整週期過長，技術改善能力不足" },
    { criteria_id: "c6", criteria_name: "品質管理系統", category: "品質", weight: 10, score: 68, weighted_score: 6.8,  notes: "SPC 管制導入率僅 40%，遠低於要求" },
    { criteria_id: "c7", criteria_name: "財務穩定性",   category: "財務", weight: 10, score: 80, weighted_score: 8.0,  notes: "財務狀況尚可，無重大負債" },
    { criteria_id: "c8", criteria_name: "環保合規性",   category: "合規", weight:  5, score: 52, weighted_score: 2.6,  notes: "廢液處理未達標，已接獲環保局警告" },
  ],
};

// ================================================================
// SCAR 矯正行動要求
// ================================================================
export const SCARS: Scar[] = [
  {
    id: "sc1",
    scar_number: "SCAR-2025-001",
    supplier_id: "s5",
    supplier_name: "先進製程化學品股份有限公司",
    supplier_code: "SUP-005",
    evaluation_id: "e10",
    triggered_score: 67.0,
    triggered_tier: "C",
    issue_description: "CMP 漿料批次均一性不足，光阻劑黏度偏差超標 3 次（偏差 >±8%），嚴重影響 CMP 製程均一性，造成晶圓良率損失約 1.2%。",
    category: "品質",
    root_cause: "供應商原料倉儲溫濕度控制不當，導致漿料特性不穩定；配方管制程序（SOP）未落實，操作人員未遵守標準作業流程，批次間差異持續擴大。",
    corrective_action: "1. 改善倉儲環境，新增溫濕度自動監控系統（完成率 80%）\n2. 重新培訓操作人員，強化 SOP 執行力（已完成）\n3. 增加出廠前批次抽驗頻率，由每批 1 次改為 5 次（執行中）\n4. 導入 SPC 管制圖即時監控黏度變化（導入率 60%）",
    target_date: "2025-05-15",
    verified_date: null,
    status: "in_progress",
    created_by: "u6",
    created_at: "2024-11-05T10:00:00Z",
    updated_at: "2025-01-15T14:00:00Z",
  },
  {
    id: "sc2",
    scar_number: "SCAR-2025-002",
    supplier_id: "s4",
    supplier_name: "精密封測服務股份有限公司",
    supplier_code: "SUP-004",
    evaluation_id: "e8",
    triggered_score: 79.5,
    triggered_tier: "B",
    issue_description: "Burn-In 測試覆蓋率不足，實測覆蓋率僅 85.3%，低於合約規定的 100% 覆蓋率標準，未測試項目涉及高溫老化及電氣特性測試。",
    category: "品質",
    root_cause: "測試設備產能不足，在高訂單量時無法完成全量測試；測試程式版本未及時更新，未涵蓋新型封裝（Flip-Chip BGA）的測試向量，導致覆蓋缺口。",
    corrective_action: "1. 新增 3 台 Burn-In 測試爐，擴充產能（已完成，2024-12-20）\n2. 更新測試程式，確保覆蓋所有封裝類型（已完成，2024-12-28）\n3. 建立測試覆蓋率週報回報機制（已完成，2025-01-05）\n4. 現場稽核確認改善成效（已驗證，覆蓋率達 99.8%）",
    target_date: "2025-06-20",
    verified_date: "2025-01-10",
    status: "closed",
    created_by: "u6",
    created_at: "2024-11-02T10:00:00Z",
    updated_at: "2025-01-10T16:00:00Z",
  },
  {
    id: "sc3",
    scar_number: "SCAR-2025-003",
    supplier_id: "s3",
    supplier_name: "光揚光罩科技股份有限公司",
    supplier_code: "SUP-003",
    evaluation_id: "e6",
    triggered_score: 82.5,
    triggered_tier: "B",
    issue_description: "Q4 交期延誤 2 次，延誤時間分別為 5 天及 3 天，超出合約允許的 1 個工作天緩衝，直接影響公司晶圓投片計畫。",
    category: "交期",
    root_cause: "光罩版頻繁工程變更（ECO），導致生產排程衝突；空白基板（Blank Mask）來料管理不善，安全庫存不足，庫存耗盡後造成生產中斷 3 天。",
    corrective_action: "1. 建立 ECO 變更影響評估機制，提前通知交期風險（已完成）\n2. 提高空白基板安全庫存至 3 週用量（庫存已補充至標準）\n3. 設立客戶端交期預警系統，提前 2 週通報可能延誤（已上線）\n4. 現場驗證：Q1-2025 交期達成率 100%，確認改善有效",
    target_date: "2025-04-10",
    verified_date: "2025-01-05",
    status: "verified",
    created_by: "u5",
    created_at: "2024-10-31T10:00:00Z",
    updated_at: "2025-01-05T11:00:00Z",
  },
];

// ================================================================
// 月度趨勢（近 6 個月）
// ================================================================
export const MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: "2024-09", avg_score: 80.4, eval_count: 2 },
  { month: "2024-10", avg_score: 82.1, eval_count: 4 },
  { month: "2024-11", avg_score: 78.8, eval_count: 2 },
  { month: "2024-12", avg_score: 83.5, eval_count: 3 },
  { month: "2025-01", avg_score: 87.6, eval_count: 3 },
  { month: "2025-02", avg_score: 76.2, eval_count: 2 },
];

// ================================================================
// 等級分佈
// ================================================================
export const TIER_DISTRIBUTION = [
  { tier: "A 優選", count: 2, color: "#22C55E" },
  { tier: "B 合格", count: 2, color: "#5B8FD9" },
  { tier: "C 觀察", count: 1, color: "#F59E0B" },
  { tier: "D 不合格", count: 0, color: "#EF4444" },
];

// ================================================================
// 各指標平均分數
// ================================================================
export const CATEGORY_SCORES = [
  { category: "品質", avg: 86.5 },
  { category: "交期", avg: 83.2 },
  { category: "價格", avg: 80.4 },
  { category: "服務", avg: 82.0 },
  { category: "技術", avg: 88.1 },
  { category: "財務", avg: 84.6 },
  { category: "合規", avg: 90.2 },
];

// ================================================================
// 認證效期（14 筆，基準日 2026-05-21）
// ================================================================
export const CERTIFICATIONS: Certification[] = [
  // ── SUP-001 品晶半導體材料 ──
  {
    id: "cert-01", supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    cert_type: "IATF 16949:2016", cert_number: "TUV-16949-2024-0715",
    issued_by: "TÜV Rheinland", issue_date: "2024-07-01", expiry_date: "2027-06-30",
    notes: "汽車零件品質管理系統，三年效期，下次複審 2027-01",
  },
  {
    id: "cert-02", supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    cert_type: "ISO 9001:2015", cert_number: "BSI-9001-2023-1201",
    issued_by: "BSI Group", issue_date: "2023-12-01", expiry_date: "2026-07-31",
    notes: "品質管理系統，距到期 71 天，需安排複審作業",
  },
  {
    id: "cert-03", supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    cert_type: "ISO 14001:2015", cert_number: "SGS-14001-2023-0620",
    issued_by: "SGS Taiwan", issue_date: "2023-06-20", expiry_date: "2026-06-20",
    notes: "環境管理系統，距到期約 30 天，請即刻安排複查",
  },

  // ── SUP-002 正鑫特殊氣體 ──
  {
    id: "cert-04", supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    cert_type: "ISO 45001:2018", cert_number: "BV-45001-2024-0401",
    issued_by: "Bureau Veritas", issue_date: "2024-04-01", expiry_date: "2027-03-31",
    notes: "職業健康安全管理系統，特殊氣體作業必要認證",
  },
  {
    id: "cert-05", supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    cert_type: "ISO 9001:2015", cert_number: "DNV-9001-2023-1215",
    issued_by: "DNV GL", issue_date: "2023-12-15", expiry_date: "2026-12-31",
    notes: "品質管理系統，有效期至年底",
  },
  {
    id: "cert-06", supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    cert_type: "ISO 14001:2015", cert_number: "SGS-14001-2022-1130",
    issued_by: "SGS Taiwan", issue_date: "2022-12-01", expiry_date: "2025-11-30",
    notes: "⚠️ 已過期！上次複審未通過，需重新申請認證",
  },

  // ── SUP-003 光揚光罩科技 ──
  {
    id: "cert-07", supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    cert_type: "ISO 9001:2015", cert_number: "TUV-9001-2023-0901",
    issued_by: "TÜV SÜD", issue_date: "2023-09-01", expiry_date: "2026-08-15",
    notes: "品質管理系統，距到期約 86 天，建議 7 月前安排複審",
  },
  {
    id: "cert-08", supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    cert_type: "ISO/IEC 17025:2017", cert_number: "TAF-17025-2023-0710",
    issued_by: "全國認證基金會 TAF", issue_date: "2023-07-10", expiry_date: "2026-07-10",
    notes: "檢測校正實驗室認證，距到期約 50 天",
  },

  // ── SUP-004 精密封測服務 ──
  {
    id: "cert-09", supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    cert_type: "IATF 16949:2016", cert_number: "BSI-16949-2024-0201",
    issued_by: "BSI Group", issue_date: "2024-02-01", expiry_date: "2027-01-31",
    notes: "汽車封裝測試品質管理系統",
  },
  {
    id: "cert-10", supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    cert_type: "AEC-Q102", cert_number: "AEC-Q102-2023-0630",
    issued_by: "AEC Committee", issue_date: "2023-07-01", expiry_date: "2027-06-30",
    notes: "汽車電子離散光電元件可靠度標準，效期充裕",
  },
  {
    id: "cert-11", supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    cert_type: "ISO 9001:2015", cert_number: "DNV-9001-2024-0401",
    issued_by: "DNV GL", issue_date: "2024-04-01", expiry_date: "2027-03-31",
    notes: "品質管理系統，效期充裕",
  },

  // ── SUP-005 先進製程化學品 ──
  {
    id: "cert-12", supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    cert_type: "ISO 9001:2015", cert_number: "SGS-9001-2022-0930",
    issued_by: "SGS Taiwan", issue_date: "2022-10-01", expiry_date: "2027-09-30",
    notes: "品質管理系統，配合改善計畫已完成更新",
  },
  {
    id: "cert-13", supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    cert_type: "RoHS 合規聲明", cert_number: "ROHS-2023-SUP005-0615",
    issued_by: "第三方驗證機構", issue_date: "2023-06-15", expiry_date: "2026-06-10",
    notes: "限制有害物質合規聲明，距到期約 20 天，需立即安排更新",
  },
  {
    id: "cert-14", supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    cert_type: "ISO 14001:2015", cert_number: "BV-14001-2024-0201",
    issued_by: "Bureau Veritas", issue_date: "2024-02-01", expiry_date: "2027-01-31",
    notes: "環境管理系統，2024 年重新取得，效期充裕",
  },
];

// ================================================================
// 稽核行事曆事件（基準日 2026-05-21）
// ================================================================
export const AUDIT_EVENTS: AuditEvent[] = [
  // ── 五月（本月）──
  {
    id: "ae-01", title: "先進製程化學品 SCAR 進度確認",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    event_type: "audit_visit", date: "2026-05-28", status: "scheduled",
    notes: "確認 SCAR-2025-001 SPC 導入進度，目標覆蓋率達 80%",
    related_id: "sc1",
  },
  {
    id: "ae-02", title: "年度評鑑計畫審查會議",
    supplier_id: "", supplier_name: "（全體）", supplier_code: "",
    event_type: "audit_visit", date: "2026-05-30", status: "scheduled",
    notes: "品質部與採購部聯合審查 Q2 評鑑排程與資源分配",
  },

  // ── 六月 ──
  {
    id: "ae-03", title: "精密封測服務 Q2-2026 評鑑",
    supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    event_type: "evaluation", date: "2026-06-03", status: "scheduled",
    notes: "重點追蹤 Burn-In 覆蓋率改善成效，評鑑人：張偉誠",
  },
  {
    id: "ae-04", title: "RoHS 合規聲明到期 — 先進製程化學品",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    event_type: "cert_review", date: "2026-06-10", status: "scheduled",
    notes: "RoHS 合規聲明有效期屆滿，需提交更新文件",
    related_id: "cert-13",
  },
  {
    id: "ae-05", title: "品晶半導體材料 Q2-2026 評鑑",
    supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    event_type: "evaluation", date: "2026-06-12", status: "scheduled",
    notes: "例行季評，評鑑人：李美玲",
  },
  {
    id: "ae-06", title: "ISO 14001 到期複查 — 品晶半導體材料",
    supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    event_type: "cert_review", date: "2026-06-20", status: "scheduled",
    notes: "ISO 14001:2015 有效期屆滿，已排定稽核機構到場複審",
    related_id: "cert-03",
  },
  {
    id: "ae-07", title: "AEC-Q102 到期複查 — 精密封測服務",
    supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    event_type: "cert_review", date: "2026-06-30", status: "scheduled",
    notes: "AEC-Q102 汽車電子可靠度認證屆滿，需提交更新申請",
    related_id: "cert-10",
  },

  // ── 七月 ──
  {
    id: "ae-08", title: "ISO/IEC 17025 到期複查 — 光揚光罩科技",
    supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    event_type: "cert_review", date: "2026-07-10", status: "scheduled",
    notes: "TAF 實驗室認證屆滿，需向 TAF 申請換發",
    related_id: "cert-08",
  },
  {
    id: "ae-09", title: "正鑫特殊氣體 Q2-2026 評鑑",
    supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    event_type: "evaluation", date: "2026-07-18", status: "scheduled",
    notes: "例行季評，評鑑人：張偉誠，重點：NF₃ 純度一致性",
  },
  {
    id: "ae-10", title: "ISO 9001 到期複查 — 品晶半導體材料",
    supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    event_type: "cert_review", date: "2026-07-31", status: "scheduled",
    notes: "BSI ISO 9001:2015 有效期屆滿，確認換版為 ISO 9001:2025",
    related_id: "cert-02",
  },

  // ── 八月 ──
  {
    id: "ae-11", title: "光揚光罩科技 Q2-2026 評鑑",
    supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    event_type: "evaluation", date: "2026-08-14", status: "scheduled",
    notes: "追蹤 Q1 交期改善成效，評鑑人：李美玲",
  },
  {
    id: "ae-12", title: "先進製程化學品 追蹤評鑑",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    event_type: "evaluation", date: "2026-08-25", status: "scheduled",
    notes: "SCAR 改善後追蹤評鑑，確認品質系統改善成效",
    related_id: "sc1",
  },

  // ── 九月 ──
  {
    id: "ae-13", title: "先進製程化學品 現場稽核",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    event_type: "audit_visit", date: "2026-09-10", status: "scheduled",
    notes: "品質部稽核小組前往台中廠區，確認 SPC 管制系統實施狀況",
  },
];

// ================================================================
// 合格供應商名單 (ASL)
// ================================================================
export const ASL_RECORDS: AslRecord[] = [
  {
    id: "asl-1",
    supplier_id: "s1",
    supplier_name: "品晶半導體材料股份有限公司",
    supplier_code: "SUP-001",
    category: "矽晶圓",
    scope: "300mm 矽晶圓供應：品晶 P/N PKW-300-01 ～ PKW-300-08，TTV ≤ 2 μm 等級",
    status: "approved",
    approved_by: "王建國",
    approved_date: "2024-06-01",
    valid_until: "2027-05-31",
    review_date: "2026-06-01",
    conditions: "",
    notes: "連續六季 A 級，TTV ≤ 1.5 μm，準時交貨率 99.2%，為優先供應商。",
  },
  {
    id: "asl-2",
    supplier_id: "s2",
    supplier_name: "正鑫特殊氣體有限公司",
    supplier_code: "SUP-002",
    category: "特殊氣體",
    scope: "高純度製程氣體：N₂ (6N)、H₂ (5N)、HF、NH₃、SiH₄，純度符合 SEMI F20 標準",
    status: "conditional",
    approved_by: "王建國",
    approved_date: "2024-09-01",
    valid_until: "2026-08-31",
    review_date: "2026-07-15",
    conditions: "ISO 14001:2015 認證須於 2026-08-31 前完成展延更新，逾期轉為試用觀察。",
    notes: "ISO 14001 已過期，須盡速完成認證換證，其餘品質指標表現優良。",
  },
  {
    id: "asl-3",
    supplier_id: "s3",
    supplier_name: "光揚光罩科技股份有限公司",
    supplier_code: "SUP-003",
    category: "光罩製造",
    scope: "193 nm ArF 光罩、EUV 光罩（Pilot 階段），品項代碼 GM-193-* 及 GM-EUV-*",
    status: "conditional",
    approved_by: "林雅婷",
    approved_date: "2025-03-01",
    valid_until: "2026-08-31",
    review_date: "2026-07-01",
    conditions: "交期達成率須恢復至 95% 以上；SCAR-2025-003 矯正措施驗證通過前持續列為條件核准。",
    notes: "Q4 2024 交期延誤引發 SCAR，矯正計畫已提交，持續追蹤改善成效。",
  },
  {
    id: "asl-4",
    supplier_id: "s4",
    supplier_name: "精密封測服務股份有限公司",
    supplier_code: "SUP-004",
    category: "封裝測試",
    scope: "IC 封裝（BGA、QFN、WLP）及最終測試服務，客戶 P/N 指定品項",
    status: "approved",
    approved_by: "王建國",
    approved_date: "2025-04-15",
    valid_until: "2028-04-14",
    review_date: "2027-04-01",
    conditions: "",
    notes: "SCAR-2024-001 已於 2025-04-10 結案驗證通過，恢復全核准狀態，評鑑分數 79.5。",
  },
  {
    id: "asl-5",
    supplier_id: "s5",
    supplier_name: "先進製程化學品股份有限公司",
    supplier_code: "SUP-005",
    category: "製程化學品",
    scope: "CMP 拋光液（STI、W-CMP）、清洗化學品（SC-1、SC-2、DHF），品號 AC-CMP-* 及 AC-CLN-*",
    status: "probation",
    approved_by: "林雅婷",
    approved_date: "2026-01-10",
    valid_until: "2026-07-09",
    review_date: "2026-07-01",
    conditions: "試用期 6 個月（至 2026-07-09）：每月提交品質報告、SCAR-2025-008 須於 2026-06-15 完成矯正驗證，未達標則暫停使用。",
    notes: "2026-Q1 評鑑 C 級（67.0 分），品質異常率偏高，已開立 SCAR 並列入試用觀察。需密切監控。",
  },
];

// ================================================================
// 風險評估矩陣
// ================================================================
export const SUPPLIER_RISKS: SupplierRisk[] = [
  {
    supplier_id: "s1",
    supplier_name: "品晶半導體材料股份有限公司",
    supplier_code: "SUP-001",
    category: "矽晶圓",
    tier: "A",
    likelihood: 1,
    impact: 5,
    risk_score: 5,
    risk_level: "medium",
    risk_factors: [
      "供料高度集中：300 mm 晶圓單一來源",
      "地緣政治：新竹廠區颱風停產風險",
      "替代供應商認證週期長（約 18 個月）",
    ],
    mitigation: "維持 45 天安全庫存；推進 S6 備用供應商 Q3 認證作業",
    owner: "林雅婷",
    last_reviewed: "2026-04-15",
  },
  {
    supplier_id: "s2",
    supplier_name: "正鑫特殊氣體有限公司",
    supplier_code: "SUP-002",
    category: "特殊氣體",
    tier: "A",
    likelihood: 2,
    impact: 5,
    risk_score: 10,
    risk_level: "high",
    risk_factors: [
      "ISO 14001:2015 認證已過期，環保合規風險",
      "HF 等危險氣體法規趨嚴，停供風險上升",
      "特殊氣體替代供應商少，切換成本高",
    ],
    mitigation: "督促完成 ISO 14001 展延（期限 2026-08-31）；評估 T-Gas 備用報價",
    owner: "王建國",
    last_reviewed: "2026-05-01",
  },
  {
    supplier_id: "s3",
    supplier_name: "光揚光罩科技股份有限公司",
    supplier_code: "SUP-003",
    category: "光罩製造",
    tier: "B",
    likelihood: 3,
    impact: 4,
    risk_score: 12,
    risk_level: "high",
    risk_factors: [
      "交期達成率近三季低於 95% 目標",
      "SCAR-2025-003 矯正措施尚未完全驗證",
      "EUV 光罩製程良率仍不穩定",
    ],
    mitigation: "每月交期追蹤會議；加速 SCAR 驗證程序；ASML 認可廠商備援評估",
    owner: "王建國",
    last_reviewed: "2026-05-10",
  },
  {
    supplier_id: "s4",
    supplier_name: "精密封測服務股份有限公司",
    supplier_code: "SUP-004",
    category: "封裝測試",
    tier: "B",
    likelihood: 2,
    impact: 3,
    risk_score: 6,
    risk_level: "medium",
    risk_factors: [
      "WLP 產能受限，旺季可能供應不足",
      "台南廠區勞工短缺問題持續",
    ],
    mitigation: "SCAR 已結案；Q3 旺季前協調產能預留；評估第二測試廠合作",
    owner: "李美玲",
    last_reviewed: "2026-04-20",
  },
  {
    supplier_id: "s5",
    supplier_name: "先進製程化學品股份有限公司",
    supplier_code: "SUP-005",
    category: "製程化學品",
    tier: "C",
    likelihood: 5,
    impact: 4,
    risk_score: 20,
    risk_level: "critical",
    risk_factors: [
      "品質異常率持續偏高（C 級，67.0 分）",
      "SCAR-2025-008 尚未驗證關閉",
      "CMP 拋光液批次不穩定，影響製程良率",
      "試用觀察期，存在暫停使用風險",
    ],
    mitigation: "每周品質數據回報；SCAR 驗證期限 2026-06-15；啟動 Cabot 備用供應商認證",
    owner: "張偉誠",
    last_reviewed: "2026-05-20",
  },
];
