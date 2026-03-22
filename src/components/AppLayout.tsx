"use client";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, Search, LayoutDashboard, Receipt, Upload, Mail, TrendingUp } from "lucide-react";

const mobileTabItems = [
  { href: "/dashboard", label: "สรุปภาพรวม",  icon: LayoutDashboard },
  { href: "/receipts",  label: "ค่าใช้จ่าย",   icon: Receipt },
  { href: "/upload",    label: "สแกนบิล",      icon: Upload },
  { href: "/email",     label: "อีเมล",        icon: Mail },
  { href: "/reports",   label: "รายงาน",       icon: TrendingUp },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="h-full">
      <div className="flex h-full" style={{ background: "var(--background)" }}>

        {/* Desktop sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onCollapsedChange={setSidebarCollapsed}
        />

        <main
          className="flex-1 flex flex-col min-w-0"
          style={{ transition: "margin-left 0.3s" }}
          data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
        >
          {/* Top Bar */}
          <header
            className="flex items-center gap-3 px-4 lg:px-6 flex-shrink-0"
            style={{
              background: "var(--card)",
              borderBottom: "1px solid var(--card-border)",
              minHeight: "64px",
            }}
          >
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden p-2 rounded-xl"
              style={{ color: "var(--muted-foreground)" }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Logo — mobile only */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>
                The Precision Curator
              </span>
            </div>

            {/* Search bar — desktop */}
            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md px-4 py-2.5 rounded-xl"
              style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}>
              <Search size={16} style={{ color: "var(--muted-foreground)" }} />
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>ค้นหาใบเสร็จ, ผู้ขาย...</span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <button
                className="relative p-2 rounded-xl transition-colors hover:bg-gray-100"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                  style={{ background: "var(--danger)" }} />
              </button>
              <div className="flex items-center gap-3 pl-3 lg:pl-4 lg:border-l" style={{ borderColor: 'var(--card-border)' }}>
                <div className="hidden lg:block text-right cursor-pointer">
                  <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>ณราธร รัตนพงษ์</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>แอดมิน</div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
                  style={{ background: "var(--accent)", color: "white" }}>
                  ณ
                </div>
              </div>
            </div>
          </header>

          {/* Mobile horizontal tab navigation */}
          <div className="lg:hidden flex-shrink-0 flex overflow-x-auto"
            style={{
              gap: "4px",
              padding: "8px 12px",
              background: "var(--card)",
              borderBottom: "1px solid var(--card-border)",
              scrollbarWidth: "none",
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
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "white" : "var(--muted-foreground)",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
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

          {/* Page content */}
          <div className="flex-1 overflow-y-auto">
            <div className="content-frame">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
