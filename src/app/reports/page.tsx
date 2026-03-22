"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { TrendingUp, FileDown, BarChart3, CalendarDays, Receipt, Wallet } from "lucide-react";

interface MonthlyData { month: string; count: number; total: number; }
interface CategoryData { category: string; total: number; count: number; }

export default function ReportsPage() {
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?year=${year}`)
      .then(r => r.json())
      .then(d => { setMonthly(d.monthly || []); setCategories(d.categories || []); })
      .finally(() => setLoading(false));
  }, [year]);

  const fmt = (n: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);
  const totalYear = monthly.reduce((s, m) => s + m.total, 0);
  const maxVal = Math.max(...monthly.map(m => m.total), 1);
  const MONTH_NAMES = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const handleExport = async (format: "xlsx" | "pdf") => {
    const res = await fetch(`/api/export?format=${format}&year=${year}`);
    const blob = await res.blob(); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-${year}.${format}`; a.click();
  };

  const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#f97316", "#14b8a6", "#6366f1", "#84cc16", "#a855f7"];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12 min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>รายงานค่าใช้จ่าย</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              สรุปภาพรวมค่าใช้จ่ายและสถิติรายปี
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--card-border)' }}>
               <CalendarDays size={16} className="text-slate-400" />
               <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent text-sm font-semibold outline-none text-slate-700 cursor-pointer">
                 {[2026, 2025, 2024].map(y => <option key={y} value={y}>ปี {y}</option>)}
               </select>
            </div>
            
            <button onClick={() => handleExport("xlsx")} className="btn-secondary flex items-center gap-2 text-sm shadow-sm bg-white hover:bg-slate-50">
              <FileDown size={14} /> <span className="hidden sm:inline">ส่งออก</span> Excel
            </button>
            <button onClick={() => handleExport("pdf")} className="btn-secondary flex items-center gap-2 text-sm shadow-sm bg-white hover:bg-slate-50">
              <FileDown size={14} /> <span className="hidden sm:inline">ส่งออก</span> PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Card 1 */}
           <div className="card p-6 lg:p-8 flex flex-col justify-between" style={{ minHeight: "160px", background: "linear-gradient(145deg, var(--accent) 0%, var(--accent-hover) 100%)", borderColor: "transparent", color: "white" }}>
              <div className="flex items-center gap-3 mb-2 opacity-90">
                 <Wallet size={20} />
                 <span className="text-sm font-medium">ยอดรวมทั้งปี</span>
              </div>
              <div>
                 <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">฿{loading ? "..." : fmt(totalYear)}</h2>
              </div>
           </div>

           {/* Card 2 */}
           <div className="card p-6 lg:p-8 flex flex-col justify-between" style={{ minHeight: "160px" }}>
              <div className="flex items-center gap-3 mb-2" style={{ color: "var(--muted-foreground)" }}>
                 <Receipt size={20} className="text-blue-500" />
                 <span className="text-sm font-medium">จำนวนบิลทั้งหมด</span>
              </div>
              <div>
                 <h2 className="text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                   {loading ? "..." : monthly.reduce((s, m) => s + m.count, 0)} <span className="text-lg font-medium text-slate-400">ใบ</span>
                 </h2>
              </div>
           </div>

           {/* Card 3 */}
           <div className="card p-6 lg:p-8 flex flex-col justify-between" style={{ minHeight: "160px" }}>
              <div className="flex items-center gap-3 mb-2" style={{ color: "var(--muted-foreground)" }}>
                 <TrendingUp size={20} className="text-emerald-500" />
                 <span className="text-sm font-medium">เฉลี่ยต่อเดือน</span>
              </div>
              <div>
                 <h2 className="text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                   ฿{loading ? "..." : fmt(totalYear / 12)}
                 </h2>
              </div>
           </div>
        </div>

        {/* Bar Chart Section */}
        <div className="card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent)" }}>
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>สถิติค่าใช้จ่ายรายเดือน</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>ข้อมูลเปรียบเทียบตลอดปี {year}</p>
            </div>
          </div>

          {loading ? (
             <div className="flex items-end justify-between gap-2 h-64 px-2">
               {[...Array(12)].map((_, i) => (
                 <div key={i} className="w-full max-w-16 rounded-t-xl animate-pulse" style={{ background: "var(--muted)", height: `${20 + Math.random() * 80}%` }} />
               ))}
             </div>
          ) : (
             <div className="relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50" style={{ borderBottom: '1px solid var(--card-border)' }}>
                   {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-0 border-t border-dashed" style={{ borderColor: 'var(--card-border)' }} />)}
                </div>
                
                <div className="flex items-end justify-between gap-2 h-64 px-2 mb-4 relative z-10 w-full overflow-x-auto scrollbar-hide">
                  {MONTH_NAMES.map((name, idx) => {
                    const d = monthly.find(m => m.month === String(idx + 1).padStart(2, "0"));
                    const pct = d ? (d.total / maxVal) * 100 : 0;
                    return (
                      <div key={name} className="flex-1 flex flex-col items-center gap-2 group min-w-[30px] sm:min-w-0">
                        <div className="w-full max-w-16 relative flex justify-center h-full items-end">
                          <div className="w-full rounded-t-xl transition-all duration-700 ease-out cursor-pointer hover:opacity-100 shadow-sm"
                            style={{
                              height: `${Math.max(pct, 2)}%`,
                              background: pct > 0 ? "var(--accent)" : "var(--muted)",
                              opacity: pct > 0 ? 0.9 : 0.4,
                            }} />
                          
                          {/* Tooltip */}
                          {d && (
                            <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center z-20">
                              <div className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shadow-xl"
                                style={{ background: "var(--foreground)", color: "white" }}>
                                ฿{fmt(d.total)}
                                <span className="block text-[10px] text-slate-300 font-normal text-center mt-0.5">{d.count} รายการ</span>
                              </div>
                              <div className="w-2 h-2 rotate-45 -mt-1" style={{ background: "var(--foreground)" }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          )}
          
          <div className="flex justify-between px-2 mt-2 border-t pt-4" style={{ borderColor: "var(--card-border)" }}>
             {MONTH_NAMES.map(name => (
               <div key={name} className="flex-1 text-center text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                 {name}
               </div>
             ))}
          </div>
        </div>

        {/* Monthly Table */}
        <div className="card overflow-hidden">
          <div className="p-6 lg:px-8 border-b flex items-center justify-between" style={{ borderColor: "var(--card-border)" }}>
            <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>รายละเอียดรายเดือน</h2>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b" style={{ borderColor: "var(--card-border)" }}>
                  {["เดือน", "จำนวนบิล", "ยอดก่อนภาษี", "VAT 7%", "ยอดรวม"].map((h, i) => (
                    <th key={h} className={`px-6 lg:px-8 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase ${i >= 2 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {MONTH_NAMES.map((name, idx) => {
                  const d = monthly.find(m => m.month === String(idx + 1).padStart(2, "0"));
                  if (!d && year < new Date().getFullYear() && idx > new Date().getMonth()) return null; // hide future months loosely
                  
                  return (
                    <tr key={name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 lg:px-8 py-4">
                         <span className="text-sm font-semibold text-slate-700">{name} {year}</span>
                      </td>
                      <td className="px-6 lg:px-8 py-4">
                         <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                           {d?.count || 0}
                         </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 text-right">
                         <span className="text-sm font-medium text-slate-500">
                           {d ? `฿${fmt((d.total || 0) / 1.07)}` : "—"}
                         </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 text-right">
                         <span className="text-sm font-medium text-slate-500">
                           {d ? `฿${fmt((d.total || 0) - (d.total || 0) / 1.07)}` : "—"}
                         </span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 text-right">
                         <span className="text-sm font-bold" style={{ color: d ? "var(--foreground)" : "var(--muted-foreground)" }}>
                           {d ? `฿${fmt(d.total)}` : "—"}
                         </span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Footer totals row */}
                <tr className="bg-blue-50/50">
                  <td className="px-6 lg:px-8 py-5">
                    <span className="text-sm font-bold text-blue-800">รวมกระแสเงินสดทั้งปี</span>
                  </td>
                  <td className="px-6 lg:px-8 py-5">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                      {monthly.reduce((s, m) => s + m.count, 0)} ใบ
                    </span>
                  </td>
                  <td className="px-6 lg:px-8 py-5 text-right"><span className="text-sm font-bold text-blue-800">—</span></td>
                  <td className="px-6 lg:px-8 py-5 text-right"><span className="text-sm font-bold text-blue-800">—</span></td>
                  <td className="px-6 lg:px-8 py-5 text-right">
                     <span className="text-lg font-bold text-blue-700">฿{fmt(totalYear)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </AppLayout>
  );
}
