"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Building2, Save, Upload, CheckCircle2 } from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  signature: string | null;
}

export default function BusinessPage() {
  const [biz, setBiz] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "", taxId: "", address: "", phone: "", email: "",
  });

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((d) => {
        if (d.business) {
          setBiz(d.business);
          setForm({
            name: d.business.name || "",
            taxId: d.business.taxId || "",
            address: d.business.address || "",
            phone: d.business.phone || "",
            email: d.business.email || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const d = await res.json();
        setBiz(d.business);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Save logo as base64
      fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: base64 }),
      }).then((r) => r.json()).then((d) => {
        if (d.business) setBiz(d.business);
      });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "var(--muted)" }} />
          <div className="h-96 rounded-3xl animate-pulse" style={{ background: "var(--muted)" }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ข้อมูลธุรกิจ</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>จัดการข้อมูลบริษัทและการตั้งค่า</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm"
            style={{ borderRadius: "100px", padding: "10px 24px", opacity: saving ? 0.7 : 1 }}>
            {saved ? <CheckCircle2 size={16} /> : saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
            <span className="font-bold">{saved ? "บันทึกแล้ว" : "บันทึกข้อมูล"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo & Identity */}
          <div className="rounded-3xl p-6 space-y-5"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>โลโก้บริษัท</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: "var(--muted)", border: "2px dashed var(--card-border)" }}>
                {biz?.logo ? (
                  <img src={biz.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={40} style={{ color: "var(--muted-foreground)" }} />
                )}
              </div>
              <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer">
                <Upload size={14} /> อัพโหลดโลโก้
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                แนะนำขนาด 512x512 px<br/>รองรับ PNG, JPG
              </p>
            </div>
          </div>

          {/* Company Info Form */}
          <div className="lg:col-span-2 rounded-3xl p-6 space-y-5"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>ข้อมูลบริษัท</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                  ชื่อบริษัท *
                </label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="บริษัท ตัวอย่าง จำกัด" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                  เลขประจำตัวผู้เสียภาษี
                </label>
                <input type="text" value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  placeholder="0000000000000" className="input-field" maxLength={13} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                  เบอร์โทรศัพท์
                </label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="02-000-0000" className="input-field" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                  ที่อยู่
                </label>
                <textarea value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                  className="input-field" rows={3}
                  style={{ resize: "none" }} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                  อีเมลบริษัท
                </label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="info@company.com" className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Settings */}
        <div className="rounded-3xl p-6 space-y-5"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>การตั้งค่าค่าใช้จ่าย</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>สกุลเงินหลัก</label>
              <select className="input-field" defaultValue="THB">
                <option value="THB">THB — บาทไทย</option>
                <option value="USD">USD — ดอลลาร์สหรัฐ</option>
                <option value="EUR">EUR — ยูโร</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>อัตรา VAT (%)</label>
              <input type="number" defaultValue={7} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>รอบบัญชี</label>
              <select className="input-field" defaultValue="monthly">
                <option value="monthly">รายเดือน</option>
                <option value="quarterly">รายไตรมาส</option>
                <option value="yearly">รายปี</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="rounded-3xl p-6 space-y-5"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>หมวดหมู่ค่าใช้จ่าย</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "ค่าเช่าสำนักงาน", color: "#2563EB" },
              { name: "ค่าไฟฟ้า/น้ำประปา", color: "#f59e0b" },
              { name: "ค่าโทรศัพท์/อินเทอร์เน็ต", color: "#10b981" },
              { name: "ค่าวัสดุสำนักงาน", color: "#8b5cf6" },
              { name: "ค่าเดินทาง/ขนส่ง", color: "#ef4444" },
              { name: "ค่าอาหาร/เครื่องดื่ม", color: "#06b6d4" },
              { name: "ค่าซอฟต์แวร์/บริการ", color: "#ec4899" },
              { name: "ค่าบำรุงรักษา", color: "#14b8a6" },
              { name: "อื่นๆ", color: "#6b7280" },
            ].map(({ name, color }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "var(--muted)" }}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
