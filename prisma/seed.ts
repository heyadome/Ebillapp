import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma/dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default admin user
  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" } });
  let admin;
  if (!existingAdmin) {
    admin = await prisma.user.create({
      data: {
        username: "admin",
        name: "ณราธร รัตนพงษ์",
        email: "admin@company.com",
        password: "1234",
        role: "admin",
        active: true,
      },
    });
    console.log("Created admin user:", admin.username);
  } else {
    admin = existingAdmin;
    console.log("Admin user already exists:", admin.username);
  }

  // Create default business
  let business = await prisma.business.findFirst();
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
    console.log("Created business:", business.name);
  }

  // Link admin to business
  const link = await prisma.businessUser.findFirst({ where: { userId: admin.id, businessId: business.id } });
  if (!link) {
    await prisma.businessUser.create({
      data: { userId: admin.id, businessId: business.id, role: "owner" },
    });
  }

  // Create sample regular user
  const existingUser = await prisma.user.findUnique({ where: { username: "user" } });
  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        username: "user",
        name: "สมชาย ใจดี",
        email: "user@company.com",
        password: "1234",
        role: "user",
        active: true,
      },
    });
    await prisma.businessUser.create({
      data: { userId: user.id, businessId: business.id, role: "member" },
    });
    console.log("Created regular user:", user.username);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
