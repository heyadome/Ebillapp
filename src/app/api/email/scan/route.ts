import { NextResponse } from "next/server";

export async function POST() {
  // In production: connect to Gmail API and scan for receipts
  // For now, return a helpful message
  return NextResponse.json({
    error: "Gmail API not configured",
    message: "กรุณาตั้งค่า GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ใน .env.local",
    emails: [],
  });
}
