"use client";
import AppLayout from "@/components/AppLayout";
import { Users, Plus, Mail, Briefcase } from "lucide-react";
import { useState } from "react";

const DEMO = [
  { id: "1", name: "สมชาย ใจดี", position: "ผู้จัดการฝ่ายขาย", email: "somchai@company.com", receipts: 12 },
  { id: "2", name: "สมหญิง รักดี", position: "พนักงานบัญชี", email: "somying@company.com", receipts: 8 },
];

export default function RequestersPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ผู้เบิกจ่าย</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>จัดการรายชื่อผู้เบิกค่าใช้จ่าย</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
            <Plus size={14} /> เพิ่มผู้เบิกจ่าย
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {DEMO.map((person) => (
            <div key={person.id} className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                style={{ background: "rgba(0,212,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 12px rgba(0,212,255,0.15)" }}>
                {person.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: "var(--foreground)" }}>{person.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <Briefcase size={12} /> {person.position}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <Mail size={12} /> {person.email}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{person.receipts} ใบ</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>ใบเสร็จทั้งหมด</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
