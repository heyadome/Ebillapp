import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const receipt = await prisma.receipt.update({
      where: { id },
      data: { status: "approved" },
    });
    return NextResponse.json(receipt);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
