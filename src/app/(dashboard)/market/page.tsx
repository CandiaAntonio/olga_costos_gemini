import { getMarketData } from "@/lib/market-service";
import { MarketDashboardClient } from "@/components/market/MarketDashboardClient";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function MarketPage() {
  const data = await getMarketData();

  async function refresh() {
    "use server";
    await getMarketData(true);
    revalidatePath("/market");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-serif font-medium tracking-widest text-lebedeva-black">
          Mercado
        </h2>
        <div className="flex items-center space-x-2">
          <form action={refresh}>
            <Button
              size="sm"
              variant="outline"
              className="rounded-none border-stone-200 font-serif tracking-width hover:bg-stone-50 hover:text-lebedeva-gold"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </form>
        </div>
      </div>

      <MarketDashboardClient data={data} />

      <div className="text-sm text-muted-foreground mt-4">
        Última actualización: {new Date(data.lastUpdated).toLocaleString()}
        <br />
        Fuentes: Yahoo Finance (Datos históricos y en tiempo real).
      </div>
    </div>
  );
}
