"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt, Search, Plus, Filter, FileDown, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle
} from "lucide-react";

interface ReceiptRow {
  id: string;
  vendorName: string | null;
  receiptNumber: string | null;
  issueDate: string | null;
  createdAt: string;
  totalAmount: number;
  currency: string;
  type: string;
  status: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; border: string; bg: string }> = {
  pending:  { label: "รอดำเนินการ",  color: "#f59e0b", border: "rgba(245,158,11,0.3)", bg: "transparent" },
  approved: { label: "อนุมัติแล้ว",   color: "#10b981", border: "rgba(16,185,129,0.3)", bg: "transparent" },
  rejected: { label: "ทิ้ง",         color: "#ef4444", border: "rgba(239,68,68,0.3)", bg: "transparent" },
  missing:  { label: "ส่งคืน",        color: "#8b5cf6", border: "rgba(139,92,246,0.3)", bg: "transparent" },
};

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ search, status: statusFilter, sortBy: "createdAt", page: String(page) });
    fetch(`/api/receipts?${params}`)
      .then((r) => r.json())
      .then((d) => { setReceipts(d.receipts || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  const fmt = (n: number, curr = "THB") =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(n);

  const totalPages = Math.ceil(total / 20);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-24 relative min-h-full">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>รายการใช้จ่าย</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>ทั้งหมด {total} รายการ</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2 text-sm hidden sm:flex">
              <FileDown size={14} /> ส่งออก
            </button>
            <Link href="/upload" className="btn-primary flex items-center gap-2 text-sm drop-shadow-sm" style={{ textDecoration: "none", padding: "10px 24px", borderRadius: "100px" }}>
              <Plus size={16} /> <span className="font-bold tracking-wide">เพิ่มรายการ</span>
            </Link>
          </div>
        </div>

        {/* Filters Area */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-4 rounded-2xl" style={{ border: "1px solid var(--card-border)" }}>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide flex-1">
            <button
              className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-all"
              style={{
                background: statusFilter === "all" ? "var(--accent)" : "var(--muted)",
                color: statusFilter === "all" ? "white" : "var(--muted-foreground)",
              }}
              onClick={() => { setStatusFilter("all"); setPage(1); }}>
              ทั้งหมด
            </button>
            {Object.entries({ pending: "รอดำเนินการ", approved: "อนุมัติแล้ว", rejected: "ทิ้ง", missing: "ส่งคืน" }).map(([k, label]) => (
              <button key={k}
                className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-all"
                style={{
                  background: statusFilter === k ? "var(--accent)" : "transparent",
                  color: statusFilter === k ? "white" : "var(--muted-foreground)",
                  border: statusFilter === k ? "none" : "1px solid var(--card-border)",
                }}
                onClick={() => { setStatusFilter(k); setPage(1); }}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
             <div className="flex items-center gap-2 flex-1 rounded-full px-4 py-2"
              style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}>
              <Search size={16} style={{ color: "var(--muted-foreground)" }} />
              <input type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="ค้นหา..."
                className="flex-1 bg-transparent text-sm outline-none w-full min-w-[150px]"
                style={{ color: "var(--foreground)" }} />
             </div>
             <button className="p-2.5 rounded-full border bg-white text-slate-500 hover:bg-slate-50 transition-colors" style={{ borderColor: "var(--card-border)" }}>
               <Filter size={18} />
             </button>
          </div>
        </div>

        {/* List Card */}
        <div className="rounded-3xl overflow-hidden bg-white shadow-sm" style={{ border: "1px solid var(--card-border)" }}>
          
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                  {["วันที่", "รายการ", "หมวดหมู่", "ยอดรวม", "สถานะ"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-4 rounded animate-pulse" style={{ background: "var(--muted)" }} />
                      </td>
                    ))}</tr>
                  ))
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">ไม่พบรายการที่ตรงกับการค้นหา</td>
                  </tr>
                ) : receipts.map((r) => {
                  const s = STATUS_MAP[r.status] || STATUS_MAP.pending;
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-slate-50 cursor-pointer"
                        onClick={() => window.location.href = `/receipts/${r.id}`}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {r.issueDate ? new Date(r.issueDate).toLocaleDateString("th-TH", { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(r.createdAt).toLocaleDateString("th-TH")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{r.vendorName || "รายการไม่มีผู้ขาย"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-3 py-1 rounded-full text-slate-500 bg-slate-100 uppercase tracking-wide">
                          {r.type === "invoice" ? "ค่าไฟ/น้ำ" : r.type === "voucher" ? "อุปกรณ์" : "ซอฟต์แวร์"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">{fmt(r.totalAmount, r.currency)}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide" 
                               style={{ color: s.color, border: `1px solid ${s.border}` }}>
                           {r.status === 'approved' && <CheckCircle2 size={12} />}
                           {r.status === 'pending' && <Clock size={12} />}
                           {(r.status === 'rejected' || r.status === 'missing') && <AlertCircle size={12} />}
                           {s.label}
                         </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y" style={{ borderColor: "var(--card-border)" }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4"><div className="h-16 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} /></div>
              ))
            ) : receipts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">ไม่พบรายการ</div>
            ) : receipts.map((r) => {
              const s = STATUS_MAP[r.status] || STATUS_MAP.pending;
              return (
                <div key={r.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
                  onClick={() => window.location.href = `/receipts/${r.id}`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--muted)" }}>
                    <Receipt size={18} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>{r.vendorName || "ไม่ระบุ"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {r.issueDate ? new Date(r.issueDate).toLocaleDateString("th-TH", { day: '2-digit', month: 'short' }) : "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>{fmt(r.totalAmount, r.currency)}</p>
                    <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: s.color }}>
                      {r.status === 'approved' && <CheckCircle2 size={10} />}
                      {r.status === 'pending' && <Clock size={10} />}
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50" style={{ borderColor: "var(--card-border)" }}>
            <span className="text-sm font-semibold text-slate-500">หน้า {page} จาก {Math.max(1, totalPages)}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={16}/></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Summary Dock */}
      <div className="fixed bottom-24 lg:bottom-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-4 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100" style={{ maxWidth: "calc(100% - 32px)" }}>
         <div className="flex-1 flex items-center justify-between pl-4 pr-6 min-w-[150px]">
           <span className="text-sm font-bold text-slate-400">ยอดรวม</span>
           <span className="text-2xl font-bold tracking-tight text-slate-800">฿68,450</span>
         </div>
         
         <div className="hidden sm:flex items-center justify-center px-6 border-l border-slate-100 flex-none relative">
           <div className="absolute top-0 right-4 w-2 h-2 rounded-full bg-red-500"></div>
           <span className="text-sm font-bold text-rose-500 mr-1.5 text-lg">3</span>
           <span className="text-sm font-bold text-slate-500">รายการ</span>
         </div>

         <div className="px-6 py-3 rounded-xl bg-blue-600 text-white flex-none cursor-pointer hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
           <span className="text-xl font-bold">฿12,500</span>
         </div>
         
         <button className="ml-1 w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors hidden lg:flex">
           <Filter size={20} />
         </button>
      </div>
    </AppLayout>
  );
}
