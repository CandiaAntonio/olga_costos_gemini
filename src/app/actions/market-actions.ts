'use server';

import { getMarketHistory, TimeRange } from '@/lib/market-db';
import { getMarketChanges } from '@/lib/market-service';

export async function fetchHistory(symbol: string, range: TimeRange) {
    return await getMarketHistory(symbol, range);
}

export async function fetchMarketChanges(range: TimeRange) {
    return await getMarketChanges(range);
}
