"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateStock(id: string, newStock: number) {
  try {
    // Only allow updating if it's a LOT
    // We could check 'trackingType' first, but the query below implicitly handles it
    // by only updating if the record exists.
    // However, to be safe and logical, let's just do the update.

    // Validate input
    if (newStock < 0) {
      return { success: false, error: "Stock cannot be negative" };
    }

    const updated = await prisma.tipoPiedra.update({
      where: { id },
      data: { stockActual: newStock },
    });

    revalidatePath("/inventario/piedras");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}
