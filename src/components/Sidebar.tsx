"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Receipt, Mail, Upload, Settings,
  Building2, Users, FileText, TrendingUp,
  ChevronLeft, ChevronRight, X, Camera, HelpCircle, LogOut
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Nav items with optional adminOnly flag
const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/upload",    label: "สแกนบิล",  icon: Camera },
  { href: "/receipts",  label: "รายการใช้จ่าย", icon: Receipt },
  { href: "/email",     label: "สแกนอีเมล",  icon: Mail, adminOnly: true },
  { href: "/reports",   label: "รายงาน",     icon: TrendingUp },
  { href: "/vouchers",  label: "ใบรับรองแทน", icon: FileText, adminOnly: true },
];

const bottomItems = [
  { href: "/business",    label: "ข้อมูลธุรกิจ", icon: Building2, adminOnly: true },
  { href: "/admin/users", label: "จัดการผู้ใช้",  icon: Users, adminOnly: true },
  { href: "/requesters",  label: "ผู้เบิก",     icon: Users, adminOnly: true },
  { href: "/settings",    label: "ตั้งค่า",     icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ mobileOpen, onMobileClose, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
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
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95"
        style={{
          background: active ? "var(--card)" : "transparent",
          color: active ? "var(--accent)" : "var(--muted-foreground)",
          fontWeight: active ? 700 : 500,
          textDecoration: "none",
          boxShadow: active ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
          borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
        }}
      >
        <Icon size={18} />
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
        <div className="flex items-center gap-3 px-5 flex-shrink-0" style={{ minHeight: "72px" }}>
          <div className="flex-1 min-w-0">
            {showLabel ? (
              <>
                <div className="font-extrabold text-base tracking-tight" style={{ color: "var(--foreground)", fontFamily: "'Manrope', sans-serif" }}>
                  The Precision Curator
                </div>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  การจัดการค่าใช้จ่ายระดับพรีเมียม
                </p>
              </>
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)", color: "white" }}>
                <LayoutDashboard size={16} />
              </div>
            )}
          </div>
          <button
            onClick={() => { const next = !collapsed; setCollapsed(next); onCollapsedChange?.(next); }}
            className="hidden lg:flex p-1.5 rounded-lg flex-shrink-0 hover:bg-white/50"
            style={{ color: "var(--muted-foreground)" }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg flex-shrink-0 hover:bg-white/50"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !("adminOnly" in item && item.adminOnly) || user?.role === "admin")
            .map((item) => (
              <NavLink key={item.href} {...item} showLabel={showLabel} />
            ))}
        </nav>

        {/* Scan CTA Button */}
        {showLabel && (
          <div className="px-4 py-3">
            <Link href="/upload"
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "var(--accent)", color: "white",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                textDecoration: "none",
              }}>
              <Camera size={18} /> สแกนบิลใหม่
            </Link>
          </div>
        )}

        {/* Bottom nav */}
        <div className="px-3 py-2 space-y-1 border-t flex-shrink-0" style={{ borderColor: "var(--card-border)" }}>
          {bottomItems
            .filter((item) => !("adminOnly" in item && item.adminOnly) || user?.role === "admin")
            .map((item) => (
              <NavLink key={item.href} {...item} showLabel={showLabel} />
            ))}

          {/* User */}
          {showLabel && user && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mt-2"
              style={{ background: "var(--card)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-100 text-sm font-bold"
                style={{ background: "rgba(37,99,235,0.1)", color: "var(--accent)" }}>
                {(user.name || user.username || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                  {user.name || user.username}
                </div>
                <div className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                  {user.role === "admin" ? "แอดมิน" : "ผู้ใช้"}
                </div>
              </div>
              <button
                onClick={async () => { await logout(); router.push("/login"); }}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                style={{ color: "#ef4444" }}
                title="ออกจากระบบ"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
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
          width: collapsed ? "72px" : "256px",
          background: "var(--muted)",
          borderRight: "none",
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
            style={{ background: "var(--muted)", zIndex: 1 }}>
            <SidebarBody forceShowLabels />
          </aside>
        </div>
      )}
    </>
  );
}
