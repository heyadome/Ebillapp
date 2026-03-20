"use client";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import {
  Settings, Link2, CheckCircle2, AlertCircle, Key,
  HardDrive, Sheet, Mail, Sparkles, Globe
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  connected: boolean;
  envKey: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "claude",
    name: "Claude AI (OCR)",
    desc: "ใช้ Claude Vision สำหรับอ่านข้อมูลจากใบเสร็จอัตโนมัติ",
    icon: Sparkles,
    color: "var(--accent-secondary)",
    connected: false,
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    desc: "บันทึกใบเสร็จทุกใบไปยัง Google Drive อัตโนมัติ",
    icon: HardDrive,
    color: "var(--accent)",
    connected: false,
    envKey: "GOOGLE_CLIENT_ID",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    desc: "Sync ข้อมูลค่าใช้จ่ายไปยัง Google Sheets รายเดือน",
    icon: Sheet,
    color: "#10b981",
    connected: false,
    envKey: "GOOGLE_CLIENT_ID",
  },
  {
    id: "gmail",
    name: "Gmail",
    desc: "สแกนหาใบเสร็จในกล่องจดหมาย Gmail",
    icon: Mail,
    color: "#ea4335",
    connected: false,
    envKey: "GOOGLE_CLIENT_ID",
  },
];

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"integrations" | "profile" | "subscription">("integrations");

  const handleSaveApiKey = () => {
    // In production: save to secure storage
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ตั้งค่า</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            จัดการการเชื่อมต่อและการตั้งค่าต่างๆ
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
          {[
            { key: "integrations", label: "การเชื่อมต่อ" },
            { key: "profile", label: "โปรไฟล์" },
            { key: "subscription", label: "แพ็กเกจ" },
          ].map(({ key, label }) => (
            <button key={key}
              className="flex-1 py-2 rounded-lg text-sm transition-colors font-medium"
              style={{
                background: tab === key ? "var(--card)" : "transparent",
                color: tab === key ? "var(--foreground)" : "var(--muted-foreground)",
              }}
              onClick={() => setTab(key as any)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "integrations" && (
          <div className="space-y-4">
            {/* Setup Guide */}
            <div className="p-4 rounded-2xl"
              style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Key size={16} style={{ color: "var(--accent)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>วิธีตั้งค่า API Keys</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                เพิ่ม API keys ในไฟล์ <code className="px-1 py-0.5 rounded" style={{ background: "var(--muted)" }}>.env.local</code> ที่ root ของโปรเจค:
              </p>
              <pre className="mt-2 p-3 rounded-xl text-xs overflow-x-auto"
                style={{ background: "var(--card)", color: "#10b981", border: "1px solid var(--card-border)" }}>
{`ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret`}
              </pre>
            </div>

            {/* Integration Cards */}
            {INTEGRATIONS.map((integ) => {
              const Icon = integ.icon;
              return (
                <div key={integ.id} className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${integ.color}20` }}>
                    <Icon size={20} style={{ color: integ.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{integ.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{integ.desc}</p>
                    <p className="text-xs mt-1 font-mono" style={{ color: "var(--muted-foreground)" }}>
                      ENV: {integ.envKey}
                    </p>
                  </div>
                  <div>
                    {integ.connected ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        <CheckCircle2 size={14} /> เชื่อมต่อแล้ว
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                        <AlertCircle size={14} /> ยังไม่ได้ตั้งค่า
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "profile" && (
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>ข้อมูลธุรกิจ</h2>
            {[
              { label: "ชื่อบริษัท", key: "name", placeholder: "บริษัท ABC จำกัด" },
              { label: "เลขประจำตัวผู้เสียภาษี", key: "taxId", placeholder: "0000000000000" },
              { label: "ที่อยู่", key: "address", placeholder: "123 ถนน..." },
              { label: "เบอร์โทร", key: "phone", placeholder: "02-xxx-xxxx" },
              { label: "อีเมล", key: "email", placeholder: "info@company.com" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
              บันทึก
            </button>
          </div>
        )}

        {tab === "subscription" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "ฟรี", price: "0", receipts: "8", features: ["AI OCR 8 ใบ/เดือน", "1 ธุรกิจ", "Export Excel"] },
                { name: "ไลท์", price: "189", receipts: "30", features: ["AI OCR 30 ใบ/เดือน", "สแกนอีเมล 300 ครั้ง", "Google Drive", "Google Sheets"], highlight: true },
              ].map((plan) => (
                <div key={plan.name}
                  className="p-6 rounded-2xl relative"
                  style={{
                    background: plan.highlight ? "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(223,64,255,0.1))" : "var(--card)",
                    border: `1px solid ${plan.highlight ? "rgba(59,130,246,0.4)" : "var(--card-border)"}`,
                  }}>
                  {plan.highlight && (
                    <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
                      แนะนำ
                    </div>
                  )}
                  <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                  <div className="text-3xl font-bold my-3" style={{ color: plan.highlight ? "var(--accent)" : "var(--foreground)" }}>
                    ฿{plan.price}
                    <span className="text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>/เดือน</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <CheckCircle2 size={14} style={{ color: "#10b981" }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="w-full py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: plan.highlight ? "var(--accent)" : "var(--muted)",
                      color: plan.highlight ? "white" : "var(--foreground)",
                    }}>
                    {plan.price === "0" ? "แพ็กเกจปัจจุบัน" : "อัปเกรด"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
