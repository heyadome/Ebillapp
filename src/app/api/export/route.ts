import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "xlsx";
    const year = searchParams.get("year");

    let business = await prisma.business.findFirst();
    if (!business) {
      return new NextResponse("No business found", { status: 404 });
    }

    const where: any = { businessId: business.id };
    if (year) {
      where.createdAt = {
        gte: new Date(parseInt(year), 0, 1),
        lt: new Date(parseInt(year) + 1, 0, 1),
      };
    }

    const receipts = await prisma.receipt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    if (format === "xlsx") {
      const rows = receipts.map((r) => ({
        "วันที่": r.issueDate ? new Date(r.issueDate).toLocaleDateString("th-TH") : new Date(r.createdAt).toLocaleDateString("th-TH"),
        "ผู้ขาย": r.vendorName || "",
        "เลขที่เอกสาร": r.receiptNumber || "",
        "เลขประจำตัวผู้เสียภาษี": r.vendorTaxId || "",
        "ประเภท": r.type === "invoice" ? "ใบกำกับภาษี" : r.type === "voucher" ? "ใบรับรองแทน" : "ใบเสร็จ",
        "ยอดก่อนภาษี": r.subtotal,
        "VAT 7%": r.vat,
        "หัก ณ ที่จ่าย": r.wht,
        "ยอดรวม": r.totalAmount,
        "สกุลเงิน": r.currency,
        "สถานะ": r.status === "approved" ? "อนุมัติ" : "รอดำเนินการ",
        "หมายเหตุ": r.note || "",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();

      // Set column widths
      ws["!cols"] = [
        { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 18 },
        { wch: 15 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
        { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 30 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "ใบเสร็จ");

      // Monthly summary sheet
      const monthlyRows: any[] = [];
      for (let m = 1; m <= 12; m++) {
        const monthReceipts = receipts.filter((r) => {
          const date = r.issueDate || r.createdAt;
          return new Date(date).getMonth() + 1 === m;
        });
        const total = monthReceipts.reduce((s, r) => s + r.totalAmount, 0);
        const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        monthlyRows.push({
          "เดือน": MONTHS[m - 1],
          "จำนวนใบเสร็จ": monthReceipts.length,
          "ยอดก่อนภาษี": total / 1.07,
          "VAT 7%": total - total / 1.07,
          "ยอดรวม": total,
        });
      }
      const wsSummary = XLSX.utils.json_to_sheet(monthlyRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "สรุปรายเดือน");

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="receipts-${year || "all"}.xlsx"`,
        },
      });
    }

    return new NextResponse("Format not supported", { status: 400 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Export failed", { status: 500 });
  }
}
