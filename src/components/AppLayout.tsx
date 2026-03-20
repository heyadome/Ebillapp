"use client";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, LayoutDashboard, Receipt, Upload, Mail, TrendingUp } from "lucide-react";

const mobileTabItems = [
  { href: "/dashboard", label: "หน้าหลัก",  icon: LayoutDashboard },
  { href: "/receipts",  label: "ใบเสร็จ",    icon: Receipt },
  { href: "/upload",    label: "อัปโหลด",    icon: Upload },
  { href: "/email",     label: "อีเมล",      icon: Mail },
  { href: "/reports",   label: "รายงาน",    icon: TrendingUp },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <div className="flex h-full overflow-hidden" style={{ background: "var(--background)" }}>

        {/* ── Desktop sidebar only ── */}
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onCollapsedChange={setSidebarCollapsed}
        />

        <main
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{ transition: "margin-left 0.3s" }}
          data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
        >

          {/* ── Top Bar ── */}
          <header
            className="flex items-center gap-3 px-4 flex-shrink-0"
            style={{
              background: "rgba(9,9,28,0.95)",
              borderBottom: "1px solid var(--card-border)",
              backdropFilter: "blur(12px)",
              minHeight: "56px",
            }}
          >
            {/* Hamburger — mobile only (for Settings/Business drawer) */}
            <button
              className="lg:hidden p-2 rounded-lg"
              style={{ color: "var(--muted-foreground)", border: "1px solid var(--card-border)" }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={16} />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="status-dot lg:hidden" />
              <span
                className="font-bold tracking-widest text-sm lg:text-base"
                style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "0.15em" }}
              >
                BILLSCAN<span style={{ color: "var(--muted-foreground)" }}>_</span>AI
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 ml-2">
              <span className="status-dot" />
              <span className="text-xs" style={{ color: "var(--success)", fontFamily: "var(--font-mono)" }}>ONLINE</span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <button
                className="relative p-2 rounded-lg"
                style={{ color: "var(--muted-foreground)", border: "1px solid var(--card-border)", background: "var(--card)" }}
              >
                <Bell size={16} />
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent-secondary)", boxShadow: "0 0 6px var(--accent-secondary)" }}
                />
              </button>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                  boxShadow: "0 0 10px rgba(0,212,255,0.2)",
                }}
              >ผ</div>
            </div>
          </header>

          {/* ── Mobile horizontal tab navigation (reference-style) ── */}
          <div
            className="lg:hidden flex-shrink-0 flex overflow-x-auto"
            style={{
              gap: "8px",
              padding: "10px 12px",
              background: "rgba(9,9,28,0.98)",
              borderBottom: "1px solid var(--card-border)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {mobileTabItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-shrink-0 flex items-center transition-all"
                  style={{
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    background: active ? "var(--accent)" : "var(--card)",
                    color: active ? "#000" : "var(--muted-foreground)",
                    border: active ? "none" : "1px solid var(--card-border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    letterSpacing: "0.03em",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Page content ── */}
          <div className="flex-1 overflow-y-auto pb-6">
            <div className="content-frame">
              {children}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
