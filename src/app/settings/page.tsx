"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle2, AlertCircle, Key, Eye, EyeOff, Save,
  HardDrive, Sheet, Mail, Sparkles, Bot, Zap, RefreshCw
} from "lucide-react";

interface Integration {
  id: string; name: string; desc: string; icon: React.ElementType;
  color: string; connected: boolean;
}

const INTEGRATIONS: Integration[] = [
  { id: "google-drive", name: "Google Drive", desc: "บันทึกใบเสร็จทุกใบไปยัง Google Drive อัตโนมัติ", icon: HardDrive, color: "#3b82f6", connected: false },
  { id: "google-sheets", name: "Google Sheets", desc: "Sync ข้อมูลค่าใช้จ่ายไปยัง Google Sheets รายเดือน", icon: Sheet, color: "#10b981", connected: false },
  { id: "gmail", name: "Gmail", desc: "สแกนหาใบเสร็จในกล่องจดหมาย Gmail", icon: Mail, color: "#ea4335", connected: false },
];

type TabKey = "profile" | "integrations" | "ai";

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<TabKey>("profile");

  // AI Settings state (admin only)
  const [aiSettings, setAiSettings] = useState({
    aiProvider: "claude",
    aiAutoSwitch: true,
    claudeApiKey: "",
    geminiApiKey: "",
    claudeConfigured: false,
    geminiConfigured: false,
  });
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/admin/ai-settings")
        .then((r) => r.json())
        .then((d) => { if (d.settings) setAiSettings(d.settings); });
    }
  }, [isAdmin]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const handleAiSave = async () => {
    setAiSaving(true);
    setAiSaved(false);
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProvider: aiSettings.aiProvider,
          aiAutoSwitch: aiSettings.aiAutoSwitch,
          claudeApiKey: aiSettings.claudeApiKey,
          geminiApiKey: aiSettings.geminiApiKey,
        }),
      });
      if (res.ok) {
        setAiSaved(true);
        setTimeout(() => setAiSaved(false), 3000);
        // Refresh settings to get masked keys
        const r = await fetch("/api/admin/ai-settings");
        const d = await r.json();
        if (d.settings) setAiSettings(d.settings);
      }
    } finally {
      setAiSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "profile", label: "โปรไฟล์" },
    ...(isAdmin ? [
      { key: "ai" as TabKey, label: "AI ตั้งค่า" },
      { key: "integrations" as TabKey, label: "การเชื่อมต่อ" },
    ] : []),
  ];

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
          {tabs.map(({ key, label }) => (
            <button key={key}
              className="flex-1 py-2.5 rounded-xl text-sm transition-colors font-medium"
              style={{
                background: tab === key ? "var(--card)" : "transparent",
                color: tab === key ? "var(--foreground)" : "var(--muted-foreground)",
                boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
              onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shrink-0 text-2xl font-bold"
                  style={{ background: "rgba(37,99,235,0.1)", color: "var(--accent)" }}>
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{user?.name || user?.email}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge" style={{ background: "var(--accent)", color: "white", padding: "2px 10px" }}>
                      {isAdmin ? "แอดมินระบบ" : "ผู้ใช้ทั่วไป"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-w-2xl">
                <h3 className="font-bold text-base" style={{ color: "var(--foreground)" }}>ข้อมูลส่วนตัว</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>ชื่อ</label>
                    <input className="input-field" defaultValue={user?.name || ""} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>อีเมล</label>
                    <input className="input-field" defaultValue={user?.email || ""} type="email" readOnly
                      style={{ opacity: 0.6 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h3 className="font-bold text-base mb-6" style={{ color: "var(--foreground)" }}>การแจ้งเตือน</h3>
              <div className="space-y-5 max-w-2xl">
                {[
                  { label: "รับสรุปยอดรายเดือน", desc: "ส่งสรุปค่าใช้จ่ายทุกสิ้นเดือนทางอีเมล", checked: true },
                  { label: "แจ้งเตือนการอนุมัติ", desc: "แจ้งเตือนเมื่อบิลได้รับการอนุมัติ", checked: true },
                ].map(({ label, desc, checked }) => (
                  <div key={label} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: checked ? "rgba(16,185,129,0.1)" : "var(--muted)", color: checked ? "#10b981" : "var(--muted-foreground)" }}>
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

            <div className="flex items-center gap-4 pt-4">
              <button onClick={handleSave} className="btn-primary" style={{ padding: "12px 32px" }}>บันทึกข้อมูล</button>
              <button className="btn-secondary" style={{ padding: "12px 32px" }}>ยกเลิก</button>
              {saved && (
                <span className="flex items-center gap-1 text-sm font-medium animate-fade-in" style={{ color: "var(--success)" }}>
                  <CheckCircle2 size={16} /> บันทึกเรียบร้อย
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── AI Settings Tab (Admin only) ── */}
        {tab === "ai" && isAdmin && (
          <div className="space-y-6">
            {/* Provider Selection */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                  <Bot size={20} style={{ color: "#8b5cf6" }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: "var(--foreground)" }}>AI สำหรับอ่านใบเสร็จ (OCR)</h3>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>เลือก AI หลักและตั้งค่า API Key</p>
                </div>
              </div>

              {/* Provider Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Claude */}
                <button
                  onClick={() => setAiSettings({ ...aiSettings, aiProvider: "claude" })}
                  className="p-5 rounded-2xl text-left transition-all"
                  style={{
                    background: aiSettings.aiProvider === "claude" ? "rgba(139,92,246,0.06)" : "var(--muted)",
                    border: `2px solid ${aiSettings.aiProvider === "claude" ? "#8b5cf6" : "transparent"}`,
                  }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles size={20} style={{ color: "#8b5cf6" }} />
                    <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Claude AI</span>
                    {aiSettings.aiProvider === "claude" && (
                      <span className="ml-auto badge text-[10px]" style={{ background: "#8b5cf6", color: "white", padding: "2px 8px" }}>หลัก</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Anthropic Claude — แม่นยำสูง รองรับภาษาไทย</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: aiSettings.claudeConfigured ? "#10b981" : "#f59e0b" }}>
                      {aiSettings.claudeConfigured ? <><CheckCircle2 size={10} /> ตั้งค่าแล้ว</> : <><AlertCircle size={10} /> ยังไม่ได้ตั้งค่า</>}
                    </span>
                  </div>
                </button>

                {/* Gemini */}
                <button
                  onClick={() => setAiSettings({ ...aiSettings, aiProvider: "gemini" })}
                  className="p-5 rounded-2xl text-left transition-all"
                  style={{
                    background: aiSettings.aiProvider === "gemini" ? "rgba(59,130,246,0.06)" : "var(--muted)",
                    border: `2px solid ${aiSettings.aiProvider === "gemini" ? "#3b82f6" : "transparent"}`,
                  }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Zap size={20} style={{ color: "#3b82f6" }} />
                    <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Gemini AI</span>
                    {aiSettings.aiProvider === "gemini" && (
                      <span className="ml-auto badge text-[10px]" style={{ background: "#3b82f6", color: "white", padding: "2px 8px" }}>หลัก</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Google Gemini — รวดเร็ว Free tier ใจกว้าง</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: aiSettings.geminiConfigured ? "#10b981" : "#f59e0b" }}>
                      {aiSettings.geminiConfigured ? <><CheckCircle2 size={10} /> ตั้งค่าแล้ว</> : <><AlertCircle size={10} /> ยังไม่ได้ตั้งค่า</>}
                    </span>
                  </div>
                </button>
              </div>

              {/* Auto-switch */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--muted)" }}>
                <div className="flex items-center gap-3">
                  <RefreshCw size={18} style={{ color: "var(--accent)" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>สลับอัตโนมัติ</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>เมื่อ AI หลักถึง Rate Limit จะสลับไปใช้ AI สำรองอัตโนมัติ</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer"
                    checked={aiSettings.aiAutoSwitch}
                    onChange={(e) => setAiSettings({ ...aiSettings, aiAutoSwitch: e.target.checked })} />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            </div>

            {/* API Keys */}
            <div className="rounded-2xl p-6 lg:p-8" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center gap-2 mb-6">
                <Key size={18} style={{ color: "var(--accent)" }} />
                <h3 className="font-bold text-base" style={{ color: "var(--foreground)" }}>API Keys</h3>
              </div>

              <div className="space-y-5">
                {/* Claude API Key */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                    <Sparkles size={14} style={{ color: "#8b5cf6" }} /> Claude API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showClaudeKey ? "text" : "password"}
                      value={aiSettings.claudeApiKey}
                      onChange={(e) => setAiSettings({ ...aiSettings, claudeApiKey: e.target.value })}
                      placeholder="sk-ant-xxxxxxxxxxxxx"
                      className="input-field pr-10"
                    />
                    <button type="button" onClick={() => setShowClaudeKey(!showClaudeKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted-foreground)" }}>
                      {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    ได้จาก <span style={{ color: "var(--accent)" }}>console.anthropic.com</span> — หรือใช้ค่าจาก .env
                  </p>
                </div>

                {/* Gemini API Key */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                    <Zap size={14} style={{ color: "#3b82f6" }} /> Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={aiSettings.geminiApiKey}
                      onChange={(e) => setAiSettings({ ...aiSettings, geminiApiKey: e.target.value })}
                      placeholder="AIzaSyxxxxxxxxxxxxx"
                      className="input-field pr-10"
                    />
                    <button type="button" onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--muted-foreground)" }}>
                      {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    ได้จาก <span style={{ color: "var(--accent)" }}>aistudio.google.com</span> — Free tier 15 req/min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                <button onClick={handleAiSave} disabled={aiSaving}
                  className="btn-primary flex items-center gap-2" style={{ padding: "10px 24px", opacity: aiSaving ? 0.7 : 1 }}>
                  {aiSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  บันทึกการตั้งค่า AI
                </button>
                {aiSaved && (
                  <span className="flex items-center gap-1 text-sm font-medium animate-fade-in" style={{ color: "var(--success)" }}>
                    <CheckCircle2 size={16} /> บันทึกเรียบร้อย
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Integrations Tab (Admin only) ── */}
        {tab === "integrations" && isAdmin && (
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
                    <span className="badge" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                      <AlertCircle size={14} /> ยังไม่ได้ตั้งค่า
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
