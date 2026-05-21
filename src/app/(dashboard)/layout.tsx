"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E4EDF7",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #5B8FD9 0%, #3A6FBF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <i className="bi bi-patch-check-fill" style={{ color: "white", fontSize: "1.2rem" }} />
          </div>
          <div style={{ color: "#5F7A9B", fontSize: "0.85rem" }}>載入中...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <Sidebar />
      <Topbar />
      <main className="layout-main">
        <div style={{ padding: "28px 28px 0" }}>
          {children}
        </div>
        <footer className="ev-footer" style={{ margin: "0 28px" }}>
          Designed &amp; Developed by Lingo｜2026
        </footer>
      </main>
    </div>
  );
}
