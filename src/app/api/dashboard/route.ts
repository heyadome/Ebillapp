import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get or create a default business for demo
    let business = await prisma.business.findFirst();
    if (!business) {
      // Create demo data
      business = await prisma.business.create({
        data: { name: "บริษัทตัวอย่าง จำกัด" },
      });
    }

    const [monthReceipts, yearReceipts, pending, recent] = await Promise.all([
      prisma.receipt.aggregate({
        where: { businessId: business.id, createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.receipt.aggregate({
        where: { businessId: business.id, createdAt: { gte: startOfYear } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.receipt.count({
        where: { businessId: business.id, status: "pending" },
      }),
      prisma.receipt.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, vendorName: true, totalAmount: true, currency: true,
          status: true, issueDate: true, createdAt: true, type: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        thisMonth: {
          count: monthReceipts._count,
          total: monthReceipts._sum.totalAmount || 0,
        },
        thisYear: {
          count: yearReceipts._count,
          total: yearReceipts._sum.totalAmount || 0,
        },
        pending,
        missing: 3, // demo
      },
      recent,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      stats: { thisMonth: { count: 0, total: 0 }, thisYear: { count: 0, total: 0 }, pending: 0, missing: 0 },
      recent: [],
    });
  }
}
