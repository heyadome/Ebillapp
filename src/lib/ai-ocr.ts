import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { prisma } from "@/lib/prisma";

const execFileAsync = promisify(execFile);

const OCR_PROMPT = `คุณเป็นผู้เชี่ยวชาญด้านการอ่านใบเสร็จและใบกำกับภาษีไทย

กรุณาดึงข้อมูลจากเอกสารนี้และส่งกลับเป็น JSON ดังนี้:
{
  "type": "receipt" หรือ "invoice" (ถ้าเป็นทั้งสองอย่างให้ใช้ "receipt"),
  "receiptNumber": "เลขที่ใบเสร็จ/ใบกำกับภาษี",
  "issueDate": "YYYY-MM-DD",
  "vendorName": "ชื่อร้านค้า/บริษัทผู้ขาย",
  "vendorTaxId": "เลขประจำตัวผู้เสียภาษีผู้ขาย",
  "vendorAddress": "ที่อยู่ผู้ขาย",
  "customerName": "ชื่อลูกค้า/ผู้ซื้อ (ดูจากช่อง ลูกค้า หรือ ผู้ซื้อ)",
  "customerTaxId": "เลขประจำตัวผู้เสียภาษีลูกค้า",
  "customerAddress": "ที่อยู่ลูกค้า",
  "totalAmount": ยอดรวมสุทธิที่ต้องชำระ (ตัวเลข),
  "subtotal": ยอดก่อนภาษี/ราคาสินค้าก่อน VAT (ตัวเลข),
  "discount": ส่วนลดรวม (ตัวเลข ถ้าไม่มีใส่ 0),
  "vat": ภาษีมูลค่าเพิ่ม VAT (ตัวเลข),
  "wht": ภาษีหัก ณ ที่จ่าย WHT (ตัวเลข),
  "note": "หมายเหตุ/เลขอ้างอิงการชำระเงิน (ถ้ามี)",
  "items": [
    {
      "description": "รายละเอียดสินค้า/บริการ พร้อมรหัสสินค้าถ้ามี",
      "type": "product" หรือ "service",
      "quantity": จำนวน,
      "unitPrice": ราคาต่อหน่วย (รวม VAT ถ้าแสดงอยู่),
      "amount": ยอดรวมก่อนหักส่วนลด (ตัวเลข),
      "discount": ส่วนลดของรายการนี้ (ตัวเลข ถ้าไม่มีใส่ 0)
    }
  ]
}

กฎสำคัญ:
- ส่งกลับเฉพาะ JSON เท่านั้น ไม่ต้องมีข้อความอื่น
- ถ้าไม่มีข้อมูลให้ใส่ null สำหรับ string หรือ 0 สำหรับตัวเลข
- issueDate ต้องเป็นรูปแบบ YYYY-MM-DD เสมอ
- totalAmount คือยอดที่ลูกค้าต้องชำระจริง (หลังหักส่วนลดและรวม VAT แล้ว)
- subtotal คือยอดสินค้าก่อน VAT (หลังหักส่วนลดแล้ว)`;

/** Timeout per provider in milliseconds */
const PROVIDER_TIMEOUT_MS = 45_000;

type Provider = "claude" | "gemini" | "chatgpt";

interface OCRResult {
  result: Record<string, unknown> | null;
  provider: Provider;
  error?: string;
}

interface AISettings {
  aiProvider: Provider;
  aiAutoSwitch: boolean;
  claudeApiKey: string | null;
  geminiApiKey: string | null;
  chatgptApiKey: string | null;
}

async function getAISettings(): Promise<AISettings> {
  const business = await prisma.business.findFirst({
    select: { aiProvider: true, aiAutoSwitch: true, claudeApiKey: true, geminiApiKey: true, chatgptApiKey: true },
  });
  return {
    aiProvider: (business?.aiProvider || "claude") as Provider,
    aiAutoSwitch: business?.aiAutoSwitch ?? true,
    claudeApiKey: business?.claudeApiKey || process.env.ANTHROPIC_API_KEY || null,
    geminiApiKey: business?.geminiApiKey || process.env.GEMINI_API_KEY || null,
    chatgptApiKey: business?.chatgptApiKey || process.env.OPENAI_API_KEY || null,
  };
}

/** Wraps a promise with a timeout. Throws if the timeout is exceeded. */
function withTimeout<T>(promise: Promise<T>, ms: number, provider: Provider): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${providerLabel(provider)} หมดเวลา (timeout ${ms / 1000}s)`)), ms)
    ),
  ]);
}

/**
 * Convert a PDF (base64) to a JPEG image (base64) using pdftoppm (poppler).
 * Returns null if conversion fails.
 */
async function pdfToImageBase64(pdfBase64: string): Promise<{ base64: string; mediaType: string } | null> {
  const tmpIn = join(tmpdir(), `ocr_${Date.now()}.pdf`);
  const tmpOutPrefix = join(tmpdir(), `ocr_${Date.now()}`);
  try {
    await writeFile(tmpIn, Buffer.from(pdfBase64, "base64"));
    // pdftoppm converts PDF page 1 to PPM image → we use -jpeg flag
    await execFileAsync("pdftoppm", ["-jpeg", "-r", "200", "-f", "1", "-l", "1", tmpIn, tmpOutPrefix]);
    // Output file will be tmpOutPrefix-1.jpg or tmpOutPrefix-01.jpg
    let imgPath = `${tmpOutPrefix}-1.jpg`;
    try {
      await readFile(imgPath);
    } catch {
      imgPath = `${tmpOutPrefix}-01.jpg`;
    }
    const imgBuffer = await readFile(imgPath);
    await unlink(tmpIn).catch(() => {});
    await unlink(imgPath).catch(() => {});
    return { base64: imgBuffer.toString("base64"), mediaType: "image/jpeg" };
  } catch {
    await unlink(tmpIn).catch(() => {});
    return null;
  }
}

function parseOCRText(text: string): Record<string, unknown> | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

async function ocrWithClaude(base64: string, mediaType: string, apiKey: string): Promise<OCRResult> {
  const anthropic = new Anthropic({ apiKey });
  const isPdf = mediaType === "application/pdf";

  // Claude supports PDF natively via document content type
  const contentItem = isPdf
    ? {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: "application/pdf" as const,
          data: base64,
        },
      }
    : {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: base64,
        },
      };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [contentItem, { type: "text", text: OCR_PROMPT }],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return { result: parseOCRText(text), provider: "claude" };
}

async function ocrWithGemini(base64: string, mediaType: string, apiKey: string): Promise<OCRResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Gemini doesn't support PDF directly — convert to image first
  let imgBase64 = base64;
  let imgType = mediaType;
  if (mediaType === "application/pdf") {
    const converted = await pdfToImageBase64(base64);
    if (converted) {
      imgBase64 = converted.base64;
      imgType = converted.mediaType;
    } else {
      throw new Error("ไม่สามารถแปลง PDF เป็นรูปภาพได้ — กรุณาอัปโหลดเป็นรูปภาพแทน");
    }
  }

  const response = await model.generateContent([
    { inlineData: { mimeType: imgType, data: imgBase64 } },
    { text: OCR_PROMPT },
  ]);

  const text = response.response.text();
  return { result: parseOCRText(text), provider: "gemini" };
}

async function ocrWithChatGPT(base64: string, mediaType: string, apiKey: string): Promise<OCRResult> {
  const openai = new OpenAI({ apiKey });

  // ChatGPT doesn't support PDF directly — convert to image first
  let imgBase64 = base64;
  let imgType = mediaType;
  if (mediaType === "application/pdf") {
    const converted = await pdfToImageBase64(base64);
    if (converted) {
      imgBase64 = converted.base64;
      imgType = converted.mediaType;
    } else {
      throw new Error("ไม่สามารถแปลง PDF เป็นรูปภาพได้ — กรุณาอัปโหลดเป็นรูปภาพแทน");
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${imgType};base64,${imgBase64}`,
              detail: "high",
            },
          },
          { type: "text", text: OCR_PROMPT },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";
  return { result: parseOCRText(text), provider: "chatgpt" };
}

function errorReason(error: unknown): "rate_limit" | "timeout" | "other" {
  if (!(error instanceof Error)) return "other";
  const msg = error.message.toLowerCase();
  if (
    msg.includes("rate_limit") ||
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("overloaded") ||
    msg.includes("insufficient_quota")
  ) return "rate_limit";
  if (msg.includes("timeout") || msg.includes("หมดเวลา") || msg.includes("timed out") || msg.includes("etimedout")) return "timeout";
  return "other";
}

async function tryProvider(provider: Provider, base64: string, mediaType: string, settings: AISettings): Promise<OCRResult | null> {
  if (provider === "claude" && settings.claudeApiKey) {
    return await withTimeout(ocrWithClaude(base64, mediaType, settings.claudeApiKey), PROVIDER_TIMEOUT_MS, provider);
  }
  if (provider === "gemini" && settings.geminiApiKey) {
    return await withTimeout(ocrWithGemini(base64, mediaType, settings.geminiApiKey), PROVIDER_TIMEOUT_MS, provider);
  }
  if (provider === "chatgpt" && settings.chatgptApiKey) {
    return await withTimeout(ocrWithChatGPT(base64, mediaType, settings.chatgptApiKey), PROVIDER_TIMEOUT_MS, provider);
  }
  return null; // provider not configured
}

/**
 * Main OCR function with auto-switch fallback.
 * Rotation: primary → fallback1 → fallback2 on ANY error.
 */
export async function performOCR(base64: string, mediaType: string): Promise<OCRResult> {
  const settings = await getAISettings();
  const primary = settings.aiProvider;

  const allProviders: Provider[] = ["claude", "gemini", "chatgpt"];
  const rotation: Provider[] = [primary, ...allProviders.filter((p) => p !== primary)];

  const errors: { provider: Provider; reason: string }[] = [];

  for (let i = 0; i < rotation.length; i++) {
    const provider = rotation[i];
    const isFirst = i === 0;

    if (!isFirst && !settings.aiAutoSwitch) break;

    try {
      const result = await tryProvider(provider, base64, mediaType, settings);
      if (result !== null) {
        if (!isFirst) {
          console.log(`[AI OCR] Auto-switched to ${provider} (after: ${errors.map((e) => e.provider).join(" → ")})`);
        }
        return result;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[AI OCR] ${providerLabel(provider)} failed: ${msg}`);
      errors.push({ provider, reason: msg });
    }
  }

  // All exhausted
  const configuredCount = rotation.filter((p) => {
    if (p === "claude") return !!settings.claudeApiKey;
    if (p === "gemini") return !!settings.geminiApiKey;
    if (p === "chatgpt") return !!settings.chatgptApiKey;
    return false;
  }).length;

  if (configuredCount === 0) {
    return { result: null, provider: primary, error: "ไม่มี API Key ที่ตั้งค่าไว้ กรุณาตั้งค่า AI ในหน้าตั้งค่า" };
  }

  if (errors.length === 1) {
    const r = errorReason({ message: errors[0].reason } as Error);
    const label = providerLabel(errors[0].provider);
    if (r === "timeout") return { result: null, provider: primary, error: `${label} ตอบสนองช้าเกินไป (timeout)` };
    if (r === "rate_limit") return { result: null, provider: primary, error: `${label} ถึงขีดจำกัด (Rate Limit)` };
    return { result: null, provider: primary, error: errors[0].reason };
  }

  return {
    result: null,
    provider: primary,
    error: `AI ทั้งหมด (${errors.map((e) => providerLabel(e.provider)).join(", ")}) ไม่สามารถใช้งานได้ชั่วคราว`,
  };
}

function providerLabel(p: Provider): string {
  if (p === "claude") return "Claude AI";
  if (p === "gemini") return "Gemini AI";
  return "ChatGPT";
}
