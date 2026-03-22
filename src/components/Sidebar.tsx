"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Receipt, Mail, Upload, Settings,
  Building2, Users, FileText, TrendingUp,
  ChevronLeft, ChevronRight, X, Zap, Search
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { href: "/dashboard", label: "สรุปภาพรวม", icon: LayoutDashboard },
  { href: "/receipts",  label: "รายการค่าใช้จ่าย", icon: Receipt },
  { href: "/upload",    label: "สแกนบิลใหม่", icon: Upload },
  { href: "/email",     label: "สแกนอีเมล",  icon: Mail },
  { href: "/reports",   label: "รายงาน",     icon: TrendingUp },
  { href: "/vouchers",  label: "ใบรับรองแทน", icon: FileText },
];

const bottomItems = [
  { href: "/business",   label: "ข้อมูลธุรกิจ", icon: Building2 },
  { href: "/requesters", label: "ผู้เบิก",     icon: Users },
  { href: "/settings",   label: "ตั้งค่า",     icon: Settings },
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
    // Exact match for dashboard to prevent matching everything else (if any start with /dashboard, but none do)
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
        style={{
          background: active ? "var(--accent)" : "transparent",
          color: active ? "white" : "var(--muted-foreground)",
          fontWeight: active ? 600 : 500,
          textDecoration: "none",
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
             style={{ background: active ? "rgba(255,255,255,0.2)" : "transparent" }}>
          <Icon size={18} />
        </div>
        {showLabel && (
          <span className="text-sm">{label}</span>
        )}
      </Link>
    );
  };

  const SidebarBody = ({ forceShowLabels = false }: { forceShowLabels?: boolean }) => {
    const showLabel = forceShowLabels || !collapsed;
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--card-border)", minHeight: "64px" }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{ background: "var(--foreground)", color: "white" }}>
            <LayoutDashboard size={16} />
          </div>
          {showLabel && (
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>
                The Precision Curator
              </div>
            </div>
          )}
          <button
            onClick={() => { const next = !collapsed; setCollapsed(next); onCollapsedChange?.(next); }}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg flex-shrink-0 hover:bg-gray-100"
            style={{ color: "var(--muted-foreground)" }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg flex-shrink-0 hover:bg-gray-100"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section label */}
        {showLabel && (
          <div className="px-4 pt-3 pb-1">
            <span className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
              เมนูหลัก
            </span>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} showLabel={showLabel} />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-2 space-y-0.5 border-t flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
          {showLabel && (
            <div className="px-3 pt-2 pb-1">
              <span className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
                ระบบ
              </span>
            </div>
          )}
          {bottomItems.map((item) => (
            <NavLink key={item.href} {...item} showLabel={showLabel} />
          ))}

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2"
            style={{ background: "var(--muted)" }}>
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--accent)", color: "white" }}>
              ผ
            </div>
            {showLabel && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                  ผู้ดูแลระบบ
                </div>
                <div className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                  admin@company.com
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
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300"
        style={{
          width: collapsed ? "72px" : "260px",
          background: "var(--card)",
          borderRight: "1px solid var(--card-border)",
        }}
      >
        <SidebarBody />
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={onMobileClose} />
          <aside
            className="relative flex flex-col w-72 h-full animate-slide-in"
            style={{ background: "var(--card)", borderRight: "1px solid var(--card-border)", zIndex: 1 }}>
            <SidebarBody forceShowLabels />
          </aside>
        </div>
      )}
    </>
  );
}
