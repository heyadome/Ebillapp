"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useRef, useCallback } from "react";
import {
  FileImage, X, Loader2, CheckCircle2,
  ChevronRight, Sparkles, Plus, Trash2, CloudUpload, FileText, AlertCircle, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

type Tab = "header" | "items" | "docs";

interface LineItem {
  id: string; description: string; type: string;
  quantity: number; unitPrice: number; amount: number; category: string;
}

interface FormData {
  type: string; receiptNumber: string; issueDate: string;
  vendorName: string; vendorTaxId: string; vendorAddress: string;
  customerName: string; customerTaxId: string; customerAddress: string;
  currency: string; totalAmount: number; subtotal: number;
  discount: number; vat: number; wht: number; note: string;
}

const EMPTY_FORM: FormData = {
  type: "receipt", receiptNumber: "", issueDate: "", vendorName: "",
  vendorTaxId: "", vendorAddress: "", customerName: "", customerTaxId: "",
  customerAddress: "", currency: "THB",
  totalAmount: 0, subtotal: 0, discount: 0, vat: 0, wht: 0, note: "",
};

const CATEGORIES = [
  "ไอที & ซอฟต์แวร์", "การตลาด", "สำนักงาน", "เดินทาง",
  "อาหาร & เครื่องดื่ม", "สาธารณูปโภค", "บุคลากร", "อื่นๆ"
];

export default function UploadPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("header");
  const [dragging, setDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<LineItem[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Core scan — accepts file directly to avoid state timing issues */
  const scanFile = useCallback(async (file: File) => {
    setScanning(true);
    setScanDone(false);
    setScanError(null);
    setAiProvider(null);

    try {
      const fd = new globalThis.FormData();
      fd.append("image", file);
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const data = await res.json();

      if (data.result) {
        const r = data.result;
        setForm(prev => ({
          ...prev,
          type: r.type || prev.type,
          receiptNumber: r.receiptNumber || prev.receiptNumber,
          issueDate: r.issueDate || prev.issueDate,
          vendorName: r.vendorName || prev.vendorName,
          vendorTaxId: r.vendorTaxId || prev.vendorTaxId,
          vendorAddress: r.vendorAddress || prev.vendorAddress,
          customerName: r.customerName || prev.customerName,
          customerTaxId: r.customerTaxId || prev.customerTaxId,
          customerAddress: r.customerAddress || prev.customerAddress,
          totalAmount: r.totalAmount || prev.totalAmount,
          subtotal: r.subtotal || prev.subtotal,
          discount: r.discount || prev.discount,
          vat: r.vat || prev.vat,
          wht: r.wht || prev.wht,
          note: r.note || prev.note,
        }));
        if (r.items?.length > 0) {
          setItems(r.items.map((item: Record<string, unknown>, i: number) => ({
            id: String(i),
            description: String(item.description || ""),
            type: String(item.type || "service"),
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            amount: Number(item.amount) || 0,
            category: "",
          })));
        }
        setAiProvider(data.provider || null);
        setScanDone(true);
        setTab("header");
      } else {
        setScanError(data.error || "ไม่สามารถอ่านข้อมูลได้ กรุณาลองใหม่หรือกรอกข้อมูลเอง");
      }
    } catch {
      setScanError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setScanning(false);
    }
  }, []);

  /** Handle file selection — auto-triggers scan immediately */
  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/*|application\/pdf/)) return;
    setImageFile(file);
    setScanDone(false);
    setScanError(null);

    if (file.type === "application/pdf") {
      setImagePreview("__pdf__");
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Auto-scan immediately — pass file directly (don't read from state)
    scanFile(file);
  }, [scanFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleReset = () => {
    setImagePreview(null);
    setImageFile(null);
    setScanDone(false);
    setScanError(null);
    setAiProvider(null);
    setForm(EMPTY_FORM);
    setItems([]);
    setTab("header");
  };

  const addItem = () => setItems(prev => [...prev, {
    id: String(Date.now()), description: "", type: "service",
    quantity: 1, unitPrice: 0, amount: 0, category: ""
  }]);

  const updateItem = (id: string, key: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [key]: value };
      if (key === "quantity" || key === "unitPrice") {
        updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const imageUrl = imagePreview === "__pdf__" ? null : imagePreview;
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, imageUrl }),
      });
      const data = await res.json();
      if (data.id) router.push(`/receipts/${data.id}`);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const providerLabel = (p: string | null) => {
    if (p === "claude") return "Claude AI";
    if (p === "gemini") return "Gemini AI";
    if (p === "chatgpt") return "ChatGPT";
    return p || "";
  };

  return (
    <AppLayout>
      <div className="min-h-[600px] animate-fade-in flex flex-col pt-2 pb-6 px-1 lg:px-4">

        <div className="mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)", fontFamily: "'Manrope', sans-serif" }}>สแกนบิล</h1>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Upload Zone ── */}
          <div className="lg:col-span-8 flex flex-col gap-4 h-full">
            <div className="flex-1 card p-6 lg:p-10 flex flex-col justify-center items-center relative overflow-hidden"
              style={{ background: "white", borderRadius: "24px" }}>

              <div className={`w-full max-w-2xl h-full min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative
                ${dragging ? "border-blue-500 bg-blue-50" : scanning ? "border-blue-300 bg-blue-50/40" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300"}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}>

                {imagePreview ? (
                  <div className="w-full h-full p-4 relative flex items-center justify-center">
                    {/* File preview */}
                    {imagePreview === "__pdf__" ? (
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center">
                          <FileText size={48} className="text-red-500" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-700">{imageFile?.name}</p>
                          <p className="text-sm text-slate-400 mt-1">ไฟล์ PDF</p>
                        </div>
                      </div>
                    ) : (
                      <img src={imagePreview} alt="preview"
                        className="max-w-full max-h-[340px] object-contain rounded-xl shadow-sm" />
                    )}

                    {/* Scanning overlay */}
                    {scanning && (
                      <div className="absolute inset-0 bg-white/80 rounded-3xl flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                            <Sparkles size={28} className="text-blue-500" />
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                        </div>
                        <p className="font-bold text-slate-700">กำลังอ่านข้อมูล...</p>
                        <p className="text-sm text-slate-400">AI กำลังวิเคราะห์เอกสาร</p>
                      </div>
                    )}

                    {/* Action buttons (top-right) */}
                    {!scanning && (
                      <div className="absolute top-6 right-6 flex gap-2">
                        <button
                          title="สแกนใหม่"
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-slate-700 hover:text-blue-600 transition-colors"
                          onClick={() => imageFile && scanFile(imageFile)}>
                          <RefreshCw size={18} />
                        </button>
                        <button
                          title="เปลี่ยนไฟล์"
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-slate-700 hover:text-red-600 transition-colors"
                          onClick={handleReset}>
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center px-6 pointer-events-none">
                    <div className="mx-auto w-24 h-24 mb-6 rounded-full flex items-center justify-center bg-blue-50">
                      <CloudUpload size={48} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">อัปโหลดรูปภาพหรือไฟล์ PDF</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                      รองรับ JPG, PNG, HEIC และ PDF — ระบบจะสแกนข้อมูลอัตโนมัติทันที
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
                      <button
                        className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-full text-base font-semibold shadow-xl shadow-blue-500/20"
                        onClick={() => fileRef.current?.click()}>
                        เลือกไฟล์
                      </button>
                    </div>
                  </div>
                )}

                <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>

              {/* Status bar */}
              <div className="mt-4 w-full max-w-2xl px-2 min-h-[36px]">
                {scanDone && !scanError && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold animate-fade-in">
                    <CheckCircle2 size={16} />
                    สแกนเสร็จสิ้น
                    {aiProvider && (
                      <span className="ml-auto text-xs text-green-500 font-medium">{providerLabel(aiProvider)}</span>
                    )}
                  </div>
                )}
                {scanError && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">สแกนไม่สำเร็จ</p>
                      <p className="text-xs mt-0.5 text-red-500">{scanError}</p>
                    </div>
                    {imageFile && (
                      <button
                        className="text-xs font-bold text-red-600 hover:text-red-800 shrink-0 underline"
                        onClick={() => imageFile && scanFile(imageFile)}>
                        ลองใหม่
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="lg:col-span-4 flex flex-col h-full bg-white rounded-[24px] border shadow-sm overflow-hidden"
            style={{ borderColor: "var(--card-border)" }}>

            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--card-border)" }}>
              <h3 className="text-lg font-bold text-slate-800">รายละเอียดบิล</h3>
              {scanning && (
                <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold">
                  <Loader2 size={14} className="animate-spin" /> กำลังสแกน...
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

              {/* Scanning placeholder */}
              {scanning && (
                <div className="space-y-3 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl bg-slate-100" style={{ width: `${70 + (i % 3) * 10}%` }} />
                  ))}
                </div>
              )}

              {!scanning && (
                <>
                  {/* Progress */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: tab === "header" ? "33%" : tab === "items" ? "66%" : "100%" }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 shrink-0">
                      {tab === "header" ? "1" : tab === "items" ? "2" : "3"} / 3
                    </span>
                  </div>

                  {/* Total amount */}
                  <div className="mb-6 text-center py-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 mb-1">ยอดรวมทั้งสิ้น</p>
                    <h2 className="text-4xl font-bold text-blue-600">
                      ฿ {form.totalAmount ? fmt(form.totalAmount) : "0.00"}
                    </h2>
                  </div>

                  {tab === "header" && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Vendor */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">ผู้ขาย / ร้านค้า</label>
                        <input value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                          className="input-field bg-slate-50 border-transparent focus:bg-white text-sm" placeholder="ชื่อร้านค้า/บริษัท" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">เลขผู้เสียภาษีผู้ขาย</label>
                          <input value={form.vendorTaxId} onChange={(e) => setForm({ ...form, vendorTaxId: e.target.value })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="0000000000000" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">เลขที่บิล</label>
                          <input value={form.receiptNumber} onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="—" />
                        </div>
                      </div>

                      {/* Customer */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">ลูกค้า / ผู้ซื้อ</label>
                        <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                          className="input-field bg-slate-50 border-transparent focus:bg-white text-sm" placeholder="ชื่อลูกค้า (ถ้ามี)" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">เลขผู้เสียภาษีลูกค้า</label>
                        <input value={form.customerTaxId} onChange={(e) => setForm({ ...form, customerTaxId: e.target.value })}
                          className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="0000000000000" />
                      </div>

                      {/* Date + Type */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">วันที่ออกเอกสาร</label>
                          <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">ประเภท</label>
                          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs">
                            <option value="receipt">ใบเสร็จรับเงิน</option>
                            <option value="invoice">ใบกำกับภาษี</option>
                          </select>
                        </div>
                      </div>

                      {/* Amounts */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">ยอดเงิน</label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">ยอดก่อน VAT (฿)</label>
                          <input type="number" value={form.subtotal || ""} onChange={(e) => setForm({ ...form, subtotal: parseFloat(e.target.value) || 0 })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">ส่วนลด (฿)</label>
                          <input type="number" value={form.discount || ""} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="0.00" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">VAT (฿)</label>
                          <input type="number" value={form.vat || ""} onChange={(e) => setForm({ ...form, vat: parseFloat(e.target.value) || 0 })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">WHT (฿)</label>
                          <input type="number" value={form.wht || ""} onChange={(e) => setForm({ ...form, wht: parseFloat(e.target.value) || 0 })}
                            className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">ยอดรวมสุทธิ (฿)</label>
                        <input type="number" value={form.totalAmount || ""} onChange={(e) => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })}
                          className="input-field bg-white border-blue-200 focus:bg-white text-sm font-bold" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">หมายเหตุ / เลขอ้างอิง</label>
                        <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                          className="input-field bg-slate-50 border-transparent focus:bg-white text-xs" placeholder="—" />
                      </div>
                    </div>
                  )}

                  {tab === "items" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-slate-700">รายการสินค้าย่อย</label>
                        <button onClick={addItem} className="text-xs font-bold text-blue-600 flex items-center gap-1">
                          <Plus size={14} /> เพิ่ม
                        </button>
                      </div>
                      {items.length === 0 && (
                        <p className="text-sm text-center text-slate-400 py-6">ไม่มีรายการย่อย</p>
                      )}
                      {items.map((item) => (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-xl space-y-3 relative group">
                          <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                            className="absolute right-2 top-2 p-1.5 rounded-md bg-white text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                          <input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold outline-none text-slate-700 placeholder:font-normal" placeholder="ชื่อรายการ..." />
                          <div className="flex gap-2 items-center border-t border-slate-200 pt-3">
                            <input type="number" value={item.amount || ""} onChange={(e) => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                              className="w-20 shrink-0 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-center font-bold" placeholder="฿0" />
                            <select value={item.category} onChange={(e) => updateItem(item.id, "category", e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-600 outline-none">
                              <option value="">เลือกหมวดหมู่...</option>
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "docs" && (
                    <div className="space-y-4 animate-fade-in text-center py-6">
                      <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <FileImage size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">แนบหลักฐานเพิ่มเติม (เลือกได้)</p>
                      <p className="text-xs text-slate-500 mb-4 px-4">เช่น สลิปโอนเงิน หรือเอกสารประกอบการเบิกจ่าย</p>
                      <button className="btn-secondary rounded-full px-6 py-2 text-sm mx-auto">เลือกไฟล์แนบ</button>
                    </div>
                  )}

                  <div className="mt-8" />
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-slate-50" style={{ borderColor: "var(--card-border)" }}>
              {tab !== "docs" ? (
                <button
                  className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm mb-3 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  disabled={scanning}
                  onClick={() => {
                    const o: Tab[] = ["header", "items", "docs"];
                    const i = o.indexOf(tab);
                    if (i < o.length - 1) setTab(o[i + 1]);
                  }}>
                  ถัดไป <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm mb-3 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  onClick={handleSave}
                  disabled={saving || !form.vendorName || scanning}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {saving ? "กำลังบันทึก..." : "ยืนยันข้อมูล"}
                </button>
              )}
              <div className="text-center">
                <button className="text-xs font-bold text-red-500 hover:text-red-600 py-2 inline-block" onClick={handleReset}>
                  ยกเลิก / ทิ้ง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
