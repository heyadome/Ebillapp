"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { TrendingUp, FileDown, Calendar, PieChart, BarChart3, RefreshCw } from "lucide-react";

interface MonthlyData {
  month: string;
  count: number;
  total: number;
}

interface CategoryData {
  category: string;
  total: number;
  count: number;
}

export default function ReportsPage() {
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?year=${year}`)
      .then((r) => r.json())
      .then((d) => {
        setMonthly(d.monthly || []);
        setCategories(d.categories || []);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

  const totalYear = monthly.reduce((s, m) => s + m.total, 0);
  const maxVal = Math.max(...monthly.map((m) => m.total), 1);

  const MONTH_NAMES = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const handleExport = async (format: "xlsx" | "pdf") => {
    const res = await fetch(`/api/export?format=${format}&year=${year}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${year}.${format}`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>รายงานค่าใช้จ่าย</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              สรุปค่าใช้จ่ายรายปี / รายเดือน พร้อม Export
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
              {[2026, 2025, 2024].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => handleExport("xlsx")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
              <FileDown size={14} /> Excel
            </button>
            <button onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
              <FileDown size={14} /> PDF
            </button>
          </div>
        </div>

        {/* Year Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "ยอดรวมทั้งปี", value: fmt(totalYear), color: "var(--accent)" },
            { label: "จำนวนใบเสร็จ", value: String(monthly.reduce((s, m) => s + m.count, 0)) + " ใบ", color: "var(--accent-secondary)" },
            { label: "เฉลี่ยต่อเดือน", value: fmt(totalYear / 12), color: "#10b981" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{label}</div>
              <div className="text-2xl font-bold" style={{ color }}>{loading ? "..." : value}</div>
            </div>
          ))}
        </div>

        {/* Monthly Chart */}
        <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} style={{ color: "var(--accent)" }} />
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>ค่าใช้จ่ายรายเดือน {year}</h2>
          </div>

          {loading ? (
            <div className="flex items-end gap-2 h-48">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-1 rounded-t-lg animate-pulse"
                  style={{ background: "var(--muted)", height: `${20 + Math.random() * 80}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-48 mb-2">
              {MONTH_NAMES.map((name, idx) => {
                const d = monthly.find((m) => m.month === String(idx + 1).padStart(2, "0"));
                const pct = d ? (d.total / maxVal) * 100 : 0;
                return (
                  <div key={name} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative group">
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 cursor-pointer"
                        style={{
                          height: `${Math.max(pct, 2)}%`,
                          minHeight: "4px",
                          background: pct > 0
                            ? "linear-gradient(to top, var(--accent), var(--accent-secondary))"
                            : "var(--muted)",
                          opacity: pct > 0 ? 1 : 0.3,
                        }}
                      />
                      {d && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                          <div className="px-2 py-1.5 rounded-lg text-xs whitespace-nowrap"
                            style={{ background: "var(--foreground)", color: "var(--background)" }}>
                            {fmt(d.total)}<br />{d.count} ใบ
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between">
            {MONTH_NAMES.map((name) => (
              <div key={name} className="flex-1 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>ตารางสรุปรายเดือน</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                {["เดือน", "จำนวนใบเสร็จ", "ยอดก่อนภาษี", "VAT 7%", "ยอดรวม"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTH_NAMES.map((name, idx) => {
                const d = monthly.find((m) => m.month === String(idx + 1).padStart(2, "0"));
                return (
                  <tr key={name} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{name} {year}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{d?.count || 0}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {d ? fmt((d.total || 0) / 1.07) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {d ? fmt((d.total || 0) - (d.total || 0) / 1.07) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: d ? "var(--accent)" : "var(--muted-foreground)" }}>
                      {d ? fmt(d.total) : "—"}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: "rgba(59,130,246,0.05)" }}>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--foreground)" }}>รวมทั้งปี</td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  {monthly.reduce((s, m) => s + m.count, 0)}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>—</td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>—</td>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: "var(--accent)" }}>
                  {fmt(totalYear)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
