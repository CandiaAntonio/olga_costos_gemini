'use client';

import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeRange } from '@/lib/market-db';
import { MarketItem } from '@/lib/market-service';
// Helper Server Action
import { fetchHistory } from '@/app/actions/market-actions';

interface MarketHistoryChartProps {
    initialItem: MarketItem;
    selectedItem: MarketItem;
    onHover?: (data: { price: number; change: number; changePercent: number; date: Date } | null) => void;
    range: TimeRange;
    onRangeChange: (range: TimeRange) => void;
}

export function MarketHistoryChart({ initialItem, selectedItem, onHover, range, onRangeChange }: MarketHistoryChartProps) {
    const [data, setData] = useState<{ date: Date; price: number }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
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

    const handleMouseMove = (props: any) => {
        if (!onHover || !props.activePayload || !props.activePayload[0]) {
            return;
        }

        const currentData = props.activePayload[0].payload;
        const currentIndex = data.findIndex(d => d.date === currentData.date);

        let change = 0;
        let changePercent = 0;

        if (currentIndex > 0) {
            const prevData = data[currentIndex - 1];
            change = currentData.price - prevData.price;
            changePercent = (change / prevData.price) * 100;
        }

        onHover({
            price: currentData.price,
            change: change,
            changePercent: changePercent,
            date: currentData.date
        });
    };

    const handleMouseLeave = () => {
        if (onHover) {
            onHover(null);
        }
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
                            onClick={() => onRangeChange(r)}
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
                            <AreaChart
                                data={data}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
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
                                    domain={['dataMin', 'dataMax']}
                                    scale="linear"
                                    tick={{ fontSize: 12 }}
                                    width={60}
                                />
                                <Tooltip
                                    formatter={(value: any) => [formatPrice(Number(value)), 'Precio']}
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
            </CardContent>
        </Card>
    );
}
