import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SupplierTier, EvaluationStatus, SupplierStatus, UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTierColor(tier: SupplierTier) {
  const map: Record<SupplierTier, { bg: string; text: string; dot: string }> = {
    A: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    B: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    C: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    D: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  };
  return map[tier];
}

export function getEvalStatusColor(status: EvaluationStatus) {
  const map: Record<EvaluationStatus, { bg: string; text: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-600" },
    in_progress: { bg: "bg-blue-100", text: "text-blue-700" },
    completed: { bg: "bg-emerald-100", text: "text-emerald-700" },
    approved: { bg: "bg-green-100", text: "text-green-800" },
    rejected: { bg: "bg-red-100", text: "text-red-700" },
  };
  return map[status];
}

export function getSupplierStatusColor(status: SupplierStatus) {
  const map: Record<SupplierStatus, { bg: string; text: string }> = {
    active: { bg: "bg-emerald-100", text: "text-emerald-700" },
    inactive: { bg: "bg-gray-100", text: "text-gray-500" },
    suspended: { bg: "bg-red-100", text: "text-red-700" },
  };
  return map[status];
}

export function getRoleColor(role: UserRole) {
  const map: Record<UserRole, { bg: string; text: string }> = {
    super_admin: { bg: "bg-purple-100", text: "text-purple-700" },
    admin: { bg: "bg-blue-100", text: "text-blue-700" },
    manager: { bg: "bg-sky-100", text: "text-sky-700" },
    evaluator: { bg: "bg-teal-100", text: "text-teal-700" },
    viewer: { bg: "bg-gray-100", text: "text-gray-600" },
  };
  return map[role];
}

export function scoreToTier(score: number): SupplierTier {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  if (userRole === "super_admin") return true;
  const perms = {
    admin: ["dashboard", "suppliers", "evaluations", "reports", "users", "settings"],
    manager: ["dashboard", "suppliers.view", "evaluations", "reports"],
    evaluator: ["dashboard", "suppliers.view", "evaluations.view", "evaluations.create"],
    viewer: ["dashboard", "suppliers.view", "evaluations.view", "reports.view"],
  };
  const allowed = perms[userRole as keyof typeof perms] ?? [];
  return allowed.some((p) => permission.startsWith(p));
}
