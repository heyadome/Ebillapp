"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Lock, User, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--foreground)", fontFamily: "'Manrope', sans-serif" }}
          >
            The Precision Curator
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
            ระบบจัดการค่าใช้จ่ายอัจฉริยะ
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-3xl p-8 editorial-shadow"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        >
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: "rgba(37,99,235,0.08)" }}
            >
              <Lock size={24} style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              เข้าสู่ระบบ
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              กรุณากรอกข้อมูลเพื่อเข้าใช้งาน
            </p>
          </div>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm font-medium text-center"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "var(--danger)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field !pl-11 !pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              style={{ borderRadius: "14px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          {/* Test credentials hint */}
          <div
            className="mt-6 p-3 rounded-xl text-center"
            style={{ background: "var(--muted)" }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              บัญชีทดสอบ: <strong style={{ color: "var(--foreground)" }}>admin</strong> /
              รหัสผ่าน: <strong style={{ color: "var(--foreground)" }}>1234</strong>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--muted-foreground)" }}>
          &copy; 2026 The Precision Curator. All rights reserved.
        </p>
      </div>
    </div>
  );
}
