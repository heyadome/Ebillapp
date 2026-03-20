import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: "ANTHROPIC_API_KEY not configured",
        result: null,
      }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `คุณเป็นผู้เชี่ยวชาญด้านการอ่านใบเสร็จและใบกำกับภาษีไทย

กรุณาดึงข้อมูลจากเอกสารนี้และส่งกลับเป็น JSON ดังนี้:
{
  "type": "receipt" หรือ "invoice",
  "receiptNumber": "เลขที่ใบเสร็จ/ใบกำกับภาษี",
  "issueDate": "YYYY-MM-DD",
  "vendorName": "ชื่อร้านค้า/บริษัท",
  "vendorTaxId": "เลขประจำตัวผู้เสียภาษี",
  "vendorAddress": "ที่อยู่ผู้ขาย",
  "totalAmount": ยอดรวม (ตัวเลข),
  "subtotal": ยอดก่อนภาษี (ตัวเลข),
  "vat": VAT (ตัวเลข),
  "wht": ภาษีหัก ณ ที่จ่าย (ตัวเลข),
  "items": [
    {
      "description": "รายละเอียดสินค้า/บริการ",
      "type": "product" หรือ "service",
      "quantity": จำนวน,
      "unitPrice": ราคาต่อหน่วย,
      "amount": ยอดรวม
    }
  ]
}

ส่งกลับเฉพาะ JSON เท่านั้น ไม่ต้องมีข้อความอื่น หากไม่มีข้อมูลให้ใส่ null`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    let result = null;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse OCR response");
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
