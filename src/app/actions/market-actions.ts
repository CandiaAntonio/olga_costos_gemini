'use server';

import { getMarketHistory, TimeRange } from '@/lib/market-db';

export async function fetchHistory(symbol: string, range: TimeRange) {
    return await getMarketHistory(symbol, range);
}
