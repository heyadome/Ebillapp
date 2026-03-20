"use client";
import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Receipt, Calendar, Building2, Hash, FileText,
  CheckCircle2, AlertCircle, Edit2, Trash2, Download, ExternalLink
} from "lucide-react";
import Link from "next/link";

interface ReceiptDetail {
  id: string;
  type: string;
  receiptNumber: string | null;
  issueDate: string | null;
  vendorName: string | null;
  vendorTaxId: string | null;
  vendorAddress: string | null;
  currency: string;
  totalAmount: number;
  subtotal: number;
  vat: number;
  wht: number;
  status: string;
  note: string | null;
  imageUrl: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    category: string | null;
  }>;
}

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/receipts/${id}`)
      .then((r) => r.json())
      .then((d) => setReceipt(d))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(n);

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded" style={{ background: "var(--muted)" }} />
          <div className="h-64 rounded-2xl" style={{ background: "var(--card)" }} />
        </div>
      </AppLayout>
    );
  }

  if (!receipt) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <Receipt size={48} className="mx-auto mb-4 opacity-20" style={{ color: "var(--muted-foreground)" }} />
          <p style={{ color: "var(--foreground)" }}>ไม่พบใบเสร็จ</p>
          <Link href="/receipts" className="text-sm mt-2 inline-block" style={{ color: "var(--accent)" }}>
            ← กลับหน้าใบเสร็จ
          </Link>
        </div>
      </AppLayout>
    );
  }

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "รอดำเนินการ", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    approved: { label: "อนุมัติแล้ว", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    rejected: { label: "ไม่อนุมัติ", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  };
  const s = statusMap[receipt.status] || statusMap.pending;

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6 animate-fade-in">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Link href="/receipts"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--muted-foreground)" }}>
            <ArrowLeft size={16} /> กลับ
          </Link>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: s.bg, color: s.color }}>
              {receipt.status === "approved" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {s.label}
            </span>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
              <Edit2 size={14} /> แก้ไข
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                    {receipt.vendorName || "ไม่ระบุผู้ขาย"}
                  </h1>
                  <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                    {receipt.type === "invoice" ? "ใบกำกับภาษี" : receipt.type === "voucher" ? "ใบรับรองแทน" : "ใบเสร็จรับเงิน"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    {fmt(receipt.totalAmount)}
                    <span className="text-sm ml-1" style={{ color: "var(--muted-foreground)" }}>{receipt.currency}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Hash, label: "เลขที่เอกสาร", value: receipt.receiptNumber || "—" },
                  { icon: Calendar, label: "วันที่ออกเอกสาร", value: receipt.issueDate ? new Date(receipt.issueDate).toLocaleDateString("th-TH") : "—" },
                  { icon: Building2, label: "เลขประจำตัวผู้เสียภาษี", value: receipt.vendorTaxId || "—" },
                  { icon: FileText, label: "วันที่อัปโหลด", value: new Date(receipt.createdAt).toLocaleDateString("th-TH") },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "var(--muted)" }}>
                    <Icon size={16} className="mt-0.5" style={{ color: "var(--muted-foreground)" }} />
                    <div>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                      <p className="text-sm font-medium mt-0.5" style={{ color: "var(--foreground)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {receipt.vendorAddress && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--muted)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>ที่อยู่ผู้ขาย</p>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{receipt.vendorAddress}</p>
                </div>
              )}
            </div>

            {/* Line Items */}
            {receipt.items.length > 0 && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
                  <h2 className="font-medium" style={{ color: "var(--foreground)" }}>รายการค่าใช้จ่าย</h2>
                </div>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                      {["รายละเอียด", "จำนวน", "ราคา/หน่วย", "รวม"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: "var(--foreground)" }}>{item.description}</p>
                          {item.category && (
                            <span className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block"
                              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{item.quantity}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{fmt(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--foreground)" }}>{fmt(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tax Summary */}
            <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h2 className="font-medium mb-4" style={{ color: "var(--foreground)" }}>สรุปยอด</h2>
              <div className="space-y-2">
                {[
                  { label: "ยอดก่อนภาษี", value: receipt.subtotal },
                  { label: "VAT 7%", value: receipt.vat },
                  { label: "หัก ณ ที่จ่าย (WHT)", value: -receipt.wht },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                    <span style={{ color: value < 0 ? "#ef4444" : "var(--foreground)" }}>
                      {value < 0 ? "-" : ""}{fmt(Math.abs(value))} {receipt.currency}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: "var(--card-border)" }}>
                  <span style={{ color: "var(--foreground)" }}>ยอดรวมทั้งสิ้น</span>
                  <span style={{ color: "var(--accent)" }}>{fmt(receipt.totalAmount)} {receipt.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Image */}
            {receipt.imageUrl && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--card-border)" }}>
                <img src={receipt.imageUrl} alt="ใบเสร็จ"
                  className="w-full object-cover max-h-80" />
              </div>
            )}

            {/* Actions */}
            <div className="rounded-2xl p-5 space-y-2"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h2 className="font-medium mb-3" style={{ color: "var(--foreground)" }}>ดำเนินการ</h2>
              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-colors"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
                onClick={() => fetch(`/api/receipts/${id}/approve`, { method: "POST" })}>
                <CheckCircle2 size={16} /> อนุมัติใบเสร็จ
              </button>
              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-colors"
                style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
                <Download size={16} /> ดาวน์โหลด PDF
              </button>
              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-colors"
                style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
                <ExternalLink size={16} /> บันทึกใน Drive
              </button>
              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm text-left transition-colors"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                onClick={async () => {
                  if (confirm("ต้องการลบใบเสร็จนี้?")) {
                    await fetch(`/api/receipts/${id}`, { method: "DELETE" });
                    router.push("/receipts");
                  }
                }}>
                <Trash2 size={16} /> ลบใบเสร็จ
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
