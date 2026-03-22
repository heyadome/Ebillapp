import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Get AI settings (admin only)
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const business = await prisma.business.findFirst({
    select: {
      aiProvider: true,
      aiAutoSwitch: true,
      claudeApiKey: true,
      geminiApiKey: true,
      chatgptApiKey: true,
    },
  });

  return NextResponse.json({
    settings: {
      aiProvider: business?.aiProvider || "claude",
      aiAutoSwitch: business?.aiAutoSwitch ?? true,
      claudeApiKey: business?.claudeApiKey ? maskKey(business.claudeApiKey) : "",
      geminiApiKey: business?.geminiApiKey ? maskKey(business.geminiApiKey) : "",
      chatgptApiKey: business?.chatgptApiKey ? maskKey(business.chatgptApiKey) : "",
      claudeConfigured: !!(business?.claudeApiKey || process.env.ANTHROPIC_API_KEY),
      geminiConfigured: !!(business?.geminiApiKey || process.env.GEMINI_API_KEY),
      chatgptConfigured: !!(business?.chatgptApiKey || process.env.OPENAI_API_KEY),
    },
  });
}

// Update AI settings (admin only)
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const body = await req.json();
  const business = await prisma.business.findFirst();
  if (!business) {
    return NextResponse.json({ error: "ไม่พบข้อมูลธุรกิจ" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.aiProvider !== undefined) data.aiProvider = body.aiProvider;
  if (body.aiAutoSwitch !== undefined) data.aiAutoSwitch = body.aiAutoSwitch;
  if (body.claudeApiKey !== undefined && !body.claudeApiKey.includes("••••")) {
    data.claudeApiKey = body.claudeApiKey || null;
  }
  if (body.geminiApiKey !== undefined && !body.geminiApiKey.includes("••••")) {
    data.geminiApiKey = body.geminiApiKey || null;
  }
  if (body.chatgptApiKey !== undefined && !body.chatgptApiKey.includes("••••")) {
    data.chatgptApiKey = body.chatgptApiKey || null;
  }

  await prisma.business.update({ where: { id: business.id }, data });

  return NextResponse.json({ success: true });
}

function maskKey(key: string): string {
  if (key.length <= 12) return "••••••••";
  return "••••••••" + key.slice(-8);
}
