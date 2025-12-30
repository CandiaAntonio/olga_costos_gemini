import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkData() {
  console.log("--- Checking Market Data ---");

  const gold = await prisma.marketPrice.findFirst({
    where: { symbol: "XAU" },
    orderBy: { date: "desc" },
  });

  const silver = await prisma.marketPrice.findFirst({
    where: { symbol: "XAG" },
    orderBy: { date: "desc" },
  });

  const usd = await prisma.marketPrice.findFirst({
    where: { symbol: "USD" },
    orderBy: { date: "desc" },
  });

  const config = await prisma.configuracionGlobal.findFirst();

  console.log("Gold (XAU):", gold?.price, gold?.date);
  console.log("Silver (XAG):", silver?.price, silver?.date);
  console.log("USD (COP):", usd?.price, usd?.date);
  console.log("Config Global USD:", config?.tipoCambio);
}

checkData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
