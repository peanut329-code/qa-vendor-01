export type UserRole = "super_admin" | "admin" | "manager" | "evaluator" | "viewer";
export type SupplierTier = "A" | "B" | "C" | "D";
export type SupplierStatus = "active" | "inactive" | "suspended";
export type EvaluationStatus = "draft" | "in_progress" | "completed" | "approved" | "rejected";
export type ScarStatus = "open" | "in_progress" | "verified" | "closed" | "overdue";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  tier: SupplierTier;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  status: SupplierStatus;
  overall_score: number;
  eval_count: number;
  created_at: string;
}

export interface EvaluationScore {
  criteria_id: string;
  criteria_name: string;
  category: string;
  weight: number;
  score: number;
  weighted_score: number;
  notes: string;
}

export interface Evaluation {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  evaluator_id: string;
  evaluator_name: string;
  period: string;
  status: EvaluationStatus;
  total_score: number | null;
  tier: SupplierTier | null;
  notes: string;
  scores?: EvaluationScore[];
  created_at: string;
  updated_at: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  category: string;
  weight: number;
  max_score: number;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface Scar {
  id: string;
  scar_number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  evaluation_id: string;
  triggered_score: number;
  triggered_tier: SupplierTier;
  issue_description: string;
  category: string;
  root_cause: string;
  corrective_action: string;
  target_date: string;
  verified_date: string | null;
  status: ScarStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyTrend {
  month: string;
  avg_score: number;
  eval_count: number;
}

export interface KpiCard {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  color: "blue" | "green" | "orange" | "purple";
}

// ── Labels ──────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "系統管理員",
  admin: "企業管理員",
  manager: "評鑑主管",
  evaluator: "評鑑人員",
  viewer: "唯讀觀察者",
};

export const ROLE_LABELS_BILINGUAL: Record<UserRole, { zh: string; en: string }> = {
  super_admin: { zh: "系統管理員", en: "Super Admin" },
  admin:       { zh: "企業管理員", en: "Admin" },
  manager:     { zh: "評鑑主管",  en: "Manager" },
  evaluator:   { zh: "評鑑人員",  en: "Evaluator" },
  viewer:      { zh: "唯讀觀察者", en: "Viewer" },
};

export const TIER_LABELS: Record<SupplierTier, string> = {
  A: "A 優選",
  B: "B 合格",
  C: "C 觀察",
  D: "D 不合格",
};

export const STATUS_LABELS: Record<SupplierStatus, string> = {
  active: "正常",
  inactive: "停用",
  suspended: "暫停",
};

export const EVAL_STATUS_LABELS: Record<EvaluationStatus, string> = {
  draft: "草稿",
  in_progress: "進行中",
  completed: "已完成",
  approved: "已核准",
  rejected: "已退回",
};

export const SCAR_STATUS_LABELS: Record<ScarStatus, string> = {
  open: "待處理",
  in_progress: "改善中",
  verified: "已驗證",
  closed: "已結案",
  overdue: "逾期",
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["*"],
  admin: ["dashboard.view", "suppliers.*", "evaluations.*", "reports.*", "users.*", "settings.*", "scar.*", "certifications.*", "audit.*"],
  manager: ["dashboard.view", "suppliers.view", "evaluations.view", "evaluations.review", "reports.*", "scar.*", "certifications.*", "audit.*"],
  evaluator: ["dashboard.view", "suppliers.view", "evaluations.view", "evaluations.create", "evaluations.edit"],
  viewer: ["dashboard.view", "reports.view"],
};

// ── 認證效期 ─────────────────────────────────────────────────
export type CertStatus = "valid" | "expiring_soon" | "expired";

export interface Certification {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  cert_type: string;
  cert_number: string;
  issued_by: string;
  issue_date: string;
  expiry_date: string;
  notes: string;
}

export const CERT_STATUS_LABELS: Record<CertStatus, string> = {
  valid:         "有效",
  expiring_soon: "即將到期",
  expired:       "已過期",
};

// ── 稽核行事曆 ────────────────────────────────────────────────
export type AuditEventType = "evaluation" | "scar_due" | "cert_review" | "audit_visit";
export type AuditEventStatus = "scheduled" | "completed" | "overdue" | "cancelled";

export interface AuditEvent {
  id: string;
  title: string;
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  event_type: AuditEventType;
  date: string;           // YYYY-MM-DD
  status: AuditEventStatus;
  notes: string;
  related_id?: string;    // evaluation_id / scar_id / cert_id
}

export const AUDIT_EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
  evaluation:  "評鑑作業",
  scar_due:    "SCAR 到期",
  cert_review: "認證複查",
  audit_visit: "現場稽核",
};

export const AUDIT_EVENT_STATUS_LABELS: Record<AuditEventStatus, string> = {
  scheduled:  "已排定",
  completed:  "已完成",
  overdue:    "逾期未完成",
  cancelled:  "已取消",
};

// ── 合格供應商名單 (ASL) ──────────────────────────────────────
export type AslStatus = "approved" | "conditional" | "probation" | "suspended";

export interface AslRecord {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  category: string;
  scope: string;             // 核准範圍
  status: AslStatus;
  approved_by: string;
  approved_date: string;     // YYYY-MM-DD
  valid_until: string;       // YYYY-MM-DD
  review_date: string;       // 下次複評日
  conditions: string;        // 附帶條件（conditional/probation 用）
  notes: string;
}

export const ASL_STATUS_LABELS: Record<AslStatus, string> = {
  approved:    "核准合格",
  conditional: "條件核准",
  probation:   "試用觀察",
  suspended:   "暫停使用",
};

// ── 風險評估矩陣 ──────────────────────────────────────────────
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface SupplierRisk {
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  category: string;
  tier: SupplierTier;
  likelihood: number;        // 1–5
  impact: number;            // 1–5
  risk_score: number;        // likelihood × impact
  risk_level: RiskLevel;
  risk_factors: string[];    // 風險因子清單
  mitigation: string;        // 緩解措施
  owner: string;             // 負責人
  last_reviewed: string;     // YYYY-MM-DD
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low:      "低風險",
  medium:   "中風險",
  high:     "高風險",
  critical: "緊急風險",
};
