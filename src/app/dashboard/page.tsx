"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import {
  Upload, Mail, FileText, TrendingUp,
  ArrowRight, RefreshCw, CheckCircle2, AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  thisMonth: { count: number; total: number };
  thisYear:  { count: number; total: number };
  pending:   number;
  missing:   number;
}

interface RecentReceipt {
  id: string;
  vendorName: string | null;
  totalAmount: number;
  status: string;
  issueDate: string | null;
  createdAt: string;
}

// ── Feature card (2×2 grid) ──────────────────────────────
function FeatureCard({
  href, label, sublabel, icon: Icon,
}: {
  href: string; label: string; sublabel?: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="feature-card flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        boxShadow: "none",
        aspectRatio: "1 / 0.85",
        textDecoration: "none",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}
      >
        <Icon size={20} style={{ color: "var(--muted-foreground)" }} strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium leading-tight" style={{ color: "var(--foreground)" }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>
            {sublabel}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Input / info row ─────────────────────────────────────
function InfoRow({
  label, value, href, btnLabel = "ดูทั้งหมด",
  danger = false, success = false,
}: {
  label: string; value: string; href: string; btnLabel?: string;
  danger?: boolean; success?: boolean;
}) {
  const accentColor = danger ? "var(--danger)" : success ? "var(--success)" : "var(--accent)";
  const rgba = danger ? "255,34,102" : success ? "0,255,153" : "0,212,255";
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-2xl"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      <div>
        <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em" }}>
          {label}
        </p>
        <p className="text-sm font-semibold leading-snug" style={{ color: danger ? "var(--danger)" : success ? "var(--success)" : "var(--foreground)" }}>
          {value}
        </p>
      </div>
      <div className="flex justify-end">
        <Link
          href={href}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: `rgba(${rgba},0.1)`,
            color: accentColor,
            border: `1px solid rgba(${rgba},0.25)`,
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.05em",
            textDecoration: "none",
          }}
        >
          {btnLabel} <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    thisMonth: { count: 0, total: 0 },
    thisYear:  { count: 0, total: 0 },
    pending: 0, missing: 0,
  });
  const [recent, setRecent] = useState<RecentReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setStats(d.stats || stats); setRecent(d.recent || []); })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);
  const monthName = new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  const features = [
    { href: "/upload",   label: "อัปโหลดใบเสร็จ",  sublabel: "Scan & Upload",   icon: Upload },
    { href: "/email",    label: "สแกนอีเมล",        sublabel: "Email Scanner",   icon: Mail },
    { href: "/vouchers", label: "ใบรับรองแทน",      sublabel: "Voucher",         icon: FileText },
    { href: "/reports",  label: "รายงาน",           sublabel: "Reports",         icon: TrendingUp },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="status-dot" />
              <span className="text-xs" style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em" }}>
                ระบบออนไลน์
              </span>
            </div>
            <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)", letterSpacing: "0.06em" }}>
              EXPENSE<span style={{ color: "var(--accent)" }}>_</span>MGMT
            </h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
              {monthName.toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg"
            style={{ border: "1px solid var(--card-border)", color: "var(--muted-foreground)", background: "var(--card)" }}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* ── 2×2 Feature grid ── */}
        <div>
          <p className="text-xs mb-2.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em" }}>
            FEATURES
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <FeatureCard key={f.href} {...f} />
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: "1px", background: "var(--card-border)" }} />

        {/* ── Input / info rows ── */}
        <div>
          <p className="text-xs mb-2.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em" }}>
            OVERVIEW
          </p>
          <div className="space-y-2">
            <InfoRow
              label="ยอดค่าใช้จ่ายเดือนนี้"
              value={loading ? "กำลังโหลด..." : `฿${fmt(stats.thisMonth.total)} (${stats.thisMonth.count} ใบ)`}
              href="/receipts"
              btnLabel="ดูรายการ"
              success={stats.thisMonth.total > 0}
            />
            <InfoRow
              label="รายการขาดเอกสาร"
              value={loading ? "..." : stats.missing > 0 ? `พบ ${stats.missing} รายการ — ต้องออกใบรับรองแทน` : "ไม่พบรายการที่ขาดเอกสาร"}
              href="/vouchers"
              btnLabel={stats.missing > 0 ? "ดำเนินการ" : "ตรวจสอบ"}
              danger={stats.missing > 0}
            />
            <InfoRow
              label="รอดำเนินการ"
              value={loading ? "..." : `${stats.pending} รายการ`}
              href="/receipts"
              btnLabel="จัดการ"
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: "1px", background: "var(--card-border)" }} />

        {/* ── Recent receipts (SYSTEM_LOGS style) ── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em" }}>
              RECENT_ACTIVITY
            </p>
            <Link href="/receipts" className="text-xs" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
              VIEW_ALL
            </Link>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            {loading ? (
              <div className="p-4 space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", fontSize: "10px" }}>
                  NO_RECORDS_FOUND
                </p>
                <Link href="/upload" className="text-xs mt-1 inline-block" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                  INIT_FIRST_UPLOAD →
                </Link>
              </div>
            ) : (
              recent.map((r) => {
                const ts = r.issueDate ? new Date(r.issueDate) : new Date(r.createdAt);
                const approved = r.status === "approved";
                return (
                  <Link
                    key={r.id}
                    href={`/receipts/${r.id}`}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-white/3 transition-colors"
                    style={{ borderColor: "var(--card-border)", textDecoration: "none" }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: approved ? "var(--success)" : "var(--warning)",
                        boxShadow: `0 0 4px ${approved ? "var(--success)" : "var(--warning)"}`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                        {r.vendorName || "VENDOR_UNKNOWN"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "9px" }}>
                        {ts.toLocaleDateString("th-TH")}
                      </p>
                    </div>
                    <p className="text-xs font-bold flex-shrink-0" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      ฿{fmt(r.totalAmount)}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ── Connection status (NODE_CONNECTIONS) ── */}
        <div>
          <p className="text-xs mb-2.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em" }}>
            NODE_CONNECTIONS
          </p>
          <div
            className="rounded-2xl p-4 space-y-2.5"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            {[
              { name: "CLAUDE_AI_OCR",  connected: true },
              { name: "GOOGLE_DRIVE",   connected: false },
              { name: "GOOGLE_SHEETS",  connected: false },
              { name: "GMAIL_SCANNER",  connected: false },
            ].map(({ name, connected }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full block" style={{
                    background: connected ? "var(--success)" : "var(--card-border)",
                    boxShadow: connected ? "0 0 4px var(--success)" : "none",
                  }} />
                  <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)", fontSize: "10px" }}>{name}</span>
                </div>
                <span className="text-xs" style={{
                  fontFamily: "var(--font-mono)",
                  color: connected ? "var(--success)" : "var(--muted-foreground)",
                  fontSize: "9px", letterSpacing: "0.1em",
                }}>
                  {connected ? "ACTIVE" : "OFFLINE"}
                </span>
              </div>
            ))}
            <Link
              href="/settings"
              className="flex items-center justify-between mt-3 pt-3 border-t"
              style={{ borderColor: "var(--card-border)", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "10px", textDecoration: "none", letterSpacing: "0.1em" }}
            >
              ตั้งค่าการเชื่อมต่อ <ArrowRight size={12} />
            </Link>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
