'use client';

import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMarketHistory, TimeRange } from '@/lib/market-db';
import { MarketItem } from '@/lib/market-service';

interface MarketHistoryChartProps {
    initialItem: MarketItem;
    allItems: MarketItem[];
}

export function MarketHistoryChart({ initialItem, allItems }: MarketHistoryChartProps) {
    const [selectedItem, setSelectedItem] = useState<MarketItem>(initialItem);
    const [range, setRange] = useState<TimeRange>('1Y');
    const [data, setData] = useState<{ date: Date; price: number }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSelectedItem(initialItem);
    }, [initialItem]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Since this component is client-side, we need a server action or API route.
                // But wait, getMarketHistory is a server function (uses prisma).
                // We cannot import it directly in 'use client' if it's not a Server Action.
                // Let's assume we need to pass a server action or use an API.
                // For simplicity in this stack, let's create a server action in a separate file or inline if configured.
                // Actually, let's just make getMarketHistory a server action?
                // Or better, fetch from an API route.
                // But simpler: just pass the data? No, it's interactive.

                // We will use a server action wrapper.
                const history = await fetchHistory(selectedItem.symbol, range);
                setData(history);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedItem, range]);

    // Formatters
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: selectedItem.currency
        }).format(price);
    };

    return (
        <Card className="col-span-full">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-medium">
                        Histórico - {selectedItem.name}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        {selectedItem.symbol} • {range}
                    </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                    {(['1D', '5D', '1M', '6M', '1Y', '5Y'] as TimeRange[]).map((r) => (
                        <Button
                            key={r}
                            variant={range === r ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRange(r)}
                            className="text-xs"
                        >
                            {r}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            Cargando...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    minTickGap={30}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tickFormatter={(val) => val.toLocaleString()}
                                    domain={['auto', 'auto']}
                                    tick={{ fontSize: 12 }}
                                    width={60}
                                />
                                <Tooltip
                                    formatter={(value: number) => [formatPrice(value), 'Precio']}
                                    labelFormatter={(label) => formatDate(new Date(label))}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                    {allItems.map((item) => (
                        <div
                            key={item.symbol}
                            onClick={() => setSelectedItem(item)}
                            className={`cursor-pointer rounded-lg border p-3 min-w-[140px] transition-colors ${selectedItem.symbol === item.symbol
                                    ? 'bg-muted border-primary/50'
                                    : 'hover:bg-muted/50'
                                }`}
                        >
                            <div className="text-xs text-muted-foreground font-medium mb-1">{item.symbol}</div>
                            <div className="text-lg font-bold font-mono">
                                {item.currency === 'USD' ? '$' : ''}{item.price.toFixed(2)}
                            </div>
                            <div className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Helper Server Action (We need to define this elsewhere usually, but for now passing it assumes it's available)
import { fetchHistory } from '@/app/actions/market-actions';
