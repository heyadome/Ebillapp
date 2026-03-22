"use client";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell, Menu, Search, LayoutDashboard, Receipt, Upload,
  Mail, TrendingUp, User, ScanLine
} from "lucide-react";

/* ── Mobile Bottom Nav Items ── */
const bottomNavItems = [
  { href: "/dashboard", label: "หน้าแรก",   icon: LayoutDashboard },
  { href: "/upload",    label: "สแกน",       icon: ScanLine },
  { href: "/receipts",  label: "ค่าใช้จ่าย", icon: Receipt },
  { href: "/settings",  label: "โปรไฟล์",    icon: User },
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
          {/* ── Top App Bar ── */}
          <header
            className="sticky top-0 z-40 flex items-center gap-3 px-4 lg:px-6 flex-shrink-0 glass-effect"
            style={{
              background: "rgba(245,247,249,0.8)",
              borderBottom: "1px solid var(--card-border)",
              minHeight: "64px",
            }}
          >
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden p-2 rounded-xl active:scale-95 transition-transform"
              style={{ color: "var(--muted-foreground)" }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Logo — mobile */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="font-bold text-base tracking-tight" style={{ color: "var(--accent)", fontFamily: "'Manrope', sans-serif" }}>
                The Precision Curator
              </span>
            </div>

            {/* Search bar — desktop */}
            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md">
              <div className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl"
                style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}>
                <Search size={16} style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="text"
                  placeholder="ค้นหาใบเสร็จ, ผู้ขาย..."
                  className="bg-transparent text-sm outline-none flex-1"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <button
                className="relative p-2 rounded-xl transition-colors hover:bg-gray-100 active:scale-95"
                style={{ color: "var(--muted-foreground)" }}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                  style={{ background: "var(--accent)" }} />
              </button>
              <div className="flex items-center gap-3 pl-3 lg:pl-4 lg:border-l" style={{ borderColor: 'var(--card-border)' }}>
                <div className="hidden lg:block text-right cursor-pointer">
                  <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>ณราธร รัตนพงษ์</div>
                  <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--muted-foreground)" }}>แอดมิน</div>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-100">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto">
            <div className="content-frame">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 rounded-t-3xl"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 -4px 24px -2px rgba(44,47,49,0.06)",
        }}
      >
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                padding: active ? "8px 24px" : "8px 16px",
                borderRadius: active ? "16px" : "12px",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "white" : "var(--muted-foreground)",
                textDecoration: "none",
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium uppercase tracking-widest mt-1">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
