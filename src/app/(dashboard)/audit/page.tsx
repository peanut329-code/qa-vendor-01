"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AUDIT_EVENTS, SUPPLIERS } from "@/lib/mock-data";
import type { AuditEvent } from "@/types";
import { getAuditEventColor } from "@/lib/utils";
import { AUDIT_EVENT_TYPE_LABELS, AUDIT_EVENT_STATUS_LABELS } from "@/types";
import type { AuditEventType, AuditEventStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { exportAuditEventsToExcel } from "@/lib/export";

// 動態獲取當前真實日期
const now = new Date();
const TODAY_YEAR = now.getFullYear();
const TODAY_MONTH = now.getMonth() + 1;
const TODAY = `${TODAY_YEAR}-${String(TODAY_MONTH).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function getMonthEvents(events: typeof AUDIT_EVENTS, year: number, month: number) {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return events.filter((e) => e.date.startsWith(prefix));
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay(); // 0=Sun
}

function AccessDenied() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <i className="bi bi-shield-lock-fill" style={{ fontSize: "3rem", color: "#C5D8F0", display: "block", marginBottom: 16 }} />
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#5F7A9B", marginBottom: 8 }}>存取受限</div>
      <div style={{ color: "#94AEC8", fontSize: "0.875rem" }}>您的帳號無法存取此功能。</div>
    </div>
  );
}

type ViewMode = "calendar" | "list";

export default function AuditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [year, setYear] = useState(TODAY_YEAR);
  const [month, setMonth] = useState(TODAY_MONTH);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [typeFilter, setTypeFilter] = useState<AuditEventType | "ALL">("ALL");
  const [monthFilter, setMonthFilter] = useState<string | "ALL">("ALL");

  const [eventsList, setEventsList] = useState<AuditEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    supplier_id: "",
    event_type: "audit_visit" as AuditEventType,
    date: "",
    notes: "",
  });

  useEffect(() => {
    if (user && !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAudits = localStorage.getItem("audits-custom");
      let customAudits: any[] = [];
      if (savedAudits) {
        try {
          customAudits = JSON.parse(savedAudits);
        } catch (e) {}
      }
      setEventsList([...AUDIT_EVENTS, ...customAudits]);

      const savedSups = localStorage.getItem("suppliers-custom");
      let customSups: any[] = [];
      if (savedSups) {
        try {
          customSups = JSON.parse(savedSups);
        } catch (e) {}
      }
      const allSups = [...SUPPLIERS, ...customSups];
      setSuppliersList(allSups);
      if (allSups.length > 0) {
        setNewEvent((prev) => ({ ...prev, supplier_id: allSups[0].id }));
      }
    }
  }, []);

  if (!user || !["super_admin", "admin", "manager", "viewer"].includes(user.role)) {
    return <AccessDenied />;
  }

  const canExport = user && ["super_admin", "admin", "manager"].includes(user.role);

  // Events for current view month
  const monthEvents = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return eventsList.filter((e) => e.date.startsWith(prefix));
  }, [eventsList, year, month]);

  // Events map by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, AuditEvent[]> = {};
    monthEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [monthEvents]);

  // Selected date events
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  // All upcoming events (for list view)
  const upcomingEvents = useMemo(() => {
    const filtered = eventsList.filter((e) => {
      const matchType = typeFilter === "ALL" || e.event_type === typeFilter;
      const matchMonth = monthFilter === "ALL" || e.date.startsWith(monthFilter);
      return matchType && matchMonth;
    });
    return filtered.sort((a, b) => a.date.localeCompare(b.date));
  }, [eventsList, typeFilter, monthFilter]);

  // Summary counts
  const typeCounts: Record<string, number> = {};
  eventsList.forEach((e) => { typeCounts[e.event_type] = (typeCounts[e.event_type] ?? 0) + 1; });

  function handleAddAudit(e: React.FormEvent) {
    e.preventDefault();
    const targetSup = suppliersList.find((s) => s.id === newEvent.supplier_id);
    
    const itemToAdd = {
      id: `ae-${Date.now()}`,
      title: newEvent.title,
      supplier_id: targetSup ? targetSup.id : "",
      supplier_name: targetSup ? targetSup.name : "（全體）",
      supplier_code: targetSup ? targetSup.code : "",
      event_type: newEvent.event_type,
      date: newEvent.date,
      status: "scheduled" as AuditEventStatus,
      notes: newEvent.notes,
    };

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("audits-custom");
      let current: any[] = [];
      if (saved) {
        try {
          current = JSON.parse(saved);
        } catch (e) {}
      }
      current.push(itemToAdd);
      localStorage.setItem("audits-custom", JSON.stringify(current));
    }

    setEventsList((prev) => [...prev, itemToAdd]);
    setShowAddModal(false);
    setNewEvent((prev) => ({
      ...prev,
      title: "",
      date: "",
      notes: "",
    }));
  }

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const calendarCells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete rows
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const currentMonthStr = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">稽核行事曆</div>
          <div className="page-subtitle">追蹤評鑑排程、認證複查、SCAR 到期與現場稽核事項</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canExport && (
            <button className="ev-btn ev-btn-ghost" onClick={() => exportAuditEventsToExcel(upcomingEvents)}>
              <i className="bi bi-file-earmark-excel" /> Excel 匯出
            </button>
          )}
          {/* View toggle */}
          <div style={{ display: "flex", border: "1.5px solid #C5D8F0", borderRadius: 8, overflow: "hidden" }}>
            {(["calendar", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setViewMode(v);
                  if (v === "calendar") setMonthFilter("ALL");
                }}
                style={{
                  padding: "7px 14px", fontSize: "0.82rem", fontWeight: 500,
                  background: viewMode === v ? "#5B8FD9" : "white",
                  color: viewMode === v ? "white" : "#5F7A9B",
                  border: "none", cursor: "pointer",
                }}
              >
                <i className={`bi ${v === "calendar" ? "bi-calendar3" : "bi-list-ul"}`} style={{ marginRight: 5 }} />
                {v === "calendar" ? "月曆" : "清單"}
              </button>
            ))}
          </div>
          <button className="ev-btn ev-btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg" /> 新增事項
          </button>
        </div>
      </div>

      {/* Event type stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {(["evaluation", "cert_review", "scar_due", "audit_visit"] as AuditEventType[]).map((type) => {
          const c = getAuditEventColor(type);
          const count = typeCounts[type] ?? 0;
          return (
            <button
              key={type}
              onClick={() => { setTypeFilter(typeFilter === type ? "ALL" : type); setViewMode("list"); }}
              style={{
                background: "white", border: `1.5px solid ${typeFilter === type ? c.accent : "#E0EBF8"}`,
                borderRadius: 10, padding: "12px 16px", cursor: "pointer", textAlign: "left",
                boxShadow: typeFilter === type ? `0 2px 10px ${c.accent}25` : "0 1px 4px rgba(91,143,217,0.06)",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`bi ${c.icon}`} style={{ color: c.accent, fontSize: "0.85rem" }} />
                </div>
                <span style={{ fontSize: "0.78rem", color: "#5F7A9B", fontWeight: 500 }}>
                  {AUDIT_EVENT_TYPE_LABELS[type]}
                </span>
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: c.accent }}>{count}</div>
            </button>
          );
        })}
      </div>

      {viewMode === "calendar" ? (
        /* ── Calendar View ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
          {/* Calendar grid */}
          <div className="ev-card" style={{ padding: "20px 22px" }}>
            {/* Month navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <button
                onClick={prevMonth}
                className="ev-btn ev-btn-ghost"
                style={{ padding: "6px 12px" }}
              >
                <i className="bi bi-chevron-left" />
              </button>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1E3A5F" }}>
                {year} 年 {MONTH_LABELS[month - 1]}
              </div>
              <button
                onClick={nextMonth}
                className="ev-btn ev-btn-ghost"
                style={{ padding: "6px 12px" }}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>

            {/* Weekday headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
              {WEEKDAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  style={{
                    textAlign: "center", fontSize: "0.75rem", fontWeight: 700,
                    color: i === 0 ? "#EF4444" : i === 6 ? "#5B8FD9" : "#5F7A9B",
                    padding: "4px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} style={{ minHeight: 72 }} />;
                }
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDate[dateStr] ?? [];
                const isToday = dateStr === TODAY;
                const isSelected = dateStr === selectedDate;
                const weekday = (firstWeekday + day - 1) % 7;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    style={{
                      minHeight: 72, borderRadius: 8,
                      border: isSelected ? "2px solid #5B8FD9" : isToday ? "2px solid #5B8FD940" : "1px solid transparent",
                      background: isSelected ? "#EDF3FA" : isToday ? "#F0F6FF" : "transparent",
                      cursor: "pointer", padding: "6px", textAlign: "left",
                      transition: "all 0.12s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.82rem", fontWeight: isToday ? 800 : 500,
                        color: isToday ? "#5B8FD9" : weekday === 0 ? "#EF4444" : weekday === 6 ? "#3B82F6" : "#1E3A5F",
                        marginBottom: 4,
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      {day}
                      {isToday && (
                        <span style={{ fontSize: "0.6rem", background: "#5B8FD9", color: "white", borderRadius: 3, padding: "1px 4px", fontWeight: 700 }}>
                          今
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {dayEvents.slice(0, 3).map((ev) => {
                        const c = getAuditEventColor(ev.event_type);
                        return (
                          <div
                            key={ev.id}
                            style={{
                              fontSize: "0.65rem", background: c.bg, color: c.text,
                              borderRadius: 3, padding: "1px 4px",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              fontWeight: 600,
                            }}
                          >
                            <i className={`bi ${c.icon}`} style={{ marginRight: 3, fontSize: "0.6rem" }} />
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div style={{ fontSize: "0.62rem", color: "#94AEC8", textAlign: "right" }}>
                          +{dayEvents.length - 3} 筆
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Event type legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {(["evaluation", "cert_review", "scar_due", "audit_visit"] as AuditEventType[]).map((type) => {
                const c = getAuditEventColor(type);
                return (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: "#5F7A9B" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c.accent, display: "inline-block" }} />
                    {AUDIT_EVENT_TYPE_LABELS[type]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side panel: selected day or month summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {selectedDate ? (
              <div className="ev-card" style={{ padding: "18px 20px" }}>
                <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 12, fontSize: "0.9rem" }}>
                  <i className="bi bi-calendar-event-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
                  {selectedDate} 事項
                </div>
                {selectedEvents.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {selectedEvents.map((ev) => {
                      const c = getAuditEventColor(ev.event_type);
                      return (
                        <div
                          key={ev.id}
                          style={{
                            background: c.bg, borderRadius: 8, padding: "10px 12px",
                            borderLeft: `3px solid ${c.accent}`,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <i className={`bi ${c.icon}`} style={{ color: c.accent, fontSize: "0.85rem" }} />
                            <span style={{ fontSize: "0.72rem", color: c.text, fontWeight: 700 }}>
                              {AUDIT_EVENT_TYPE_LABELS[ev.event_type]}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.85rem", marginBottom: 3 }}>
                            {ev.title}
                          </div>
                          {ev.supplier_name && (
                            <div style={{ fontSize: "0.75rem", color: "#5F7A9B" }}>{ev.supplier_name}</div>
                          )}
                          {ev.notes && (
                            <div style={{ fontSize: "0.72rem", color: "#5F7A9B", marginTop: 5, lineHeight: 1.5 }}>
                              {ev.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#94AEC8", padding: "24px 0", fontSize: "0.875rem" }}>
                    <i className="bi bi-calendar-x" style={{ fontSize: "1.5rem", display: "block", marginBottom: 8, color: "#C5D8F0" }} />
                    此日無排定事項
                  </div>
                )}
              </div>
            ) : (
              <div className="ev-card" style={{ padding: "18px 20px" }}>
                <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 12, fontSize: "0.9rem" }}>
                  <i className="bi bi-calendar3-week-fill" style={{ color: "#5B8FD9", marginRight: 8 }} />
                  {month} 月共 {monthEvents.length} 筆事項
                </div>
                {monthEvents.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {monthEvents.sort((a, b) => a.date.localeCompare(b.date)).map((ev) => {
                      const c = getAuditEventColor(ev.event_type);
                      const day = ev.date.split("-")[2];
                      return (
                        <div
                          key={ev.id}
                          style={{
                            display: "flex", gap: 10, alignItems: "flex-start",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedDate(ev.date)}
                        >
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: c.bg, display: "flex", alignItems: "center",
                              justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", color: c.text,
                            }}
                          >
                            {day}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E3A5F" }}>{ev.title}</div>
                            <div style={{ fontSize: "0.72rem", color: c.accent, fontWeight: 600 }}>
                              {AUDIT_EVENT_TYPE_LABELS[ev.event_type]}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#94AEC8", padding: "24px 0", fontSize: "0.875rem" }}>
                    本月無排定事項
                  </div>
                )}
              </div>
            )}

            {/* Quick jump to upcoming months with events */}
            <div className="ev-card" style={{ padding: "16px 18px" }}>
              <div style={{ fontWeight: 700, color: "#1E3A5F", marginBottom: 10, fontSize: "0.85rem" }}>
                近期月份
              </div>
              {[0, 1, 2, 3].map((offset) => {
                let m = TODAY_MONTH + offset;
                let y = TODAY_YEAR;
                if (m > 12) { m -= 12; y += 1; }
                const count = getMonthEvents(AUDIT_EVENTS, y, m).length;
                const isCurrent = y === year && m === month;
                return (
                  <button
                    key={`${y}-${m}`}
                    onClick={() => {
                      setYear(y);
                      setMonth(m);
                      setSelectedDate(null);
                      setMonthFilter(`${y}-${String(m).padStart(2, "0")}`);
                      setViewMode("list");
                    }}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", padding: "7px 10px", borderRadius: 7, marginBottom: 4,
                      background: isCurrent ? "#EDF3FA" : "transparent",
                      border: isCurrent ? "1px solid #C5D8F0" : "1px solid transparent",
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    <span style={{ fontSize: "0.82rem", color: isCurrent ? "#5B8FD9" : "#1E3A5F", fontWeight: isCurrent ? 700 : 500 }}>
                      {y} 年 {MONTH_LABELS[m - 1]}
                    </span>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 600,
                      background: count > 0 ? "#5B8FD9" : "#EDF3FA",
                      color: count > 0 ? "white" : "#94AEC8",
                      borderRadius: 9999, padding: "1px 8px",
                    }}>
                      {count} 筆
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── List View ── */
        <div className="ev-card" style={{ padding: 0, overflow: "hidden" }}>
          {monthFilter !== "ALL" && (
            <div style={{
              background: "#F0F7FF", borderBottom: "1px solid #D2E5FC",
              padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: "0.82rem", color: "#1E3A5F", fontWeight: 600 }}>
                <i className="bi bi-funnel-fill" style={{ color: "#5B8FD9", marginRight: 6 }} />
                正在篩選：{monthFilter.split("-")[0]} 年 {Number(monthFilter.split("-")[1])} 月的事項（共 {upcomingEvents.length} 筆）
              </span>
              <button
                className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.76rem", background: "white", border: "1px solid #C5D8F0" }}
                onClick={() => setMonthFilter("ALL")}
              >
                清除篩選，顯示所有月份
              </button>
            </div>
          )}
          {/* Type filter tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #EAF1FB", background: "#FAFCFF", padding: "0 12px" }}>
            {([
              { key: "ALL" as const, label: "全部" },
              { key: "evaluation" as AuditEventType, label: "評鑑作業" },
              { key: "cert_review" as AuditEventType, label: "認證複查" },
              { key: "scar_due" as AuditEventType, label: "SCAR 到期" },
              { key: "audit_visit" as AuditEventType, label: "現場稽核" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key as AuditEventType | "ALL")}
                style={{
                  padding: "12px 14px", fontSize: "0.84rem",
                  fontWeight: typeFilter === tab.key ? 700 : 500,
                  color: typeFilter === tab.key ? "#5B8FD9" : "#5F7A9B",
                  background: "none", border: "none",
                  borderBottom: typeFilter === tab.key ? "2.5px solid #5B8FD9" : "2.5px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {tab.label}
                <span style={{
                  marginLeft: 6, background: typeFilter === tab.key ? "#5B8FD9" : "#EDF3FA",
                  color: typeFilter === tab.key ? "white" : "#5F7A9B",
                  borderRadius: 9999, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 600,
                }}>
                  {tab.key === "ALL" ? AUDIT_EVENTS.length : (typeCounts[tab.key] ?? 0)}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table className="ev-table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>日期</th>
                  <th>事件類型</th>
                  <th>事項標題</th>
                  <th>供應商</th>
                  <th>狀態</th>
                  <th>備註</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((ev) => {
                  const c = getAuditEventColor(ev.event_type);
                  const isPast = ev.date < TODAY;
                  return (
                    <tr key={ev.id} style={{ opacity: isPast ? 0.65 : 1 }}>
                      <td>
                        <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "#1E3A5F" }}>
                          {ev.date}
                        </div>
                        {isPast && (
                          <div style={{ fontSize: "0.68rem", color: "#94AEC8" }}>已過</div>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: c.bg, color: c.text, fontWeight: 600,
                            padding: "3px 9px", borderRadius: 6, fontSize: "0.75rem",
                          }}
                        >
                          <i className={`bi ${c.icon}`} style={{ fontSize: "0.75rem" }} />
                          {AUDIT_EVENT_TYPE_LABELS[ev.event_type]}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: "#1E3A5F", fontSize: "0.875rem" }}>
                        {ev.title}
                      </td>
                      <td>
                        {ev.supplier_id ? (
                          <Link href={`/suppliers/${ev.supplier_id}`} style={{ textDecoration: "none" }}>
                            <div style={{ color: "#5B8FD9", fontSize: "0.85rem", fontWeight: 500 }}>{ev.supplier_name}</div>
                            <div style={{ color: "#94AEC8", fontSize: "0.72rem", fontFamily: "monospace" }}>{ev.supplier_code}</div>
                          </Link>
                        ) : (
                          <span style={{ color: "#94AEC8", fontSize: "0.82rem" }}>{ev.supplier_name}</span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "2px 9px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 600,
                            background: ev.status === "scheduled" ? "#EDF3FA" : ev.status === "completed" ? "#D1FAE5" : "#FEF2F2",
                            color: ev.status === "scheduled" ? "#5B8FD9" : ev.status === "completed" ? "#065F46" : "#991B1B",
                          }}
                        >
                          {AUDIT_EVENT_STATUS_LABELS[ev.status]}
                        </span>
                      </td>
                      <td style={{ maxWidth: 220, fontSize: "0.78rem", color: "#5F7A9B" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={ev.notes}>
                          {ev.notes}
                        </div>
                      </td>
                      <td>
                        {ev.related_id && (
                          <button className="ev-btn ev-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                            <i className="bi bi-link-45deg" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {upcomingEvents.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94AEC8" }}>
              <i className="bi bi-calendar-x" style={{ fontSize: "2.2rem", display: "block", marginBottom: 8 }} />
              沒有符合條件的事項
            </div>
          )}
        </div>
      )}
      {showAddModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="ev-card" style={{
            width: "100%", maxWidth: 480, padding: 24, 
            boxShadow: "0 10px 30px rgba(30,58,95,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F" }}>新增稽核與行程事項</div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "#94AEC8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleAddAudit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>事項名稱 *</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }} required
                    value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="例：先進製程化學品現場稽核"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>供應商 *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }} required
                    value={newEvent.supplier_id} onChange={(e) => setNewEvent({...newEvent, supplier_id: e.target.value})}
                  >
                    <option value="">（全體 / 內部事項）</option>
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>事件類別 *</label>
                  <select 
                    className="ev-select" style={{ width: "100%" }}
                    value={newEvent.event_type} onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value as AuditEventType})}
                  >
                    {Object.entries(AUDIT_EVENT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>日期 *</label>
                  <input 
                    type="date" className="ev-input" style={{ width: "100%" }} required
                    value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#5F7A9B", fontWeight: 600, display: "block", marginBottom: 6 }}>說明備註</label>
                  <input 
                    className="ev-input" style={{ width: "100%" }}
                    value={newEvent.notes} onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                    placeholder="輸入對此稽核行程的備註事項..."
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #EAF1FB", paddingTop: 16 }}>
                <button type="button" className="ev-btn ev-btn-ghost" onClick={() => setShowAddModal(false)}>取消</button>
                <button type="submit" className="ev-btn ev-btn-primary">確認新增</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
