import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { uploadToGoogleDrive, isGoogleDriveConfigured } from "@/lib/google-drive";

// Upload a file to Google Drive
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isGoogleDriveConfigured()) {
    return NextResponse.json({ error: "Google Drive ยังไม่ได้ตั้งค่า" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileName = (formData.get("fileName") as string) || file?.name || "receipt.jpg";

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadToGoogleDrive({
      fileName,
      mimeType: file.type || "image/jpeg",
      fileBuffer: buffer,
    });

    if (!result) {
      return NextResponse.json({ error: "อัพโหลดไป Google Drive ไม่สำเร็จ" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      webViewLink: result.webViewLink,
    });
  } catch (error) {
    console.error("Drive upload error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัพโหลด" }, { status: 500 });
  }
}

// Check Google Drive status
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    configured: isGoogleDriveConfigured(),
  });
}
