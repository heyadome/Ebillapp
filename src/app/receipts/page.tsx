"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt, Search, Filter, Download, ArrowUpDown,
  Plus, ChevronDown, Calendar, MoreVertical, FileDown
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

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "รอดำเนินการ", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  approved: { label: "อนุมัติแล้ว", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  rejected: { label: "ไม่อนุมัติ", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  missing: { label: "เอกสารไม่ครบ", color: "var(--accent-secondary)", bg: "rgba(223,64,255,0.1)" },
};

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ search, status: statusFilter, sortBy, page: String(page) });
    fetch(`/api/receipts?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setReceipts(d.receipts || []);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, sortBy, page]);

  const fmt = (n: number, curr = "THB") =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(n);

  const handleExport = async () => {
    const res = await fetch("/api/export?format=xlsx");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts-${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ใบเสร็จทั้งหมด</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              ทั้งหมด {total} รายการ
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors whitespace-nowrap"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
              <FileDown size={13} /> ส่งออก Excel
            </button>
            <Link href="/upload"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
              style={{
                background: "rgba(0,212,255,0.12)",
                color: "var(--accent)",
                border: "1px solid rgba(0,212,255,0.35)",
                boxShadow: "0 0 12px rgba(0,212,255,0.15)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.03em",
                textDecoration: "none",
              }}>
              <Plus size={14} /> เพิ่มใบเสร็จ
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-64 rounded-xl px-3 py-2.5"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="ค้นหาผู้ขาย, เลขที่เอกสาร..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "missing"].map((s) => (
              <button key={s}
                className="px-3 py-2 rounded-xl text-xs transition-colors"
                style={{
                  background: statusFilter === s ? "rgba(59,130,246,0.15)" : "var(--card)",
                  color: statusFilter === s ? "var(--accent)" : "var(--muted-foreground)",
                  border: `1px solid ${statusFilter === s ? "rgba(59,130,246,0.3)" : "var(--card-border)"}`,
                }}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s === "all" ? "ทั้งหมด" : STATUS_MAP[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile card list / Desktop table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>

          {/* ── Desktop table (hidden on mobile) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  {["วันที่", "ผู้ขาย / ร้านค้า", "เลขที่เอกสาร", "ยอดรวม", "ประเภท", "สถานะ", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium"
                      style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded animate-pulse" style={{ background: "var(--muted)" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Receipt size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--muted-foreground)" }} />
                      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>ไม่พบใบเสร็จ</p>
                      <Link href="/upload" className="text-xs mt-2 inline-block" style={{ color: "var(--accent)" }}>
                        อัปโหลดใบเสร็จแรก →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  receipts.map((r) => {
                    const s = STATUS_MAP[r.status] || STATUS_MAP.pending;
                    return (
                      <tr key={r.id}
                        className="transition-colors hover:bg-white/3 cursor-pointer"
                        style={{ borderBottom: "1px solid var(--card-border)" }}
                        onClick={() => window.location.href = `/receipts/${r.id}`}
                      >
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                          {r.issueDate ? new Date(r.issueDate).toLocaleDateString("th-TH") : new Date(r.createdAt).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{r.vendorName || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>{r.receiptNumber || "—"}</td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>{fmt(r.totalAmount, r.currency)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                            {r.type === "invoice" ? "ใบกำกับภาษี" : r.type === "voucher" ? "ใบรับรองแทน" : "ใบเสร็จ"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/receipts/${r.id}`} className="text-xs px-3 py-1 rounded-lg"
                            style={{ background: "var(--muted)", color: "var(--accent)" }}
                            onClick={(e) => e.stopPropagation()}>
                            ดูรายละเอียด
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list (hidden on md+) ── */}
          <div className="md:hidden divide-y" style={{ borderColor: "var(--card-border)" }}>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-4 w-40 rounded animate-pulse" style={{ background: "var(--muted)" }} />
                  <div className="h-3 w-24 rounded animate-pulse" style={{ background: "var(--muted)" }} />
                </div>
              ))
            ) : receipts.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>ไม่พบใบเสร็จ</p>
                <Link href="/upload" className="text-xs mt-2 inline-block" style={{ color: "var(--accent)" }}>อัปโหลดใบเสร็จแรก →</Link>
              </div>
            ) : (
              receipts.map((r) => {
                const s = STATUS_MAP[r.status] || STATUS_MAP.pending;
                return (
                  <Link key={r.id} href={`/receipts/${r.id}`}
                    className="flex items-center gap-3 p-4"
                    style={{ borderColor: "var(--card-border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--muted)" }}>
                      <Receipt size={18} style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {r.vendorName || "ไม่ระบุผู้ขาย"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {r.issueDate ? new Date(r.issueDate).toLocaleDateString("th-TH") : new Date(r.createdAt).toLocaleDateString("th-TH")}
                        {r.receiptNumber && <span className="ml-2 font-mono">#{r.receiptNumber}</span>}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{fmt(r.totalAmount, r.currency)}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--card-border)" }}>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                หน้า {page} จาก {Math.ceil(total / 20)}
              </span>
              <div className="flex gap-2">
                <button disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-40"
                  style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                  ก่อนหน้า
                </button>
                <button disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-40"
                  style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
