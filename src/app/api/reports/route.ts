import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    let business = await prisma.business.findFirst();
    if (!business) {
      return NextResponse.json({ monthly: [], categories: [] });
    }

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const receipts = await prisma.receipt.findMany({
      where: {
        businessId: business.id,
        createdAt: { gte: startOfYear, lt: endOfYear },
      },
      select: {
        totalAmount: true,
        createdAt: true,
        items: { select: { category: true, amount: true } },
      },
    });

    // Group by month
    const monthlyMap: Record<string, { count: number; total: number }> = {};
    for (let i = 1; i <= 12; i++) {
      monthlyMap[String(i).padStart(2, "0")] = { count: 0, total: 0 };
    }

    for (const r of receipts) {
      const month = String(r.createdAt.getMonth() + 1).padStart(2, "0");
      monthlyMap[month].count += 1;
      monthlyMap[month].total += r.totalAmount;
    }

    const monthly = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

    // Group by category
    const catMap: Record<string, { total: number; count: number }> = {};
    for (const r of receipts) {
      for (const item of r.items) {
        const cat = item.category || "อื่นๆ";
        if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
        catMap[cat].total += item.amount;
        catMap[cat].count += 1;
      }
    }

    const categories = Object.entries(catMap)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ monthly, categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ monthly: [], categories: [] });
  }
}
