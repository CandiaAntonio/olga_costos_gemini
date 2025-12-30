import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedMetals() {
  console.log("🪙 Seeding Metals Inventory...");

  // Initial Silver Seed: 500g @ 3800 COP/g
  const initialSilver = await prisma.compraMetal.create({
    data: {
      metalType: "SILVER",
      gramsPurchased: 500,
      gramsRemaining: 500,
      pricePerGramCOP: 3800,
      purchaseDate: new Date(),
      provider: "Initial Seed",
    },
  });

  console.log(
    `  ✅ Created initial Silver stock: ${initialSilver.gramsPurchased}g @ $${initialSilver.pricePerGramCOP}/g`
  );
}

// Execute if run directly
if (require.main === module) {
  seedMetals()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
