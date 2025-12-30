import { PrismaClient } from "@prisma/client";
import { getMarketData } from "../src/lib/market-service";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing Market Data Fetching...");
  try {
    const data = await getMarketData(true); // Force refresh
    console.log("Market Data Result:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error fetching market data:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
