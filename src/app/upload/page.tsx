"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useRef, useCallback } from "react";
import {
  Upload, Camera, FileImage, X, Loader2, CheckCircle2,
  ChevronRight, ChevronLeft, Sparkles, AlertCircle, Plus, Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";

type Tab = "header" | "items" | "docs";

interface LineItem {
  id: string;
  description: string;
  type: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category: string;
}

interface FormData {
  type: string;
  receiptNumber: string;
  issueDate: string;
  vendorName: string;
  vendorTaxId: string;
  vendorAddress: string;
  currency: string;
  totalAmount: number;
  subtotal: number;
  vat: number;
  wht: number;
  note: string;
}

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
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<LineItem[]>([]);
  const [form, setForm] = useState<FormData>({
    type: "receipt",
    receiptNumber: "",
    issueDate: "",
    vendorName: "",
    vendorTaxId: "",
    vendorAddress: "",
    currency: "THB",
    totalAmount: 0,
    subtotal: 0,
    vat: 0,
    wht: 0,
    note: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/*|application\/pdf/)) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleScan = async () => {
    if (!imageFile) return;
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const data = await res.json();
      if (data.result) {
        const r = data.result;
        setForm((prev) => ({
          ...prev,
          type: r.type || prev.type,
          receiptNumber: r.receiptNumber || prev.receiptNumber,
          issueDate: r.issueDate || prev.issueDate,
          vendorName: r.vendorName || prev.vendorName,
          vendorTaxId: r.vendorTaxId || prev.vendorTaxId,
          vendorAddress: r.vendorAddress || prev.vendorAddress,
          totalAmount: r.totalAmount || prev.totalAmount,
          subtotal: r.subtotal || prev.subtotal,
          vat: r.vat || prev.vat,
          wht: r.wht || prev.wht,
        }));
        if (r.items && r.items.length > 0) {
          setItems(r.items.map((item: any, i: number) => ({
            id: String(i),
            description: item.description || "",
            type: item.type || "service",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            amount: item.amount || 0,
            category: item.category || "",
          })));
        }
        setScanDone(true);
        setTab("header");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const addItem = () => {
    setItems((prev) => [...prev, {
      id: String(Date.now()),
      description: "",
      type: "service",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      category: "",
    }]);
  };

  const updateItem = (id: string, key: keyof LineItem, value: any) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [key]: value };
      if (key === "quantity" || key === "unitPrice") {
        updated.amount = updated.quantity * updated.unitPrice;
      }
      return updated;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items,
          imageUrl: imagePreview,
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/receipts/${data.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "header", label: "ข้อมูลหัวบิล" },
    { key: "items", label: "รายการค่าใช้จ่าย" },
    { key: "docs", label: "หลักฐานเพิ่มเติม" },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>อัปโหลดใบเสร็จ</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            ถ่ายรูปหรืออัปโหลดใบเสร็จ แล้วให้ AI ดึงข้อมูลให้อัตโนมัติ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Upload Zone */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className={`upload-zone rounded-2xl p-6 text-center cursor-pointer ${dragging ? "dragging" : ""}`}
              style={{ background: "var(--card)", minHeight: "280px" }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="w-full rounded-xl object-contain max-h-64" />
                  <button
                    className="absolute top-2 right-2 p-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); setScanDone(false); }}
                  >
                    <X size={14} color="white" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(0,212,255,0.1)" }}>
                    <Upload size={28} style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="font-medium mb-2" style={{ color: "var(--foreground)" }}>วางไฟล์หรือคลิกเพื่อเลือก</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>รองรับ JPG, PNG, HEIC, WebP, PDF</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>ขนาดไม่เกิน 10 MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 p-3 rounded-xl text-sm transition-colors"
                style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                onClick={() => fileRef.current?.click()}
              >
                <Camera size={16} /> ถ่ายรูป
              </button>
              <button
                className="flex items-center justify-center gap-2 p-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}
                disabled={!imageFile || scanning}
                onClick={handleScan}
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {scanning ? "กำลังสแกน..." : "สแกน AI"}
              </button>
            </div>

            {scanDone && (
              <div className="flex items-center gap-2 p-3 rounded-xl animate-fade-in"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                <span className="text-sm" style={{ color: "#10b981" }}>สแกนสำเร็จ! ตรวจสอบข้อมูลด้านขวา</span>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "var(--card-border)" }}>
              {tabs.map(({ key, label }, idx) => (
                <button key={key}
                  className="flex-1 py-3 text-sm font-medium transition-colors relative"
                  style={{
                    color: tab === key ? "var(--accent)" : "var(--muted-foreground)",
                    background: "transparent"
                  }}
                  onClick={() => setTab(key)}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center"
                      style={{
                        background: tab === key ? "var(--accent)" : "var(--muted)",
                        color: tab === key ? "white" : "var(--muted-foreground)"
                      }}>
                      {idx + 1}
                    </span>
                    {label}
                  </span>
                  {tab === key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--accent)" }} />
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Tab 1: Header */}
              {tab === "header" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>ประเภทเอกสาร</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                      >
                        <option value="receipt">ใบเสร็จรับเงิน</option>
                        <option value="invoice">ใบกำกับภาษี</option>
                        <option value="voucher">ใบรับรองแทนใบเสร็จ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>เลขที่เอกสาร</label>
                      <input
                        value={form.receiptNumber}
                        onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                        placeholder="เลขที่ใบเสร็จ/ใบกำกับภาษี"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>วันที่ออกเอกสาร</label>
                      <input
                        type="date"
                        value={form.issueDate}
                        onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>สกุลเงิน</label>
                      <select
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                      >
                        <option value="THB">THB — บาทไทย</option>
                        <option value="USD">USD — ดอลลาร์</option>
                        <option value="EUR">EUR — ยูโร</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>ชื่อผู้ขาย / ร้านค้า</label>
                    <input
                      value={form.vendorName}
                      onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                      placeholder="ชื่อร้านค้า / บริษัท"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>เลขประจำตัวผู้เสียภาษี</label>
                      <input
                        value={form.vendorTaxId}
                        onChange={(e) => setForm({ ...form, vendorTaxId: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                        placeholder="1234567890123"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>ยอดรวมทั้งสิ้น (บาท)</label>
                      <input
                        type="number"
                        value={form.totalAmount || ""}
                        onChange={(e) => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: "subtotal", label: "ก่อนภาษี" },
                      { key: "vat", label: "VAT 7%" },
                      { key: "wht", label: "หัก ณ ที่จ่าย" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                        <input
                          type="number"
                          value={(form as any)[key] || ""}
                          onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>หมายเหตุ</label>
                    <textarea
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                      placeholder="หมายเหตุเพิ่มเติม..."
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Items */}
              {tab === "items" && (
                <div className="space-y-3">
                  {items.length === 0 && (
                    <div className="text-center py-8" style={{ color: "var(--muted-foreground)" }}>
                      <p className="text-sm">ยังไม่มีรายการ</p>
                      <p className="text-xs mt-1">คลิก "เพิ่มรายการ" หรือใช้ AI สแกนใบเสร็จ</p>
                    </div>
                  )}
                  {items.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl space-y-2"
                      style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}>
                      <div className="flex gap-2">
                        <input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                          style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                          placeholder="รายละเอียด"
                        />
                        <button onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}>
                          <Trash2 size={16} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 1)}
                          className="px-2 py-1.5 rounded-lg text-xs outline-none text-center"
                          style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                          placeholder="จำนวน"
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="px-2 py-1.5 rounded-lg text-xs outline-none text-center"
                          style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                          placeholder="ราคา/หน่วย"
                        />
                        <div className="px-2 py-1.5 rounded-lg text-xs text-center"
                          style={{ background: "var(--card)", color: "var(--accent)", border: "1px solid var(--card-border)" }}>
                          {item.amount.toLocaleString()}
                        </div>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, "category", e.target.value)}
                          className="px-2 py-1.5 rounded-lg text-xs outline-none"
                          style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                        >
                          <option value="">หมวดหมู่</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addItem}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm transition-colors"
                    style={{ background: "var(--muted)", color: "var(--accent)", border: "2px dashed var(--card-border)" }}
                  >
                    <Plus size={16} /> เพิ่มรายการ
                  </button>

                  {items.length > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>รวม</span>
                      <span className="font-bold" style={{ color: "var(--accent)" }}>
                        {items.reduce((s, i) => s + i.amount, 0).toLocaleString()} {form.currency}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Docs */}
              {tab === "docs" && (
                <div className="text-center py-8">
                  <FileImage size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>แนบหลักฐานเพิ่มเติม</p>
                  <p className="text-xs mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>สูงสุด 5 ไฟล์</p>
                  <button
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm"
                    style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                  >
                    <Upload size={14} /> เลือกไฟล์
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t" style={{ borderColor: "var(--card-border)" }}>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ color: "var(--muted-foreground)" }}
                onClick={() => {
                  const tabOrder: Tab[] = ["header", "items", "docs"];
                  const idx = tabOrder.indexOf(tab);
                  if (idx > 0) setTab(tabOrder[idx - 1]);
                }}
                disabled={tab === "header"}
              >
                <ChevronLeft size={16} /> ก่อนหน้า
              </button>

              {tab !== "docs" ? (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                  style={{ background: "var(--accent)",  }}
                  onClick={() => {
                    const tabOrder: Tab[] = ["header", "items", "docs"];
                    const idx = tabOrder.indexOf(tab);
                    if (idx < tabOrder.length - 1) setTab(tabOrder[idx + 1]);
                  }}
                >
                  ถัดไป <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}
                  onClick={handleSave}
                  disabled={saving || !form.vendorName}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? "กำลังบันทึก..." : "บันทึกใบเสร็จ"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
