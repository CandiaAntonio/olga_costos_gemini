import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getMarketData } from "@/lib/market-service";
import {
  MetalLot,
  calculateReplacementValue,
} from "@/lib/calculations/fifo-engine";

export const dynamic = "force-dynamic"; // Ensure we get fresh data

export default async function MetalesPage() {
  // 1. Fetch Inventory
  const rawInventory = await prisma.compraMetal.findMany({
    orderBy: { purchaseDate: "desc" },
  });

  // 2. Fetch Market Data
  const marketData = await getMarketData();
  const goldPrice = marketData.gold.price; // USD
  const silverPrice = marketData.silver.price; // USD
  const copUsd = marketData.usd.price; // COP

  // Market Prices in COP (approximate for display/calc if needed,
  // though usually we store/calc in COP or convert.
  // Assuming marketData.gold.price is USD per Ounce? Or Gram?
  // Yahoo XAU is per Ounce usually. Need to ensure conversion.
  // Standard conversion: 1 Troy Ounce = 31.1035 grams.
  // Let's assume the helper handles this or we need to do it.
  // Actually, usually XAU is USD/oz.

  const TROY_OZ_G = 31.1034768;
  const goldPriceCOPperGram = (goldPrice * copUsd) / TROY_OZ_G;
  const silverPriceCOPperGram = (silverPrice * copUsd) / TROY_OZ_G;

  // 3. Process Inventory
  const inventory: MetalLot[] = rawInventory.map((item) => ({
    id: item.id,
    metalType: item.metalType,
    gramsRemaining: item.gramsRemaining,
    pricePerGramCOP: item.pricePerGramCOP,
  }));

  const goldLots = inventory.filter((x) => x.metalType === "GOLD");
  const silverLots = inventory.filter((x) => x.metalType === "SILVER");

  const goldTotalGrams = goldLots.reduce(
    (acc, curr) => acc + curr.gramsRemaining,
    0
  );
  const silverTotalGrams = silverLots.reduce(
    (acc, curr) => acc + curr.gramsRemaining,
    0
  );

  // Goal 2: Total Value (Replacement Value implies Market Price * Holdings,
  // but "Saldo Actual" usually refers to Accounting Value (Cost).
  // The User Goal 2 says: "Total Value... fluctuates when MarketPrice updates".
  // This implies REPLACEMENT VALUE (Mark-to-Market).
  const goldTotalValue = calculateReplacementValue(
    goldLots,
    goldPriceCOPperGram
  );
  const silverTotalValue = calculateReplacementValue(
    silverLots,
    silverPriceCOPperGram
  );

  return (
    <div className="space-y-8 pb-12 bg-[#FAFAFA] min-h-screen font-sans">
      {/* Header */}
      <div className="relative border-b border-gray-100 pb-6 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-lebedeva-black mb-2">
              Tesorería de Metales
            </h1>
            <p className="text-gray-400 font-technical font-light">
              Gestión de inventario de oro y plata
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              size="sm"
              className="bg-lebedeva-black hover:bg-lebedeva-gold text-white rounded-none uppercase tracking-widest text-[10px] font-serif shadow-md hover:shadow-lg h-9 px-3 transition-all"
            >
              <Plus className="h-3 w-3 mr-2" />
              Registrar Compra de Metal
            </Button>
          </div>
        </div>
      </div>

      {/* Treasury Tiles (Goal 1 & 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gold Tile */}
        <div
          className="relative overflow-hidden rounded-none p-8 font-serif text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #b8860b 0%, #daa520 100%)",
          }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl tracking-widest mb-4 opacity-90">ORO</h2>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-75 mb-1 font-sans">
                  Total Grams
                </p>
                <p className="text-4xl">
                  {goldTotalGrams.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  g
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest opacity-75 mb-1 font-sans">
                  Total Value (Mkt)
                </p>
                <p className="text-2xl">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  }).format(goldTotalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Silver Tile */}
        <div
          className="relative overflow-hidden rounded-none p-8 font-serif text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #94A3B8 0%, #475569 100%)",
          }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl tracking-widest mb-4 opacity-90">PLATA</h2>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-75 mb-1 font-sans">
                  Total Grams
                </p>
                <p className="text-4xl">
                  {silverTotalGrams.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  g
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest opacity-75 mb-1 font-sans">
                  Total Value (Mkt)
                </p>
                <p className="text-2xl">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  }).format(silverTotalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Ledger (Goal 2 & 3) */}
      <div className="space-y-4">
        <h3 className="text-2xl font-serif text-lebedeva-black">
          Historial de Compras
        </h3>
        <div className="w-full bg-white border-[0.5px] border-[#F3F4F6] shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-[0.5px] border-[#F3F4F6] text-xl text-gray-500 font-serif font-normal tracking-widest">
                <th className="py-6 px-4 font-normal">ID</th>
                <th className="py-6 px-4 font-normal">Fecha</th>
                <th className="py-6 px-4 font-normal">Metal</th>
                <th className="py-6 px-4 font-normal text-right">
                  Gramos Iniciales
                </th>
                <th className="py-6 px-4 font-normal text-right">
                  Saldo Actual
                </th>
                <th className="py-6 px-4 font-normal text-right">
                  Precio Compra
                </th>
                <th className="py-6 px-4 font-normal text-right">
                  Valor Total
                </th>
              </tr>
            </thead>
            <tbody>
              {rawInventory.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b-[0.5px] border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors"
                >
                  <td className="py-6 px-4 text-sm font-technical font-light text-gray-600">
                    {entry.id}
                  </td>
                  <td className="py-6 px-4 text-sm font-technical font-light">
                    {entry.purchaseDate.toLocaleDateString("es-CO")}
                  </td>
                  <td className="py-6 px-4 text-sm font-serif">
                    {entry.metalType === "GOLD" ? "ORO" : "PLATA"}
                  </td>
                  <td className="py-6 px-4 text-sm font-technical font-light text-right">
                    {entry.gramsPurchased.toLocaleString("es-CO")}g
                  </td>
                  <td className="py-6 px-4 text-sm font-technical text-right font-medium text-lebedeva-black">
                    {entry.gramsRemaining.toLocaleString("es-CO")}g
                  </td>
                  <td className="py-6 px-4 text-sm font-technical font-light text-right">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(entry.pricePerGramCOP)}
                  </td>
                  <td className="py-6 px-4 text-sm font-technical font-light text-right">
                    {
                      /* Assuming "Valor Total" here is the Historical Purchase Cost? Or Current Value? 
                         "Historial de Compras" implies Cost at purchase. 
                         So gramsPurchased * pricePerGramCOP 
                      */
                      new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      }).format(entry.gramsPurchased * entry.pricePerGramCOP)
                    }
                  </td>
                </tr>
              ))}
              {rawInventory.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 font-light"
                  >
                    No hay registros de inventario. Use el botón "Registrar
                    Compra" o inserte datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
