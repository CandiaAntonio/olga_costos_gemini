"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateStoneStock(
  id: string,
  type: "LOT" | "UNIQUE",
  newStock: number
) {
  try {
    if (type === "LOT") {
      await prisma.tipoPiedra.update({
        where: { id },
        data: { stockActual: newStock },
      });
      revalidatePath("/inventario/piedras");
      return { success: true };
    }
    // No-op for UNIQUE as they don't have stock management in this view usually
    return { success: true };
  } catch (error) {
    console.error("Error updating stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

export async function updateStonePrice(
  id: string,
  type: "LOT" | "UNIQUE",
  newPrice: number
) {
  try {
    if (type === "LOT") {
      await prisma.tipoPiedra.update({
        where: { id },
        data: { precioCop: newPrice },
      });
    } else {
      await prisma.piedraIndividual.update({
        where: { id },
        data: { costo: newPrice },
      });
    }
    revalidatePath("/inventario/piedras");
    return { success: true };
  } catch (error) {
    console.error("Error updating price:", error);
    return { success: false, error: "Failed to update price" };
  }
}

export async function deleteStone(id: string, type: "LOT" | "UNIQUE") {
  try {
    if (type === "LOT") {
      await prisma.tipoPiedra.update({
        where: { id },
        data: { activo: false },
      });
    } else {
      await prisma.piedraIndividual.update({
        where: { id },
        data: { estado: "retirado" },
      });
    }
    revalidatePath("/inventario/piedras");
    return { success: true };
  } catch (error) {
    console.error("Error deleting stone:", error);
    return { success: false, error: "Failed to delete stone" };
  }
}

export async function getStoneHistory(id: string) {
  try {
    const history = await prisma.stockMovement.findMany({
      where: { tipoPiedraId: id },
      orderBy: { creadoEn: "desc" },
      take: 10,
    });
    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching stone history:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}
