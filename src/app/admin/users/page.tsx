"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users, Plus, Pencil, Trash2, Shield, ShieldCheck, UserCheck, UserX,
  X, Eye, EyeOff, Search
} from "lucide-react";

interface UserRow {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/auth/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditUser(null);
    setForm({ username: "", name: "", email: "", password: "1234", role: "user" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setForm({ username: u.username, name: u.name || "", email: u.email || "", password: "", role: u.role });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editUser) {
        const body: Record<string, unknown> = { username: form.username, name: form.name, email: form.email, role: form.role };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/auth/users/${editUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json();
          setError(d.error || "เกิดข้อผิดพลาด");
          return;
        }
      } else {
        const res = await fetch("/api/auth/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const d = await res.json();
          setError(d.error || "เกิดข้อผิดพลาด");
          return;
        }
      }
      setShowModal(false);
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: UserRow) => {
    await fetch(`/api/auth/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    fetchUsers();
  };

  const handleDelete = async (u: UserRow) => {
    if (!confirm(`ต้องการลบผู้ใช้ "${u.name || u.username}" หรือไม่?`)) return;
    await fetch(`/api/auth/users/${u.id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              ทั้งหมด {users.length} บัญชี
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm" style={{ borderRadius: "100px", padding: "10px 24px" }}>
            <Plus size={16} /> <span className="font-bold">เพิ่มผู้ใช้</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-full px-4 py-2.5 max-w-md"
          style={{ background: "var(--muted)", border: "1px solid var(--card-border)" }}>
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหรือ username..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--foreground)" }} />
        </div>

        {/* Users List */}
        <div className="rounded-3xl overflow-hidden bg-white shadow-sm" style={{ border: "1px solid var(--card-border)" }}>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                  {["ผู้ใช้", "ชื่อผู้ใช้", "บทบาท", "สถานะ", "วันที่สร้าง", "จัดการ"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>{[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-4 rounded animate-pulse" style={{ background: "var(--muted)" }} />
                      </td>
                    ))}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">ไม่พบผู้ใช้</td>
                  </tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: u.role === "admin" ? "rgba(37,99,235,0.1)" : "var(--muted)", color: u.role === "admin" ? "var(--accent)" : "var(--muted-foreground)" }}>
                          {(u.name || u.username)[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{u.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>{u.username}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: u.role === "admin" ? "rgba(37,99,235,0.08)" : "var(--muted)",
                          color: u.role === "admin" ? "var(--accent)" : "var(--muted-foreground)",
                        }}>
                        {u.role === "admin" ? <ShieldCheck size={12} /> : <Shield size={12} />}
                        {u.role === "admin" ? "แอดมิน" : "ผู้ใช้"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          color: u.active ? "#10b981" : "#ef4444",
                          border: `1px solid ${u.active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                        }}>
                        {u.active ? <UserCheck size={12} /> : <UserX size={12} />}
                        {u.active ? "ใช้งาน" : "ระงับ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: "var(--accent)" }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleToggleActive(u)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          style={{ color: u.active ? "#f59e0b" : "#10b981" }}>
                          {u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button onClick={() => handleDelete(u)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" style={{ color: "#ef4444" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y" style={{ borderColor: "var(--card-border)" }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4"><div className="h-16 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} /></div>
              ))
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">ไม่พบผู้ใช้</div>
            ) : filtered.map((u) => (
              <div key={u.id} className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: u.role === "admin" ? "rgba(37,99,235,0.1)" : "var(--muted)", color: u.role === "admin" ? "var(--accent)" : "var(--muted-foreground)" }}>
                  {(u.name || u.username)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>{u.name || "—"}</p>
                  <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>@{u.username}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{ background: u.role === "admin" ? "rgba(37,99,235,0.08)" : "var(--muted)", color: u.role === "admin" ? "var(--accent)" : "var(--muted-foreground)" }}>
                    {u.role === "admin" ? "แอดมิน" : "ผู้ใช้"}
                  </span>
                  <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg" style={{ color: "var(--accent)" }}>
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-md rounded-3xl p-6 animate-fade-in"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                {editUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={18} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.08)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>ชื่อผู้ใช้ (Username) *</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="username" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>ชื่อ-นามสกุล</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ชื่อ-นามสกุล" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>อีเมล</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@company.com (ไม่บังคับ)" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                  รหัสผ่าน {editUser ? "(เว้นว่างถ้าไม่ต้องการเปลี่ยน)" : "*"}
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editUser ? "••••••••" : "1234"} className="input-field pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>บทบาท</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field">
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="admin">แอดมิน</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {editUser ? "บันทึก" : "สร้างผู้ใช้"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AppLayout>
  );
}
