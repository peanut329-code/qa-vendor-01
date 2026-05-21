import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SupplierTier, EvaluationStatus, SupplierStatus, UserRole, ScarStatus, CertStatus, AuditEventType, AslStatus, RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTierColor(tier: SupplierTier) {
  const map: Record<SupplierTier, { bg: string; text: string; dot: string }> = {
    A: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    B: { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
    C: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
    D: { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
  };
  return map[tier];
}

export function getEvalStatusColor(status: EvaluationStatus) {
  const map: Record<EvaluationStatus, { bg: string; text: string }> = {
    draft:       { bg: "bg-gray-100",    text: "text-gray-600"   },
    in_progress: { bg: "bg-blue-100",    text: "text-blue-700"   },
    completed:   { bg: "bg-emerald-100", text: "text-emerald-700"},
    approved:    { bg: "bg-green-100",   text: "text-green-800"  },
    rejected:    { bg: "bg-red-100",     text: "text-red-700"    },
  };
  return map[status];
}

export function getSupplierStatusColor(status: SupplierStatus) {
  const map: Record<SupplierStatus, { bg: string; text: string }> = {
    active:    { bg: "bg-emerald-100", text: "text-emerald-700" },
    inactive:  { bg: "bg-gray-100",   text: "text-gray-500"    },
    suspended: { bg: "bg-red-100",    text: "text-red-700"     },
  };
  return map[status];
}

export function getRoleColor(role: UserRole) {
  const map: Record<UserRole, { bg: string; text: string }> = {
    super_admin: { bg: "bg-purple-100", text: "text-purple-700" },
    admin:       { bg: "bg-blue-100",   text: "text-blue-700"   },
    manager:     { bg: "bg-sky-100",    text: "text-sky-700"    },
    evaluator:   { bg: "bg-teal-100",   text: "text-teal-700"   },
    viewer:      { bg: "bg-gray-100",   text: "text-gray-600"   },
  };
  return map[role];
}

export function getScarStatusColor(status: ScarStatus) {
  const map: Record<ScarStatus, { bg: string; text: string; dot: string }> = {
    open:        { bg: "bg-red-100",    text: "text-red-700",     dot: "bg-red-500"     },
    in_progress: { bg: "bg-blue-100",   text: "text-blue-700",    dot: "bg-blue-500"    },
    verified:    { bg: "bg-sky-100",    text: "text-sky-700",     dot: "bg-sky-500"     },
    closed:      { bg: "bg-green-100",  text: "text-green-800",   dot: "bg-green-500"   },
    overdue:     { bg: "bg-orange-100", text: "text-orange-700",  dot: "bg-orange-500"  },
  };
  return map[status];
}

export function scoreToTier(score: number): SupplierTier {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function scoreColor(score: number): string {
  if (score >= 90) return "#22C55E";
  if (score >= 70) return "#5B8FD9";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  if (userRole === "super_admin") return true;
  const perms = {
    admin:     ["dashboard", "suppliers", "evaluations", "reports", "users", "settings", "scar", "certifications", "audit"],
    manager:   ["dashboard", "suppliers.view", "evaluations", "reports", "scar", "certifications", "audit"],
    evaluator: ["dashboard", "suppliers.view", "evaluations.view", "evaluations.create"],
    viewer:    ["dashboard", "reports.view"],
  };
  const allowed = perms[userRole as keyof typeof perms] ?? [];
  return allowed.some((p) => permission.startsWith(p));
}

// ── 認證效期工具函式 ─────────────────────────────────────────

export function getCertStatus(expiryDate: string): CertStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 86400));
  if (diffDays < 0) return "expired";
  if (diffDays <= 90) return "expiring_soon";
  return "valid";
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 86400));
}

export function getCertStatusColor(status: CertStatus) {
  const map: Record<CertStatus, { bg: string; text: string; dot: string }> = {
    valid:         { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    expiring_soon: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
    expired:       { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
  };
  return map[status];
}

// ── 合格供應商名單 (ASL) 工具函式 ────────────────────────────

export function getAslStatusColor(status: AslStatus): { bg: string; text: string; dot: string; border: string } {
  const map: Record<AslStatus, { bg: string; text: string; dot: string; border: string }> = {
    approved:    { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", border: "#22C55E" },
    conditional: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500",   border: "#F59E0B" },
    probation:   { bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-500",  border: "#FB923C" },
    suspended:   { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500",     border: "#EF4444" },
  };
  return map[status];
}

// ── 風險矩陣工具函式 ─────────────────────────────────────────

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 16) return "critical";
  if (score >= 9)  return "high";
  if (score >= 4)  return "medium";
  return "low";
}

export function getRiskColor(level: RiskLevel): { bg: string; text: string; border: string; cell: string } {
  const map: Record<RiskLevel, { bg: string; text: string; border: string; cell: string }> = {
    low:      { bg: "#F0FDF4", text: "#065F46", border: "#22C55E", cell: "#D1FAE5" },
    medium:   { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B", cell: "#FDE68A" },
    high:     { bg: "#FEF2F2", text: "#991B1B", border: "#EF4444", cell: "#FECACA" },
    critical: { bg: "#FFF1F2", text: "#7F1D1D", border: "#DC2626", cell: "#FCA5A5" },
  };
  return map[level];
}

// ── 稽核行事曆工具函式 ───────────────────────────────────────

export function getAuditEventColor(eventType: AuditEventType): {
  bg: string; text: string; accent: string; icon: string;
} {
  const map: Record<AuditEventType, { bg: string; text: string; accent: string; icon: string }> = {
    evaluation:  { bg: "#EDF3FA", text: "#1D4ED8", accent: "#5B8FD9", icon: "bi-clipboard2-check-fill" },
    scar_due:    { bg: "#FEF3C7", text: "#92400E", accent: "#F59E0B", icon: "bi-exclamation-triangle-fill" },
    cert_review: { bg: "#FEF2F2", text: "#991B1B", accent: "#EF4444", icon: "bi-patch-check-fill" },
    audit_visit: { bg: "#F0FDF4", text: "#065F46", accent: "#22C55E", icon: "bi-building-check" },
  };
  return map[eventType];
}
