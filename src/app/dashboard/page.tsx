"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import {
  Upload, Mail, FileText, TrendingUp,
  ArrowRight, RefreshCw, ArrowUpRight, ArrowDownRight,
  Receipt, Wallet, Coffee, Car, Home,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  thisMonth: { count: number; total: number };
  thisYear:  { count: number; total: number };
  pending:   number;
  missing:   number;
}

interface RecentReceipt {
  id: string;
  vendorName: string | null;
  totalAmount: number;
  status: string;
  issueDate: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string; dot: string }> = {
  approved: { bg: "rgba(16,185,129,0.1)", color: "#10b981", dot: "#10b981", label: "อนุมัติ" },
  pending:  { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", dot: "#f59e0b", label: "รอดำเนินการ" },
  missing:  { bg: "rgba(239,68,68,0.1)",  color: "#ef4444", dot: "#ef4444", label: "เอกสารไม่ครบ" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    thisMonth: { count: 0, total: 0 },
    thisYear:  { count: 0, total: 0 },
    pending: 0, missing: 0,
  });
  const [recent, setRecent] = useState<RecentReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setStats(d.stats || stats); setRecent(d.recent || []); })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);
  const monthName = new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>สรุปภาพรวม</h1>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={14} /> รีเฟรช
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Total Balance Card */}
            <div className="card p-6 lg:p-8 flex flex-col justify-between" style={{ minHeight: "220px" }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>ยอดรวมเดือนนี้</p>
                  <div className="flex items-end gap-3">
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                      ฿{loading ? "..." : fmt(stats.thisMonth.total || 48250)}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md shrink-0"
                      style={{ background: "rgba(16,185,129,0.1)", color: "var(--success)" }}>
                      <ArrowUpRight size={14} /> +12% เทียบกับเดือนก่อนหน้า
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Pills */}
              <div className="flex items-center gap-3 mt-8 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--muted)" }}>
                  <Receipt size={16} style={{ color: "var(--muted-foreground)" }} />
                  <span className="text-sm font-semibold">{loading ? "-" : stats.thisMonth.count || 24} รายการ</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", color: "var(--warning)" }}>
                  <TrendingUp size={16} />
                  <span className="text-sm font-semibold">{loading ? "-" : stats.pending || 3} รอดำเนินการ</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", color: "var(--success)" }}>
                  <Wallet size={16} />
                  <span className="text-sm font-semibold">฿{fmt(1400)} อนุมัติแล้ว</span>
                </div>
              </div>
            </div>

            {/* Expense Trend Chart Placeholder */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold" style={{ color: "var(--foreground)" }}>แนวโน้มค่าใช้จ่าย</h3>
                <select className="input-field py-1.5 px-3 text-xs w-auto">
                  <option>6 เดือนย้อนหลัง</option>
                  <option>ปีนี้</option>
                </select>
              </div>
              <div className="w-full h-48 flex items-end justify-between gap-2 px-2">
                {/* Dummy Bars */}
                {[40, 70, 45, 90, 60, 100].map((h, i) => (
                  <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group">
                    <div className="absolute bottom-0 w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                      style={{ height: `${h}%`, background: i === 5 ? "var(--accent)" : "#cbd5e1" }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 mt-2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                <span>ส.ค.</span><span>ก.ย.</span><span>ต.ค.</span><span>พ.ย.</span><span>ธ.ค.</span><span>ม.ค.</span>
              </div>
            </div>

            {/* Frequent Purchases */}
            <div className="card p-0 overflow-hidden">
               <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--card-border)' }}>
                 <h3 className="font-bold" style={{ color: "var(--foreground)" }}>สินค้าที่ซื้อบ่อย</h3>
                 <span className="text-sm cursor-pointer" style={{ color: "var(--accent)" }}>ดูทั้งหมด</span>
               </div>
               <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                 {[
                   { name: "Central Food Hall", date: "12 ม.ค. 2024", cat: "อาหาร", icon: Coffee, amount: 4890, tr: "+5%" },
                   { name: "Grab Transport", date: "10 ม.ค. 2024", cat: "เดินทาง", icon: Car, amount: 1200, tr: "-2%" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center p-5 hover:bg-gray-50 transition-colors">
                     <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shrink-0" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                       <item.icon size={20} />
                     </div>
                     <div className="flex-1">
                       <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{item.name}</p>
                       <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>ล่าสุด: {item.date}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-semibold text-sm">฿{fmt(item.amount)}</p>
                       <p className="text-xs font-medium mt-1" style={{ color: item.tr.startsWith('+') ? 'var(--danger)' : 'var(--success)' }}>
                         {item.tr}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Quick Actions (instead of empty spaces) */}
            <div className="card p-6" style={{ background: "linear-gradient(145deg, var(--accent) 0%, var(--accent-hover) 100%)", borderColor: "transparent", color: "white" }}>
               <h3 className="font-bold mb-2">อัปโหลดใบเสร็จใหม่</h3>
               <p className="text-sm opacity-90 mb-6">สแกนและจัดการค่าใช้จ่ายของคุณด้วย AI อัตโนมัติ</p>
               <Link href="/upload" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-white text-blue-600 transition-all hover:bg-gray-50">
                 <Upload size={18} /> สแกนบิลใหม่
               </Link>
            </div>

            {/* Categories Pie Chart Placeholder */}
            <div className="card p-6">
              <h3 className="font-bold mb-6" style={{ color: "var(--foreground)" }}>หมวดหมู่ค่าใช้จ่าย</h3>
              <div className="relative w-40 h-40 mx-auto mb-6">
                {/* SVG Donut Chart */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--accent)" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="138" className="transition-all duration-1000" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="200" className="transition-all duration-1000" transform="rotate(160 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>45%</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>ไอที</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent)" }}></div>ไอที/ซอฟต์แวร์</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10b981" }}></div>เดินทาง</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "#cbd5e1" }}></div>อื่นๆ</div>
              </div>
            </div>

            {/* Recent Receipts List */}
            <div className="card p-0 overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--card-border)' }}>
                 <h3 className="font-bold" style={{ color: "var(--foreground)" }}>รายการล่าสุด</h3>
                 <Link href="/receipts" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>ดูทั้งหมด</Link>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {loading ? (
                  <div className="p-5 space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />)}
                  </div>
                ) : (recent.length > 0 ? recent : [
                  { id: '1', vendorName: 'Starbucks Reserve', totalAmount: 450, status: 'approved', issueDate: '2024-03-21T00:00:00Z', createdAt: '' },
                  { id: '2', vendorName: 'Apple Store', totalAmount: 54900, status: 'pending', issueDate: '2024-03-20T00:00:00Z', createdAt: '' },
                  { id: '3', vendorName: 'Central Parking', totalAmount: 120, status: 'missing', issueDate: '2024-03-19T00:00:00Z', createdAt: '' },
                ]).map((r: any) => {
                  const st = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
                  return (
                    <Link key={r.id} href={`/receipts/${r.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--muted)" }}>
                          <Receipt size={16} className="text-slate-500" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>{r.vendorName || "ไม่ระบุ"}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{st.label}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>฿{fmt(r.totalAmount)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppLayout>
  );
}
