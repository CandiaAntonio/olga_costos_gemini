import { unstable_noStore as noStore } from 'next/cache';
import { getLatestPrice } from './market-db';
import yahooFinance from 'yahoo-finance2';
import { prisma } from './db';

export interface MarketItem {
    symbol: string;
    name: string;
    price: number;
    prevClose: number;
    change: number;
    changePercent: number;
    currency: string;
}

export interface MarketData {
    gold: MarketItem;
    silver: MarketItem;
    usd: MarketItem;
    lastUpdated: string;
}

export async function getMarketData(): Promise<MarketData> {
    noStore();

    // 1. Try to get today's data from DB
    // We will check if we have data for 'XAU' today or very recent
    // If not, we try to fetch from Yahoo and save.

    await updateMarketDataIfNeeded();

    const [goldDb, silverDb, usdDb] = await Promise.all([
        getLatestPrice('XAU'),
        getLatestPrice('XAG'),
        getLatestPrice('USD')
    ]);

    // Fallback if DB is empty (should not happen after seed, but safety)
    const defaults = {
        price: 0,
        open: 0, // treating open as prevClose approx
        date: new Date()
    };

    const gold = goldDb || defaults;
    const silver = silverDb || defaults;
    const usd = usdDb || defaults;

    // Calculate change (Price - Open). 
    // Note: 'open' in Yahoo/DB is the day's open. 
    // 'prevClose' is ideally what we want for "Change from yesterday", but 'open' is a decent proxy for intraday change.
    // Or we could fetch yesterday's close. For now, let's use (price - open).

    // Helper to format
    const formatItem = (item: any, name: string, currency: string, symbol: string): MarketItem => {
        const price = item.price || 0;
        const prev = item.open || price; // fallback
        const change = price - prev;
        const pct = prev !== 0 ? (change / prev) * 100 : 0;

        return {
            symbol,
            name,
            price,
            prevClose: prev,
            change,
            changePercent: pct,
            currency
        };
    };

    return {
        gold: formatItem(gold, 'Oro (Gold)', 'USD', 'XAU'),
        silver: formatItem(silver, 'Plata (Silver)', 'USD', 'XAG'),
        usd: formatItem(usd, 'Dólar (USD)', 'COP', 'USD'),
        lastUpdated: new Date().toISOString()
    };
}

// Check if we need to fetch new data (e.g. if latest data is not from today/yesterday or strictly if we want real-time-ish)
// Since this is a dashboard, maybe we fetch fresh every time or cache for X minutes?
// Let's implement a simple check: if top record is older than 1 hour, fetch fresh.
async function updateMarketDataIfNeeded() {
    try {
        const lastRec = await prisma.marketPrice.findFirst({
            where: { symbol: 'XAU' },
            orderBy: { date: 'desc' }
        });

        const now = new Date();
        const needsUpdate = !lastRec || (now.getTime() - lastRec.createdAt.getTime() > 1000 * 60 * 60); // 1 hour

        if (needsUpdate) {
            console.log("Fetching fresh market data from Yahoo...");

            // Fetch Quote
            const [gold, silver, usd] = await Promise.all([
                yahooFinance.quote('GC=F'), // Gold
                yahooFinance.quote('SI=F'), // Silver
                yahooFinance.quote('COP=X') // USD/COP
            ]);

            const save = async (quote: any, dbSymbol: string, currency: string) => {
                if (!quote || !quote.regularMarketPrice) return;

                const date = quote.regularMarketTime || new Date();

                // We use upsert on regularMarketTime (or simple date) to avoid dups if run freq
                // But since Yahoo might return same time, we'll try upsert.
                // Actually our schema is unique on [symbol, date]. 
                // Yahoo dates are timestamps. We probably want to normalize to Day for history, but keep precise for latest?
                // The schema `date` is DateTime.
                // Let's just save.

                await prisma.marketPrice.upsert({
                    where: {
                        symbol_date: {
                            symbol: dbSymbol,
                            date: date
                        }
                    },
                    update: {
                        price: quote.regularMarketPrice,
                        open: quote.regularMarketOpen,
                        high: quote.regularMarketDayHigh,
                        low: quote.regularMarketDayLow,
                        close: quote.regularMarketPreviousClose, // Using prevClose as close? No, close is current for history.
                        // For TODAY, price is current.
                        createdAt: new Date()
                    },
                    create: {
                        symbol: dbSymbol,
                        date: date,
                        price: quote.regularMarketPrice,
                        currency: currency,
                        open: quote.regularMarketOpen,
                        high: quote.regularMarketDayHigh,
                        low: quote.regularMarketDayLow,
                        close: quote.regularMarketPreviousClose
                    }
                });
            };

            await Promise.all([
                save(gold, 'XAU', 'USD'),
                save(silver, 'XAG', 'USD'),
                save(usd, 'USD', 'COP')
            ]);
            console.log("Market data updated.");
        }
    } catch (e) {
        console.error("Error updating market data:", e);
    }
}
