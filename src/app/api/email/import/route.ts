import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { emailIds } = await req.json();
  // In production: fetch email attachments and process with OCR
  return NextResponse.json({
    imported: emailIds?.length || 0,
    message: "Demo mode: นำเข้าสำเร็จ",
  });
}
