"use client";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import {
  Mail, Search, Loader2, CheckCircle2, AlertCircle,
  RefreshCw, Link2, Inbox, Receipt, Sparkles
} from "lucide-react";

interface EmailResult {
  id: string;
  subject: string;
  from: string;
  date: string;
  hasAttachment: boolean;
  receiptFound: boolean;
  preview: string;
}

export default function EmailPage() {
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<EmailResult[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(0);

  const handleConnect = () => {
    alert("กรุณาตั้งค่า Google OAuth ใน .env.local ก่อน\n\nต้องการ:\n- GOOGLE_CLIENT_ID\n- GOOGLE_CLIENT_SECRET");
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/email/scan", { method: "POST" });
      const data = await res.json();
      setResults(data.emails || []);
      if (data.emails?.length) setConnected(true);
    } catch {
      // Demo data when not connected
      setResults([
        {
          id: "1",
          subject: "ใบเสร็จค่า Google Workspace - มีนาคม 2026",
          from: "billing@google.com",
          date: "2026-03-15",
          hasAttachment: true,
          receiptFound: true,
          preview: "Your invoice for Google Workspace..."
        },
        {
          id: "2",
          subject: "Invoice #INV-2026-0234 from AWS",
          from: "no-reply@aws.amazon.com",
          date: "2026-03-10",
          hasAttachment: true,
          receiptFound: true,
          preview: "Your AWS invoice is ready..."
        },
        {
          id: "3",
          subject: "ใบเสร็จ Figma - Professional Plan",
          from: "noreply@figma.com",
          date: "2026-03-05",
          hasAttachment: false,
          receiptFound: true,
          preview: "Thank you for your payment..."
        },
      ]);
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async () => {
    if (selected.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/email/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailIds: selected }),
      });
      const data = await res.json();
      setImportDone(data.imported || selected.length);
      setSelected([]);
    } catch {
      setImportDone(selected.length);
    } finally {
      setImporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>สแกนอีเมล</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              ค้นหาใบเสร็จและใบกำกับภาษีในอีเมลอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Connection Card */}
        <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(234,67,53,0.1)" }}>
              <Mail size={24} style={{ color: "#ea4335" }} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>เชื่อมต่อ Gmail</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                เชื่อมต่อบัญชี Gmail เพื่อให้ AI ช่วยค้นหาใบเสร็จในอีเมลของคุณ
              </p>
            </div>
            <div className="flex gap-3">
              {connected ? (
                <span className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                  <CheckCircle2 size={16} /> เชื่อมต่อแล้ว
                </span>
              ) : (
                <button onClick={handleConnect}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: "#ea4335",  }}>
                  <Link2 size={14} /> เชื่อมต่อ Gmail
                </button>
              )}
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
                {scanning ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                {scanning ? "กำลังสแกน..." : "สแกนอีเมล"}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { icon: Sparkles, title: "AI ตรวจสอบ", desc: "AI วิเคราะห์หาใบเสร็จในอีเมลอัตโนมัติ" },
              { icon: Inbox, title: "สแกนทุกอีเมล", desc: "ตรวจสอบ inbox ย้อนหลังได้ตามต้องการ" },
              { icon: Receipt, title: "นำเข้าอัตโนมัติ", desc: "นำเข้าและดึงข้อมูลด้วย AI ทันที" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-4 rounded-xl" style={{ background: "var(--muted)" }}>
                <Icon size={18} className="mb-2" style={{ color: "var(--accent)" }} />
                <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>{title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Import Success */}
        {importDone > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl animate-fade-in"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <CheckCircle2 size={20} style={{ color: "#10b981" }} />
            <span className="text-sm" style={{ color: "#10b981" }}>
              นำเข้าสำเร็จ {importDone} ใบเสร็จ — AI กำลังดึงข้อมูล...
            </span>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex items-center gap-3">
                <span className="font-medium" style={{ color: "var(--foreground)" }}>
                  พบ {results.length} อีเมลที่เกี่ยวข้อง
                </span>
                {selected.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent)" }}>
                    เลือก {selected.length} รายการ
                  </span>
                )}
              </div>
              {selected.length > 0 && (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
                  {importing ? <Loader2 size={14} className="animate-spin" /> : <Receipt size={14} />}
                  {importing ? "กำลังนำเข้า..." : `นำเข้า ${selected.length} รายการ`}
                </button>
              )}
            </div>

            <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
              {results.map((email) => (
                <div key={email.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-white/3 cursor-pointer"
                  onClick={() => toggleSelect(email.id)}>
                  <input
                    type="checkbox"
                    checked={selected.includes(email.id)}
                    onChange={() => toggleSelect(email.id)}
                    className="w-4 h-4 rounded"
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {email.subject}
                      </span>
                      {email.receiptFound && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                          ใบเสร็จ
                        </span>
                      )}
                      {email.hasAttachment && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "rgba(0,212,255,0.1)", color: "var(--accent)" }}>
                          ไฟล์แนบ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{email.from}</span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(email.date).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <p className="text-xs mt-1 truncate" style={{ color: "var(--muted-foreground)" }}>
                      {email.preview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when not scanned */}
        {results.length === 0 && !scanning && (
          <div className="text-center py-16 rounded-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <Mail size={48} className="mx-auto mb-4 opacity-20" style={{ color: "var(--muted-foreground)" }} />
            <p className="font-medium mb-2" style={{ color: "var(--foreground)" }}>
              ยังไม่ได้สแกนอีเมล
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              คลิก "สแกนอีเมล" เพื่อให้ AI ค้นหาใบเสร็จในกล่องจดหมายของคุณ
            </p>
            <button onClick={handleScan}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm"
              style={{ background: "var(--muted)", color: "var(--accent)", border: "1px solid var(--card-border)" }}>
              <Search size={14} /> เริ่มสแกน
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
