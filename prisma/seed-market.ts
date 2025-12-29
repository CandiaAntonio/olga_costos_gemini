import { PrismaClient } from '@prisma/client';
// @ts-ignore
const yahooFinance = require('yahoo-finance2').default;

const prisma = new PrismaClient();

const SYMBOLS = [
    { yahoo: 'GC=F', db: 'XAU', currency: 'USD' }, // Gold Futures
    { yahoo: 'SI=F', db: 'XAG', currency: 'USD' }, // Silver Futures
    { yahoo: 'COP=X', db: 'USD', currency: 'COP' }  // USD to COP
];

async function seedMarketData() {
    console.log('Starting market data seed...');

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5); // 5 Years history
    const queryOptions = { period1: startDate.toISOString() }; // Yahoo query options

    for (const item of SYMBOLS) {
        console.log(`Fetching data for ${item.db} (${item.yahoo})...`);
        try {
            const result = await yahooFinance.historical(item.yahoo, queryOptions);

            console.log(`Found ${result.length} records for ${item.db}. Saving to DB...`);

            let count = 0;
            for (const quote of result) {
                if (!quote.close) continue;

                await prisma.marketPrice.upsert({
                    where: {
                        symbol_date: {
                            symbol: item.db,
                            date: quote.date
                        }
                    },
                    update: {
                        price: quote.close,
                        open: quote.open || null,
                        high: quote.high || null,
                        low: quote.low || null,
                        close: quote.close || null,
                    },
                    create: {
                        symbol: item.db,
                        date: quote.date,
                        price: quote.close,
                        currency: item.currency,
                        open: quote.open || null,
                        high: quote.high || null,
                        low: quote.low || null,
                        close: quote.close || null,
                    }
                });
                count++;
            }
            console.log(`Saved ${count} records for ${item.db}.`);

        } catch (error) {
            console.error(`Error fetching/saving ${item.db}:`, error);
        }
    }

    console.log('Market data seeding complete.');
}

seedMarketData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
