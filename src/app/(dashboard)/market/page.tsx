import { getMarketData } from '@/lib/market-service';
import { MarketCard } from '@/components/market/MarketCard';
import { MarketHistoryChart } from '@/components/market/MarketHistoryChart';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { revalidatePath } from 'next/cache';

export default async function MarketPage() {
    const data = await getMarketData();

    async function refresh() {
        'use server';
        revalidatePath('/market');
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Información de Mercado</h2>
                <div className="flex items-center space-x-2">
                    <form action={refresh}>
                        <Button size="sm" variant="outline">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <MarketCard item={data.gold} />
                <MarketCard item={data.silver} />
                <MarketCard item={data.usd} />
            </div>

            <div className="mt-6">
                <MarketHistoryChart
                    initialItem={data.gold}
                    allItems={[data.gold, data.silver, data.usd]}
                />
            </div>

            <div className="text-sm text-muted-foreground mt-4">
                Última actualización: {new Date(data.lastUpdated).toLocaleString()}
                <br />
                Fuentes: Yahoo Finance (Datos históricos y en tiempo real).
            </div>
        </div>
    );
}
