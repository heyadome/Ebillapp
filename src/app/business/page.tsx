"use client";
import AppLayout from "@/components/AppLayout";
import { Building2, Plus, Users } from "lucide-react";

export default function BusinessPage() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ข้อมูลธุรกิจ</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>จัดการข้อมูลบริษัทและการตั้งค่า</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.1)" }}>
              <Building2 size={28} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>บริษัทตัวอย่าง จำกัด</h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>เลขภาษี: 0000000000000</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "ชื่อบริษัท", value: "บริษัทตัวอย่าง จำกัด" },
              { label: "เลขประจำตัวผู้เสียภาษี", value: "0000000000000" },
              { label: "ที่อยู่", value: "123 ถนนสุขุมวิท กรุงเทพฯ 10110" },
              { label: "เบอร์โทร", value: "02-000-0000" },
              { label: "อีเมล", value: "info@company.com" },
              { label: "สกุลเงินหลัก", value: "THB — บาทไทย" },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                <input
                  defaultValue={value}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                />
              </div>
            ))}
          </div>

          <button className="px-6 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
            บันทึกข้อมูล
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
