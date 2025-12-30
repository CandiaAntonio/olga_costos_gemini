import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Metals...");

  // 1. Seed Market Prices
  // As per verify logic, we want to ensure prices exist
  const now = new Date();
  await prisma.marketPrice.upsert({
    where: { symbol_date: { symbol: "XAU", date: now } },
    update: {},
    create: {
      symbol: "XAU",
      date: now,
      price: 2000, // USD per oz approx
      currency: "USD",
    },
  });

  await prisma.marketPrice.upsert({
    where: { symbol_date: { symbol: "XAG", date: now } },
    update: {},
    create: {
      symbol: "XAG",
      date: now,
      price: 28, // USD per oz approx
      currency: "USD",
    },
  });

  await prisma.marketPrice.upsert({
    where: { symbol_date: { symbol: "USD", date: now } },
    update: {},
    create: {
      symbol: "USD",
      date: now,
      price: 4000, // COP
      currency: "COP",
    },
  });

  // 2. Seed Metal Lots
  await prisma.compraMetal.createMany({
    data: [
      {
        metalType: "GOLD",
        gramsPurchased: 100,
        gramsRemaining: 85,
        pricePerGramCOP: 245000,
        purchaseDate: new Date("2024-12-01"),
        provider: "Miners CO",
      },
      {
        metalType: "SILVER",
        gramsPurchased: 500,
        gramsRemaining: 420,
        pricePerGramCOP: 3200,
        purchaseDate: new Date("2024-12-05"),
        provider: "Silver Corp",
      },
      {
        metalType: "GOLD",
        gramsPurchased: 50,
        gramsRemaining: 50,
        pricePerGramCOP: 248000,
        purchaseDate: new Date("2024-12-10"),
        provider: "Miners CO",
      },
    ],
  });

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
