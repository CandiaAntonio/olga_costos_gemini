'use client';

import { MarketCard } from '@/components/market/MarketCard';
import { MarketHistoryChart } from '@/components/market/MarketHistoryChart';
import { MarketData, MarketItem } from '@/lib/market-service';
import { TimeRange } from '@/lib/market-db';
import { fetchMarketChanges } from '@/app/actions/market-actions';
import { useEffect, useState } from 'react';

interface MarketDashboardClientProps {
    data: MarketData;
}

export function MarketDashboardClient({ data }: MarketDashboardClientProps) {
    const [selectedItem, setSelectedItem] = useState<MarketItem>(data.gold);
    const [hoveredData, setHoveredData] = useState<{ price: number; change: number; changePercent: number; date: Date } | null>(null);
    const [range, setRange] = useState<TimeRange>('1Y');

    // Local state for items that can be updated when range changes
    // We initialize with server data which is 1D (or whatever server provides, currently 1D logic in service)
    // Wait, the requirement says "The main tiles... be connected to the historical chart".
    // If we default to 1Y in chart, we should update these immediately or default to 1Y?
    // User plan said: "I will settle for client-side effect for now to keep it simple".
    const [currentItems, setCurrentItems] = useState({
        gold: data.gold,
        silver: data.silver,
        usd: data.usd
    });

    useEffect(() => {
        let active = true;
        async function updateChanges() {
            try {
                const changes = await fetchMarketChanges(range);
                if (!active) return;

                setCurrentItems(prev => ({
                    gold: { ...prev.gold, ...changes.gold },
                    silver: { ...prev.silver, ...changes.silver },
                    usd: { ...prev.usd, ...changes.usd }
                }));
            } catch (error) {
                console.error("Failed to update market changes", error);
            }
        }
        updateChanges();
        return () => { active = false; };
    }, [range]);

    const items = [currentItems.gold, currentItems.silver, currentItems.usd];

    // Helper to get display item (either real data or hovered data if selected)
    const getDisplayItem = (item: MarketItem) => {
        if (item.symbol === selectedItem.symbol && hoveredData) {
            return {
                ...item,
                price: hoveredData.price,
                change: hoveredData.change,
                changePercent: hoveredData.changePercent
            };
        }
        return item;
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {items.map((item) => (
                    <div
                        key={item.symbol}
                        className="cursor-pointer"
                    >
                        <MarketCard
                            item={getDisplayItem(item)}
                            isSelected={selectedItem.symbol === item.symbol}
                            onClick={() => setSelectedItem(item)}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <MarketHistoryChart
                    initialItem={data.gold}
                    selectedItem={selectedItem}
                    onHover={setHoveredData}
                    range={range}
                    onRangeChange={setRange}
                />
            </div>


        </div>
    );
}
