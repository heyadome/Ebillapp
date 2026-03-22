import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Get business data (first business for now)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let business = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
  });

  // Auto-create default business if none exists
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: "บริษัทตัวอย่าง จำกัด",
        taxId: "0000000000000",
        address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
        phone: "02-000-0000",
        email: "info@company.com",
      },
    });
    // Link user to business
    await prisma.businessUser.create({
      data: { userId: user.id, businessId: business.id, role: "owner" },
    });
  }

  return NextResponse.json({ business });
}

// Update business data
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const business = await prisma.business.findFirst({ orderBy: { createdAt: "asc" } });

  if (!business) {
    return NextResponse.json({ error: "ไม่พบข้อมูลธุรกิจ" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.taxId !== undefined) data.taxId = body.taxId;
  if (body.address !== undefined) data.address = body.address;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.email !== undefined) data.email = body.email;
  if (body.logo !== undefined) data.logo = body.logo;
  if (body.signature !== undefined) data.signature = body.signature;

  const updated = await prisma.business.update({
    where: { id: business.id },
    data,
  });

  return NextResponse.json({ business: updated });
}
