"use client";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, Menu, Search, LayoutDashboard, Receipt, Upload,
  Mail, TrendingUp, User, ScanLine, LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Show nothing while loading or redirecting
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

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
                {user && (
                  <>
                    <div className="hidden lg:block text-right cursor-pointer">
                      <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{user.name || user.username}</div>
                      <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--muted-foreground)" }}>
                        {user.role === "admin" ? "แอดมิน" : "ผู้ใช้"}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-100 text-sm font-bold"
                      style={{ background: "rgba(37,99,235,0.1)", color: "var(--accent)" }}>
                      {(user.name || user.username)[0].toUpperCase()}
                    </div>
                    <button
                      onClick={async () => { await logout(); router.push("/login"); }}
                      className="hidden lg:flex p-2 rounded-xl transition-colors hover:bg-red-50"
                      style={{ color: "#ef4444" }}
                      title="ออกจากระบบ"
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                )}
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
