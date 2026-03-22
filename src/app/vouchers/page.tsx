"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, Plus, AlertCircle, CheckCircle2, Printer } from "lucide-react";

interface VoucherForm {
  date: string; paidTo: string; amount: number; purpose: string; note: string;
}

export default function VouchersPage() {
  const [showForm, setShowForm] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<VoucherForm>({
    date: new Date().toISOString().split("T")[0], paidTo: "", amount: 0, purpose: "", note: "",
  });

  useEffect(() => {
    if (showForm && printAreaRef.current) printAreaRef.current.scrollTop = 0;
  }, [showForm]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ใบรับรองแทนใบเสร็จ</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              ออกใบรับรองแทนเมื่อไม่มีใบเสร็จต้นฉบับ
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> ออกใบรับรองแทน
          </button>
        </div>

        {/* Alert */}
        <div className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertCircle size={20} style={{ color: "#f59e0b" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>พบรายการที่ไม่มีใบเสร็จ 3 รายการ</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>กรุณาออกใบรับรองแทนใบเสร็จสำหรับรายการเหล่านี้</p>
          </div>
        </div>

        {/* Missing receipts */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="p-5 border-b" style={{ borderColor: "var(--card-border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>รายการที่รอใบรับรองแทน</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
            {[
              { id: "1", desc: "ค่าอาหารประชุม", amount: 450, date: "2026-03-10", requester: "สมชาย ใจดี" },
              { id: "2", desc: "ค่าจอดรถ", amount: 60, date: "2026-03-12", requester: "สมหญิง รักดี" },
              { id: "3", desc: "ค่าแท็กซี่", amount: 120, date: "2026-03-14", requester: "สมชาย ใจดี" },
            ].map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.08)" }}>
                  <AlertCircle size={18} style={{ color: "#f59e0b" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{item.desc}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(item.date).toLocaleDateString("th-TH")} • {item.requester}
                  </p>
                </div>
                <div className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--foreground)" }}>
                  ฿{item.amount.toLocaleString()}
                </div>
                <button
                  onClick={() => { setForm({ ...form, paidTo: item.requester, amount: item.amount, purpose: item.desc, date: item.date }); setShowForm(true); }}
                  className="btn-primary text-sm flex-shrink-0" style={{ padding: "6px 14px" }}>
                  ออกใบแทน
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {showForm && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-50 sm:flex sm:items-center sm:justify-center sm:p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
            <div className="absolute inset-x-0 bottom-0 sm:relative sm:inset-auto w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl animate-fade-in flex flex-col"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)", maxHeight: "92vh" }}>

              <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--card-border)" }} />
              </div>

              <div id="voucher-print" ref={printAreaRef} className="p-5 sm:p-8 overflow-y-auto flex-1"
                style={{ background: "white", color: "#000" }}>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">ใบรับรองแทนใบเสร็จ</h2>
                  <p className="text-sm text-gray-500 mt-1">Receipt Acknowledgment</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">วันที่</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border-b border-gray-300 w-full py-1 outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">จ่ายให้</label>
                    <input value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} className="border-b border-gray-300 w-full py-1 outline-none" placeholder="ชื่อผู้รับเงิน" />
                  </div>
                </div>
                <div className="mb-4 text-sm">
                  <label className="block text-gray-500 text-xs mb-1">วัตถุประสงค์</label>
                  <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="border-b border-gray-300 w-full py-1 outline-none" placeholder="รายละเอียดค่าใช้จ่าย" />
                </div>
                <div className="mb-6 text-sm">
                  <label className="block text-gray-500 text-xs mb-1">จำนวนเงิน</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="border-b border-gray-300 flex-1 py-1 outline-none font-bold text-lg" placeholder="0.00" />
                    <span className="text-gray-500">บาท</span>
                  </div>
                </div>
                <div className="mb-8 text-sm">
                  <label className="block text-gray-500 text-xs mb-1">หมายเหตุ</label>
                  <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="border-b border-gray-300 w-full py-1 outline-none resize-none" rows={2} placeholder="หมายเหตุ (ถ้ามี)" />
                </div>
                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div className="text-center">
                    <div className="border-b border-gray-300 mb-2 h-16" />
                    <p className="text-xs text-gray-500">ลายเซ็นผู้รับเงิน</p>
                    <p className="text-xs text-gray-400">({form.paidTo || "................................"})</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-300 mb-2 h-16" />
                    <p className="text-xs text-gray-500">ลายเซ็นผู้อนุมัติ</p>
                    <p className="text-xs text-gray-400">(................................)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">ยกเลิก</button>
                <div className="flex gap-3">
                  <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
                    <Printer size={14} /> พิมพ์
                  </button>
                  <button className="btn-primary flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} /> บันทึก
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AppLayout>
  );
}
