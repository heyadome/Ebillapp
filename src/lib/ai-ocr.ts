import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
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

/** Timeout per provider in milliseconds */
const PROVIDER_TIMEOUT_MS = 30_000;

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
    { inlineData: { mimeType, data: base64 } },
    { text: OCR_PROMPT },
  ]);

  const text = response.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  return { result, provider: "gemini" };
}

async function ocrWithChatGPT(base64: string, mediaType: string, apiKey: string): Promise<OCRResult> {
  const openai = new OpenAI({ apiKey });

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
              url: `data:${mediaType};base64,${base64}`,
              detail: "high",
            },
          },
          { type: "text", text: OCR_PROMPT },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  return { result, provider: "chatgpt" };
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
 * Rotation: primary → next available → next available.
 * Switches on ANY error (rate limit, timeout, network, etc.) when aiAutoSwitch is on.
 */
export async function performOCR(base64: string, mediaType: string): Promise<OCRResult> {
  const settings = await getAISettings();
  const primary = settings.aiProvider;

  const allProviders: Provider[] = ["claude", "gemini", "chatgpt"];
  // Build rotation: primary first, then the rest in fixed order
  const rotation: Provider[] = [primary, ...allProviders.filter((p) => p !== primary)];

  const errors: { provider: Provider; reason: string }[] = [];

  for (let i = 0; i < rotation.length; i++) {
    const provider = rotation[i];
    const isFirst = i === 0;

    // Only try fallbacks when auto-switch is enabled
    if (!isFirst && !settings.aiAutoSwitch) break;

    try {
      const result = await tryProvider(provider, base64, mediaType, settings);
      if (result !== null) {
        if (!isFirst) {
          console.log(`[AI OCR] Auto-switched to ${provider} (fallback from ${errors.map((e) => e.provider).join(" → ")})`);
        }
        return result;
      }
      // Provider not configured — skip silently
    } catch (error) {
      const reason = errorReason(error);
      const label = providerLabel(provider);
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[AI OCR] ${label} failed (${reason}): ${msg}`);
      errors.push({ provider, reason: msg });
      // Always continue to next provider when auto-switch is on
    }
  }

  // All providers exhausted or none configured
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
    const r = errors[0].reason;
    const label = providerLabel(errors[0].provider);
    if (r.toLowerCase().includes("timeout") || r.includes("หมดเวลา")) {
      return { result: null, provider: primary, error: `${label} ตอบสนองช้าเกินไป (timeout)` };
    }
    if (r.toLowerCase().includes("rate") || r.includes("quota")) {
      return { result: null, provider: primary, error: `${label} ถึงขีดจำกัด (Rate Limit)${settings.aiAutoSwitch ? " — AI สำรองทั้งหมดไม่มี API Key" : " — เปิดสลับอัตโนมัติเพื่อใช้ AI สำรอง"}` };
    }
    return { result: null, provider: primary, error: `${label} ไม่สามารถใช้งานได้ชั่วคราว` };
  }

  return {
    result: null,
    provider: primary,
    error: `AI ทั้งหมด (${errors.map((e) => providerLabel(e.provider)).join(", ")}) ไม่สามารถใช้งานได้ชั่วคราว — กรุณาลองใหม่ภายหลัง`,
  };
}

function providerLabel(p: Provider): string {
  if (p === "claude") return "Claude AI";
  if (p === "gemini") return "Gemini AI";
  return "ChatGPT";
}
