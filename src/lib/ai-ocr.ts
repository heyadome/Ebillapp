import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const OCR_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการอ่านใบเสร็จและใบกำกับภาษีไทย

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

ส่งกลับเฉพาะ JSON เท่านั้น ไม่ต้องมีข้อความอื่น หากไม่มีข้อมูลให้ใส่ null`;

interface OCRResult {
  result: Record<string, unknown> | null;
  provider: "claude" | "gemini";
  error?: string;
}

interface AISettings {
  aiProvider: string;
  aiAutoSwitch: boolean;
  claudeApiKey: string | null;
  geminiApiKey: string | null;
}

async function getAISettings(): Promise<AISettings> {
  const business = await prisma.business.findFirst({
    select: { aiProvider: true, aiAutoSwitch: true, claudeApiKey: true, geminiApiKey: true },
  });
  return {
    aiProvider: business?.aiProvider || "claude",
    aiAutoSwitch: business?.aiAutoSwitch ?? true,
    claudeApiKey: business?.claudeApiKey || process.env.ANTHROPIC_API_KEY || null,
    geminiApiKey: business?.geminiApiKey || process.env.GEMINI_API_KEY || null,
  };
}

async function ocrWithClaude(base64: string, mediaType: string, apiKey: string): Promise<OCRResult> {
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64,
            },
          },
          { type: "text", text: OCR_PROMPT },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  return { result, provider: "claude" };
}

async function ocrWithGemini(base64: string, mimeType: string, apiKey: string): Promise<OCRResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const response = await model.generateContent([
    {
      inlineData: { mimeType, data: base64 },
    },
    { text: OCR_PROMPT },
  ]);

  const text = response.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  return { result, provider: "gemini" };
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("rate_limit") ||
      msg.includes("rate limit") ||
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("resource_exhausted") ||
      msg.includes("overloaded")
    );
  }
  return false;
}

/**
 * Main OCR function with auto-switch fallback
 */
export async function performOCR(base64: string, mediaType: string): Promise<OCRResult> {
  const settings = await getAISettings();
  const primary = settings.aiProvider as "claude" | "gemini";

  // Determine which providers are available
  const canUseClaude = !!settings.claudeApiKey;
  const canUseGemini = !!settings.geminiApiKey;

  if (!canUseClaude && !canUseGemini) {
    return { result: null, provider: primary, error: "ไม่มี API Key ที่ตั้งค่าไว้ กรุณาตั้งค่า Claude AI หรือ Gemini AI" };
  }

  // Try primary provider first
  try {
    if (primary === "claude" && canUseClaude) {
      return await ocrWithClaude(base64, mediaType, settings.claudeApiKey!);
    } else if (primary === "gemini" && canUseGemini) {
      return await ocrWithGemini(base64, mediaType, settings.geminiApiKey!);
    }
  } catch (error) {
    console.error(`Primary AI (${primary}) failed:`, error);

    // Auto-switch to fallback if enabled
    if (settings.aiAutoSwitch) {
      const fallback = primary === "claude" ? "gemini" : "claude";
      const canUseFallback = fallback === "claude" ? canUseClaude : canUseGemini;

      if (canUseFallback && isRateLimitError(error)) {
        console.log(`Auto-switching to ${fallback} due to rate limit...`);
        try {
          if (fallback === "claude") {
            return await ocrWithClaude(base64, mediaType, settings.claudeApiKey!);
          } else {
            return await ocrWithGemini(base64, mediaType, settings.geminiApiKey!);
          }
        } catch (fallbackError) {
          console.error(`Fallback AI (${fallback}) also failed:`, fallbackError);
          return {
            result: null,
            provider: fallback,
            error: `ทั้ง ${primary} และ ${fallback} ไม่สามารถใช้งานได้`,
          };
        }
      }
    }

    return {
      result: null,
      provider: primary,
      error: isRateLimitError(error)
        ? `${primary === "claude" ? "Claude AI" : "Gemini AI"} ถึงขีดจำกัด (Rate Limit) ${settings.aiAutoSwitch ? "" : "— เปิดการสลับอัตโนมัติเพื่อใช้ AI สำรอง"}`
        : `เกิดข้อผิดพลาดจาก ${primary === "claude" ? "Claude AI" : "Gemini AI"}`,
    };
  }

  // If primary not available, try whichever is available
  try {
    if (canUseClaude) {
      return await ocrWithClaude(base64, mediaType, settings.claudeApiKey!);
    }
    if (canUseGemini) {
      return await ocrWithGemini(base64, mediaType, settings.geminiApiKey!);
    }
  } catch (error) {
    console.error("OCR error:", error);
  }

  return { result: null, provider: primary, error: "ไม่สามารถอ่านข้อมูลได้" };
}
