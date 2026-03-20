import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillScan AI — จัดการค่าใช้จ่ายด้วย AI",
  description: "ระบบจัดการใบเสร็จและค่าใช้จ่ายบริษัทด้วย AI อัตโนมัติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <body className="h-full flex items-center justify-center">{children}</body>
    </html>
  );
}
