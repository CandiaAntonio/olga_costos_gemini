import { unstable_noStore as noStore } from "next/cache";
import { getLatestPrice } from "./market-db";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();
import { prisma } from "./db";

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

export async function getMarketData(
  forceRefresh: boolean = false
): Promise<MarketData> {
  noStore();

  // 1. Try to get today's data from DB
  // We will check if we have data for 'XAU' today or very recent
  // If not, we try to fetch from Yahoo and save.

  await updateMarketDataIfNeeded(forceRefresh);

  const [goldDb, silverDb, usdDb] = await Promise.all([
    getLatestPrice("XAU"),
    getLatestPrice("XAG"),
    getLatestPrice("USD"),
  ]);

  // Fallback if DB is empty (should not happen after seed, but safety)
  const defaults = {
    price: 0,
    open: 0, // treating open as prevClose approx
    date: new Date(),
    createdAt: new Date(0), // Very old
  };

  const gold = goldDb || defaults;
  const silver = silverDb || defaults;
  const usd = usdDb || defaults;

  // Calculate change (Price - Open).
  // Note: 'open' in Yahoo/DB is the day's open.
  // 'prevClose' is ideally what we want for "Change from yesterday", but 'open' is a decent proxy for intraday change.
  // Or we could fetch yesterday's close. For now, let's use (price - open).

  // Helper to format
  const formatItem = (
    item: any,
    name: string,
    currency: string,
    symbol: string
  ): MarketItem => {
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
      currency,
    };
  };

  // Calculate latest update time from the data itself
  const timestamps = [
    gold["createdAt"] ? new Date(gold["createdAt"]).getTime() : 0,
    silver["createdAt"] ? new Date(silver["createdAt"]).getTime() : 0,
    usd["createdAt"] ? new Date(usd["createdAt"]).getTime() : 0,
  ];
  const maxTime = Math.max(...timestamps);
  const lastUpdated =
    maxTime > 0 ? new Date(maxTime).toISOString() : new Date().toISOString();

  return {
    gold: formatItem(gold, "Oro (Gold)", "USD", "XAU"),
    silver: formatItem(silver, "Plata (Silver)", "USD", "XAG"),
    usd: formatItem(usd, "Dólar (USD)", "COP", "USD"),
    lastUpdated,
  };
}

// Check if we need to fetch new data (e.g. if latest data is not from today/yesterday or strictly if we want real-time-ish)
// Since this is a dashboard, maybe we fetch fresh every time or cache for X minutes?
// Let's implement a simple check: if top record is older than 1 hour, fetch fresh.
// Check if we need to fetch new data (e.g. if latest data is not from today/yesterday or strictly if we want real-time-ish)
// Since this is a dashboard, maybe we fetch fresh every time or cache for X minutes?
// Let's implement a simple check: if top record is older than 1 hour, fetch fresh.
export async function updateMarketDataIfNeeded(force: boolean = false) {
  try {
    const lastRec = await prisma.marketPrice.findFirst({
      where: { symbol: "XAU" },
      orderBy: { date: "desc" },
    });

    const now = new Date();
    const needsUpdate =
      force ||
      !lastRec ||
      now.getTime() - lastRec.createdAt.getTime() > 1000 * 60 * 60; // 1 hour

    if (needsUpdate) {
      console.log(
        force
          ? "Forcing fresh market data..."
          : "Fetching fresh market data from Yahoo..."
      );

      // Fetch Quote
      const [gold, silver, usd] = await Promise.all([
        yahooFinance.quote("GC=F"), // Gold
        yahooFinance.quote("SI=F"), // Silver
        yahooFinance.quote("COP=X"), // USD/COP
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
              date: date,
            },
          },
          update: {
            price: quote.regularMarketPrice,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            close: quote.regularMarketPreviousClose, // Using prevClose as close? No, close is current for history.
            // For TODAY, price is current.
            createdAt: new Date(),
          },
          create: {
            symbol: dbSymbol,
            date: date,
            price: quote.regularMarketPrice,
            currency: currency,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            close: quote.regularMarketPreviousClose,
          },
        });
      };

      await Promise.all([
        save(gold, "XAU", "USD"),
        save(silver, "XAG", "USD"),
        save(usd, "USD", "COP"),
      ]);
      console.log("Market data updated.");
    }
  } catch (e) {
    console.error("Error updating market data:", e);
  }
}

export async function getMarketChanges(range: import("./market-db").TimeRange) {
  const { getMarketHistory } = await import("./market-db"); // Dynamic import to avoid circular dependency if any, strictly not needed but safe

  // Map internal keys to symbols
  const map = {
    gold: "XAU",
    silver: "XAG",
    usd: "USD",
  };

  const results: Record<string, { change: number; changePercent: number }> = {};

  await Promise.all(
    Object.entries(map).map(async ([key, symbol]) => {
      const history = await getMarketHistory(symbol, range);
      if (history && history.length > 0) {
        const startPrice = history[0].price;
        const endPrice = history[history.length - 1].price;

        const change = endPrice - startPrice;
        const changePercent =
          startPrice !== 0 ? (change / startPrice) * 100 : 0;

        results[key] = { change, changePercent };
      } else {
        results[key] = { change: 0, changePercent: 0 };
      }
    })
  );

  return results;
}
