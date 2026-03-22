import { NextRequest, NextResponse } from "next/server";
import { performOCR } from "@/lib/ai-ocr";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type || "image/jpeg";

    const { result, provider, error } = await performOCR(base64, mediaType);

    if (error) {
      return NextResponse.json({ error, result: null, provider }, { status: 500 });
    }

    return NextResponse.json({ result, provider });
  } catch (error: unknown) {
    console.error("OCR error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
