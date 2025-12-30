import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedMarket() {
  console.log("📈 Seeding initial market data...");

  const marketData = [
    {
      symbol: "XAU",
      price: 2600.5, // Approx
      currency: "USD",
      name: "Oro (Gold)",
    },
    {
      symbol: "XAG",
      price: 31.2, // Approx
      currency: "USD",
      name: "Plata (Silver)",
    },
    {
      symbol: "USD",
      price: 4350.0, // Approx
      currency: "COP",
      name: "Dólar (USD)",
    },
  ];

  for (const item of marketData) {
    // Create an entry for today (or recent) if not exists
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Normalize to day start

    await prisma.marketPrice.upsert({
      where: {
        symbol_date: {
          symbol: item.symbol,
          date: date,
        },
      },
      update: {}, // Don't change if exists
      create: {
        symbol: item.symbol,
        date: date,
        price: item.price,
        currency: item.currency,
        open: item.price,
        high: item.price * 1.01,
        low: item.price * 0.99,
        close: item.price,
      },
    });
  }
  console.log("  ✅ Initial market data seeded");
}

// Function to calculate some history (past 30 days) to make chart look nice
export async function seedHistory() {
  console.log("  📊 Seeding market history (30 days)...");

  const symbols = [
    { s: "XAU", base: 2600, vol: 20 },
    { s: "XAG", base: 31, vol: 0.5 },
    { s: "USD", base: 4350, vol: 50 },
  ];

  const days = 30;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    for (const { s, base, vol } of symbols) {
      // Random walk
      const noise = (Math.random() - 0.5) * vol * 2;
      // Trend: slightly up
      const trend = (days - i) * (vol * 0.1);
      const price = base + trend + noise;

      await prisma.marketPrice.upsert({
        where: {
          symbol_date: { symbol: s, date },
        },
        update: {},
        create: {
          symbol: s,
          date,
          price,
          currency: s === "USD" ? "COP" : "USD",
          open: price,
          high: price,
          low: price,
          close: price,
        },
      });
    }
  }
}
