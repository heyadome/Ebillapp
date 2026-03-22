import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToGoogleDrive, isGoogleDriveConfigured } from "@/lib/google-drive";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    let business = await prisma.business.findFirst();
    if (!business) {
      business = await prisma.business.create({ data: { name: "บริษัทตัวอย่าง จำกัด" } });
    }

    const where: any = { businessId: business.id };
    if (search) {
      where.OR = [
        { vendorName: { contains: search } },
        { receiptNumber: { contains: search } },
      ];
    }
    if (status !== "all") where.status = status;

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, vendorName: true, receiptNumber: true, issueDate: true,
          createdAt: true, totalAmount: true, currency: true, type: true, status: true,
        },
      }),
      prisma.receipt.count({ where }),
    ]);

    return NextResponse.json({ receipts, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ receipts: [], total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, imageUrl, ...data } = body;

    let business = await prisma.business.findFirst();
    if (!business) {
      business = await prisma.business.create({ data: { name: "บริษัทตัวอย่าง จำกัด" } });
    }

    // Get or create a demo user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "demo@billscan.ai", name: "ผู้ดูแลระบบ" },
      });
      await prisma.businessUser.create({
        data: { userId: user.id, businessId: business.id, role: "admin" },
      });
    }

    const receipt = await prisma.receipt.create({
      data: {
        businessId: business.id,
        userId: user.id,
        vendorName: data.vendorName || null,
        vendorTaxId: data.vendorTaxId || null,
        vendorAddress: data.vendorAddress || null,
        receiptNumber: data.receiptNumber || null,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        type: data.type || "receipt",
        currency: data.currency || "THB",
        totalAmount: parseFloat(data.totalAmount) || 0,
        subtotal: parseFloat(data.subtotal) || 0,
        vat: parseFloat(data.vat) || 0,
        wht: parseFloat(data.wht) || 0,
        note: data.note || null,
        imageUrl: imageUrl || null,
        status: "pending",
        items: items && items.length > 0
          ? {
              create: items.map((item: any) => ({
                description: item.description,
                type: item.type || "service",
                quantity: parseFloat(item.quantity) || 1,
                unitPrice: parseFloat(item.unitPrice) || 0,
                amount: parseFloat(item.amount) || 0,
                category: item.category || null,
              })),
            }
          : undefined,
      },
    });

    // Auto-backup to Google Drive if configured and image exists
    if (isGoogleDriveConfigured() && imageUrl) {
      try {
        // imageUrl is base64 data URL
        const base64Match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (base64Match) {
          const mimeType = base64Match[1];
          const buffer = Buffer.from(base64Match[2], "base64");
          const ext = mimeType.includes("png") ? "png" : "jpg";
          const fileName = `${receipt.vendorName || "receipt"}_${receipt.id}.${ext}`;

          const driveResult = await uploadToGoogleDrive({ fileName, mimeType, fileBuffer: buffer });
          if (driveResult) {
            await prisma.receipt.update({
              where: { id: receipt.id },
              data: { driveFileId: driveResult.fileId },
            });
          }
        }
      } catch (driveError) {
        console.error("Google Drive backup failed (non-blocking):", driveError);
      }
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}
