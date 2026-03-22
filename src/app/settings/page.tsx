"use client";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import {
  Settings, CheckCircle2, AlertCircle, Key,
  HardDrive, Sheet, Mail, Sparkles, Camera, User
} from "lucide-react";

interface Integration {
  id: string; name: string; desc: string; icon: any;
  color: string; connected: boolean; envKey: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "claude", name: "Claude AI (OCR)", desc: "ใช้ Claude Vision สำหรับอ่านข้อมูลจากใบเสร็จอัตโนมัติ", icon: Sparkles, color: "#8b5cf6", connected: false, envKey: "ANTHROPIC_API_KEY" },
  { id: "google-drive", name: "Google Drive", desc: "บันทึกใบเสร็จทุกใบไปยัง Google Drive อัตโนมัติ", icon: HardDrive, color: "#3b82f6", connected: false, envKey: "GOOGLE_CLIENT_ID" },
  { id: "google-sheets", name: "Google Sheets", desc: "Sync ข้อมูลค่าใช้จ่ายไปยัง Google Sheets รายเดือน", icon: Sheet, color: "#10b981", connected: false, envKey: "GOOGLE_CLIENT_ID" },
  { id: "gmail", name: "Gmail", desc: "สแกนหาใบเสร็จในกล่องจดหมาย Gmail", icon: Mail, color: "#ea4335", connected: false, envKey: "GOOGLE_CLIENT_ID" },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"integrations" | "profile" | "subscription">("profile");

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ตั้งค่าโปรไฟล์</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            จัดการข้อมูลส่วนตัวและการตั้งค่าระบบ
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
          {[
            { key: "profile", label: "โปรไฟล์" },
            { key: "integrations", label: "การเชื่อมต่อ" },
            { key: "subscription", label: "แพ็กเกจ" },
          ].map(({ key, label }) => (
            <button key={key}
              className="flex-1 py-2.5 rounded-xl text-sm transition-colors font-medium"
              style={{
                background: tab === key ? "var(--card)" : "transparent",
                color: tab === key ? "var(--foreground)" : "var(--muted-foreground)",
                boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
              onClick={() => setTab(key as any)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="space-y-6">
            
            {/* Header Content Area */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ background: "var(--muted)" }}>
                    {/* Placeholder image from UI */}
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>ณราธร รัตนพงษ์</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge" style={{ background: "var(--accent)", color: "white", padding: "2px 10px" }}>
                      แอดมินระบบ
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>สมาชิกตั้งแต่ มีนาคม 2024</span>
                  </div>
                  <button className="text-sm font-semibold mt-2" style={{ color: "var(--accent)" }}>แก้ไขรูปโปรไฟล์</button>
                </div>
              </div>

              <div className="space-y-6 max-w-2xl">
                <h3 className="font-bold text-base" style={{ color: "var(--foreground)" }}>ข้อมูลส่วนตัว</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>ชื่อ</label>
                    <input className="input-field" defaultValue="ณราธร" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>นามสกุล</label>
                    <input className="input-field" defaultValue="รัตนพงษ์" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>อีเมล</label>
                    <input className="input-field" defaultValue="naratron.r@company.com" type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>เบอร์โทรศัพท์</label>
                    <input className="input-field" defaultValue="+66 81 234 5678" />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h3 className="font-bold text-base mb-6" style={{ color: "var(--foreground)" }}>การจัดส่งและการแจ้งเตือน</h3>
              <div className="space-y-5 max-w-2xl">
                {[
                  { label: "รับสรุปยอดรายเดือน", desc: "ส่งสรุปค่าใช้จ่ายทุกสิ้นเดือนทางอีเมล", checked: true },
                  { label: "แจ้งเตือนการอนุมัติ", desc: "แจ้งเตือนเมื่อบิลได้รับการอนุมัติ", checked: true },
                  { label: "ยืนยันการเข้าระบบ (2FA)", desc: "เพิ่มความปลอดภัยด้วยการยืนยัน 2 ขั้นตอน", checked: false },
                ].map(({ label, desc, checked }) => (
                  <div key={label} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: checked ? "rgba(16,185,129,0.1)" : "var(--muted)", color: checked ? "#10b981" : "var(--muted-foreground)" }}>
                         {checked ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                       </div>
                       <div>
                         <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{label}</p>
                         <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <button onClick={handleSave} className="btn-primary" style={{ padding: "12px 32px" }}>บันทึกข้อมูล</button>
              <button className="btn-secondary" style={{ padding: "12px 32px" }}>ยกเลิก</button>
              {saved && (
                <span className="flex items-center gap-1 text-sm font-medium animate-fade-in" style={{ color: "var(--success)" }}>
                  <CheckCircle2 size={16} /> บันทึกเรียบร้อย
                </span>
              )}
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl p-6 mt-12 mb-4 max-w-2xl" style={{ background: "rgba(239,68,68,0.03)", border: "1px dashed rgba(239,68,68,0.3)" }}>
               <div className="flex items-start gap-4">
                 <div className="pt-1">
                   <AlertCircle size={20} style={{ color: "var(--danger)" }} />
                 </div>
                 <div>
                   <h3 className="font-bold text-sm mb-1" style={{ color: "var(--danger)" }}>อันตราย</h3>
                   <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                     การลบบัญชีจะทำให้ข้อมูลใบเสร็จ การตั้งค่า และประวัติทั้งหมดหายไปอย่างถาวร หากคุณไม่มั่นใจกรุณาติดต่อ Support
                   </p>
                   <button className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-red-50"
                     style={{ color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
                     ลบบัญชีผู้ใช้นี้
                   </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {tab === "integrations" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl"
              style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Key size={16} style={{ color: "var(--accent)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>วิธีตั้งค่า API Keys</span>
              </div>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                เพิ่ม API keys ในไฟล์ <code className="px-1.5 py-0.5 rounded-md text-sm" style={{ background: "var(--muted)" }}>.env.local</code> ที่ root ของโปรเจค
              </p>
            </div>

            {INTEGRATIONS.map(integ => {
              const Icon = integ.icon;
              return (
                <div key={integ.id} className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${integ.color}12` }}>
                    <Icon size={20} style={{ color: integ.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{integ.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{integ.desc}</p>
                  </div>
                  <div className="shrink-0">
                    {integ.connected ? (
                      <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        <CheckCircle2 size={14} /> เชื่อมต่อแล้ว
                      </span>
                    ) : (
                      <span className="badge" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                        <AlertCircle size={14} /> ยังไม่ได้ตั้งค่า
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "subscription" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "ฟรี", price: "0", features: ["AI OCR 8 ใบ/เดือน", "1 ธุรกิจ", "Export Excel"] },
              { name: "ไลท์", price: "189", features: ["AI OCR 30 ใบ/เดือน", "สแกนอีเมล 300 ครั้ง", "Google Drive", "Google Sheets"], highlight: true },
            ].map(plan => (
              <div key={plan.name} className="p-6 rounded-2xl relative"
                style={{
                  background: "var(--card)",
                  border: `2px solid ${plan.highlight ? "var(--accent)" : "var(--card-border)"}`,
                }}>
                {plan.highlight && (
                  <span className="absolute top-3 right-3 badge" style={{ background: "var(--accent)", color: "white" }}>
                    แนะนำ
                  </span>
                )}
                <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                <div className="text-3xl font-bold my-3" style={{ color: plan.highlight ? "var(--accent)" : "var(--foreground)" }}>
                  ฿{plan.price}
                  <span className="text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>/เดือน</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      <CheckCircle2 size={14} style={{ color: "#10b981" }} /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2.5 rounded-xl text-sm font-medium ${plan.highlight ? "btn-primary" : "btn-secondary"}`}>
                  {plan.price === "0" ? "แพ็กเกจปัจจุบัน" : "อัปเกรด"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
