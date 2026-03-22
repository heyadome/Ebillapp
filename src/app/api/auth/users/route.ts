import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// List all users (admin only)
export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      active: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// Create new user (admin only)
export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { username, name, email, password, role } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      username,
      name: name || null,
      email: email || null,
      password,
      role: role || "user",
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
