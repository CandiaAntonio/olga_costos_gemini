import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clean() {
  await prisma.compraMetal.deleteMany({});
  console.log("🧹 Metals cleaned.");
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
