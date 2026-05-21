import type {
  User, Supplier, Evaluation, EvaluationCriteria, MonthlyTrend
} from "@/types";

// ================================================================
// 登入帳號
// ================================================================
export const LOGIN_ACCOUNTS = [
  { username: "admin01", password: "qa-16949", userId: "u1" },
  { username: "viewer",  password: "viewer",   userId: "u2" },
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
    period: "2025-Q1",
    status: "approved", total_score: 94.5, tier: "A",
    notes: "矽晶圓品質穩定，TTV ≤ 1.5 μm，良率達標，準時交貨率 99.2%。",
    created_at: "2025-01-08T09:00:00Z", updated_at: "2025-01-22T14:00:00Z",
  },
  {
    id: "e2",
    supplier_id: "s1", supplier_name: "品晶半導體材料股份有限公司", supplier_code: "SUP-001",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2024-Q4",
    status: "approved", total_score: 92.0, tier: "A",
    notes: "12 吋晶圓缺陷密度表現優異，持續列為 A 級供應商。",
    created_at: "2024-10-10T09:00:00Z", updated_at: "2024-10-28T14:00:00Z",
  },

  // --- SUP-002 正鑫特殊氣體 ---
  {
    id: "e3",
    supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2025-Q1",
    status: "approved", total_score: 92.8, tier: "A",
    notes: "NF₃ 純度 ≥ 99.9999%，運送安全紀錄優良，緊急補貨回應 ≤ 4 小時。",
    created_at: "2025-01-10T09:00:00Z", updated_at: "2025-01-25T14:00:00Z",
  },
  {
    id: "e4",
    supplier_id: "s2", supplier_name: "正鑫特殊氣體有限公司", supplier_code: "SUP-002",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2024-Q4",
    status: "approved", total_score: 90.2, tier: "A",
    notes: "特殊氣體品質穩定，ISO 45001 安衛認證在效。",
    created_at: "2024-10-12T09:00:00Z", updated_at: "2024-10-30T14:00:00Z",
  },

  // --- SUP-003 光揚光罩科技 ---
  {
    id: "e5",
    supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2025-Q1",
    status: "completed", total_score: 85.5, tier: "B",
    notes: "DUV 光罩 CD 精度達標，交期延誤 2 次，建議加強產能規劃。",
    created_at: "2025-01-14T09:00:00Z", updated_at: "2025-02-03T14:00:00Z",
  },
  {
    id: "e6",
    supplier_id: "s3", supplier_name: "光揚光罩科技股份有限公司", supplier_code: "SUP-003",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2024-Q4",
    status: "approved", total_score: 82.5, tier: "B",
    notes: "EUV 光罩缺陷修補能力提升，整體進步明顯。",
    created_at: "2024-10-15T09:00:00Z", updated_at: "2024-10-31T14:00:00Z",
  },

  // --- SUP-004 精密封測服務 ---
  {
    id: "e7",
    supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2025-Q1",
    status: "in_progress", total_score: null, tier: null,
    notes: "",
    created_at: "2025-02-05T09:00:00Z", updated_at: "2025-02-05T09:00:00Z",
  },
  {
    id: "e8",
    supplier_id: "s4", supplier_name: "精密封測服務股份有限公司", supplier_code: "SUP-004",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2024-Q4",
    status: "approved", total_score: 79.5, tier: "B",
    notes: "Flip-Chip 良率達 98.6%，Burn-In 測試覆蓋率略低，需改善。",
    created_at: "2024-10-18T09:00:00Z", updated_at: "2024-11-02T14:00:00Z",
  },

  // --- SUP-005 先進製程化學品 ---
  {
    id: "e9",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    evaluator_id: "u5", evaluator_name: "李美玲",
    period: "2025-Q1",
    status: "draft", total_score: null, tier: null,
    notes: "",
    created_at: "2025-02-10T09:00:00Z", updated_at: "2025-02-10T09:00:00Z",
  },
  {
    id: "e10",
    supplier_id: "s5", supplier_name: "先進製程化學品股份有限公司", supplier_code: "SUP-005",
    evaluator_id: "u6", evaluator_name: "張偉誠",
    period: "2024-Q4",
    status: "approved", total_score: 67.0, tier: "C",
    notes: "CMP 漿料批次均一性不足，光阻劑黏度偏差超標 3 次，已發 SCAR 要求改善。",
    created_at: "2024-10-20T09:00:00Z", updated_at: "2024-11-05T14:00:00Z",
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
