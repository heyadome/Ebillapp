"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Receipt, Mail, Upload, Settings,
  Building2, Users, FileText, TrendingUp,
  ChevronLeft, ChevronRight, Zap, X
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { href: "/dashboard", label: "DASHBOARD",      icon: LayoutDashboard },
  { href: "/receipts",  label: "RECEIPTS",        icon: Receipt },
  { href: "/upload",    label: "UPLOAD",           icon: Upload },
  { href: "/email",     label: "EMAIL_SCAN",       icon: Mail },
  { href: "/reports",   label: "REPORTS",          icon: TrendingUp },
  { href: "/vouchers",  label: "VOUCHERS",         icon: FileText },
];

const bottomItems = [
  { href: "/business",   label: "BUSINESS", icon: Building2 },
  { href: "/requesters", label: "REQUESTERS", icon: Users },
  { href: "/settings",   label: "SETTINGS",  icon: Settings },
];

const mobileTabItems = [
  { href: "/dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/receipts",  label: "ใบเสร็จ",   icon: Receipt },
  { href: "/upload",    label: "อัปโหลด",   icon: Upload },
  { href: "/email",     label: "อีเมล",     icon: Mail },
  { href: "/reports",   label: "รายงาน",   icon: TrendingUp },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ mobileOpen, onMobileClose, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    onMobileClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const NavLink = ({
    href, label, icon: Icon, showLabel = true,
  }: { href: string; label: string; icon: React.ElementType; showLabel?: boolean }) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
        style={{
          background: active ? "rgba(0,212,255,0.08)" : "transparent",
          color: active ? "var(--accent)" : "var(--muted-foreground)",
          borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
        }}
      >
        <Icon size={15} className="flex-shrink-0" />
        {showLabel && (
          <span
            className="text-xs tracking-widest"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
          >
            {label}
          </span>
        )}
        {active && showLabel && (
          <div
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}
          />
        )}
      </Link>
    );
  };

  const SidebarBody = ({ forceShowLabels = false }: { forceShowLabels?: boolean }) => {
    const showLabel = forceShowLabels || !collapsed;
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div
          className="flex items-center gap-3 p-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--card-border)", minHeight: "64px" }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{
              background: "var(--muted)",
              border: "1px solid var(--accent)",
              boxShadow: "0 0 12px rgba(0,212,255,0.25)",
            }}
          >
            <Zap size={16} style={{ color: "var(--accent)" }} />
          </div>
          {showLabel && (
            <div className="flex-1 min-w-0">
              <div
                className="font-bold text-xs tracking-widest truncate"
                style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.15em" }}
              >
                BILLSCAN_AI
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                EXPENSE_SYSTEM
              </div>
            </div>
          )}
          <button
            onClick={() => { const next = !collapsed; setCollapsed(next); onCollapsedChange?.(next); }}
            className="hidden lg:flex ml-auto p-1.5 rounded-md hover:bg-white/5 flex-shrink-0"
            style={{ color: "var(--muted-foreground)", border: "1px solid var(--card-border)" }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto p-1.5 rounded-md hover:bg-white/5 flex-shrink-0"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Section label */}
        {showLabel && (
          <div className="px-4 pt-4 pb-1">
            <span
              className="text-xs tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.2em" }}
            >
              NAVIGATION
            </span>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} showLabel={showLabel} />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="p-2 space-y-0.5 border-t flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
          {showLabel && (
            <div className="px-3 pt-2 pb-1">
              <span
                className="text-xs tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.2em" }}
              >
                SYSTEM
              </span>
            </div>
          )}
          {bottomItems.map((item) => (
            <NavLink key={item.href} {...item} showLabel={showLabel} />
          ))}

          {/* User */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mt-2"
            style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}
          >
            <div
              className="w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--card)",
                border: "1px solid var(--accent)",
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                boxShadow: "0 0 8px rgba(0,212,255,0.2)",
              }}
            >
              ผ
            </div>
            {showLabel && (
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-medium truncate"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)", fontSize: "11px" }}
                >
                  ADMIN_USER
                </div>
                <div className="text-xs truncate" style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>
                  LVL_4 CLEARANCE
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300"
        style={{
          width: collapsed ? "72px" : "260px",
          background: "rgba(9,9,28,0.95)",
          borderRight: "1px solid var(--card-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <SidebarBody />
      </aside>

      {/* ── Mobile overlay drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.75)", zIndex: 0 }}
            onClick={onMobileClose}
          />
          <aside
            className="relative flex flex-col w-72 h-full animate-slide-in"
            style={{
              background: "rgba(9,9,28,0.98)",
              borderRight: "1px solid var(--card-border)",
              boxShadow: "4px 0 32px rgba(0,212,255,0.08)",
              zIndex: 1,
            }}
          >
            <SidebarBody forceShowLabels />
          </aside>
        </div>
      )}

      {/* Mobile bottom tab bar removed — horizontal top tabs handled by AppLayout */}
    </>
  );
}
