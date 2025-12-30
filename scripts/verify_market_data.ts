import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifying Market Data Integrity...");

  const symbols = ["XAU", "XAG", "USD"];

  for (const symbol of symbols) {
    console.log(`\nChecking symbol: ${symbol}`);

    // Count records
    const count = await prisma.marketPrice.count({
      where: { symbol },
    });
    console.log(`  - Total Records: ${count}`);

    if (count === 0) {
      console.error(`  ❌ No data found for ${symbol}!`);
      continue;
    }

    // Check date range
    const oldest = await prisma.marketPrice.findFirst({
      where: { symbol },
      orderBy: { date: "asc" },
    });
    const newest = await prisma.marketPrice.findFirst({
      where: { symbol },
      orderBy: { date: "desc" },
    });

    console.log(
      `  - Date Range: ${oldest?.date.toISOString().split("T")[0]} to ${
        newest?.date.toISOString().split("T")[0]
      }`
    );

    // Check for duplicates
    // We can't easily do a "group by date having count > 1" in purely prisma generic without aggregate raw or manual check
    // But we trust the schema unique constraint (symbol_date) generally, but let's just inspect sample prices.

    // key check: Realism
    // If it was seed data, it might be very round numbers or weird randomness.
    // Real data usually has specific precision.
    console.log(`  - Latest Price: ${newest?.price} ${newest?.currency}`);
    console.log(`  - Oldest Price: ${oldest?.price} ${oldest?.currency}`);

    // Check if we have roughly 250 records (trading days) or 365?
    // Yahoo returns trading days usually ~252/year.
    if (count < 200) {
      console.warn(
        `  ⚠️ Warning: Record count ${count} seems low for 1 year of data.`
      );
    } else {
      console.log(`  ✅ Record count looks like a full trading year.`);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
