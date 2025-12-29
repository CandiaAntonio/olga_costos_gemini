'use client';

import { MarketItem } from '@/lib/market-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

interface MarketCardProps {
    item: MarketItem;
    onClick?: () => void;
    isSelected?: boolean;
}

export function MarketCard({ item, onClick, isSelected }: MarketCardProps) {
    const isPositive = item.change > 0;
    const isNegative = item.change < 0;
    const isNeutral = item.change === 0;

    // Determine unit label
    let unitLabel = '';
    if (item.symbol === 'XAU' || item.symbol === 'XAG') {
        unitLabel = 'USD/oz';
    } else if (item.symbol === 'USD') {
        unitLabel = 'COP';
    }

    // Determine locale for formatting
    const locale = item.currency === 'COP' ? 'es-CO' : 'en-US';

    return (
        <Card
            className={`overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-pointer text-left w-full
                ${isSelected ? 'ring-2 ring-primary border-primary bg-accent/5' : 'hover:bg-accent/50'}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            aria-selected={isSelected}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-3 bg-muted/50">
                <CardTitle className="text-sm font-medium uppercase tracking-wide">
                    {item.name}
                </CardTitle>
                <div className="text-sm font-medium text-gray-600">{unitLabel}</div>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-2">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold font-mono tracking-tight">
                            {new Intl.NumberFormat(locale, {
                                style: 'currency',
                                currency: item.currency,
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(item.price)}
                        </div>
                        <div className="flex items-center space-x-2 text-xs mt-0.5">
                            <span className={`font-mono text-sm font-medium flex items-center ${isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-gray-600'}`}>
                                {isPositive && <ArrowUpIcon className="h-4 w-4 mr-1.5" />}
                                {isNegative && <ArrowDownIcon className="h-4 w-4 mr-1.5" />}
                                {isNeutral && <MinusIcon className="h-4 w-4 mr-1.5" />}
                                {isPositive ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
