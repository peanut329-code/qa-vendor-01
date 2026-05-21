export type UserRole = "super_admin" | "admin" | "manager" | "evaluator" | "viewer";
export type SupplierTier = "A" | "B" | "C" | "D";
export type SupplierStatus = "active" | "inactive" | "suspended";
export type EvaluationStatus = "draft" | "in_progress" | "completed" | "approved" | "rejected";

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

export interface KpiCard {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  color: "blue" | "green" | "orange" | "purple";
}

export interface MonthlyTrend {
  month: string;
  avg_score: number;
  eval_count: number;
}

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

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "dashboard.view", "suppliers.*", "evaluations.*",
    "reports.*", "users.*", "settings.*",
  ],
  manager: [
    "dashboard.view", "suppliers.view", "evaluations.view",
    "evaluations.review", "reports.*",
  ],
  evaluator: [
    "dashboard.view", "suppliers.view",
    "evaluations.view", "evaluations.create", "evaluations.edit",
  ],
  viewer: ["dashboard.view", "suppliers.view", "evaluations.view", "reports.view"],
};
