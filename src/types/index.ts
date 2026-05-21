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
  admin: ["dashboard.view", "suppliers.*", "evaluations.*", "reports.*", "users.*", "settings.*", "scar.*"],
  manager: ["dashboard.view", "suppliers.view", "evaluations.view", "evaluations.review", "reports.*", "scar.*"],
  evaluator: ["dashboard.view", "suppliers.view", "evaluations.view", "evaluations.create", "evaluations.edit"],
  viewer: ["dashboard.view", "reports.view"],
};
