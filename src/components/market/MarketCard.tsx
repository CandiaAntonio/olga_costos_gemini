"use client";

import { MarketItem } from "@/lib/market-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";

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
  let unitLabel = "";
  if (item.symbol === "XAU" || item.symbol === "XAG") {
    unitLabel = "USD/oz";
  } else if (item.symbol === "USD") {
    unitLabel = "COP";
  }

  // Determine locale for formatting
  const locale = item.currency === "COP" ? "es-CO" : "en-US";

  return (
    <Card
      className={`overflow-hidden border transition-all cursor-pointer text-left w-full rounded-none
                ${
                  isSelected
                    ? "ring-1 ring-lebedeva-gold border-lebedeva-gold bg-[#fdfcf8]"
                    : "border-stone-200 hover:border-lebedeva-gold/50 hover:bg-stone-50"
                }
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lebedeva-gold`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-selected={isSelected}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-5 pt-4 bg-transparent border-b border-stone-100/50">
        <CardTitle className="text-xl font-serif font-normal uppercase tracking-widest text-lebedeva-black">
          {item.name}
        </CardTitle>
        <div className="text-sm font-light text-stone-400 tracking-wider">
          {unitLabel}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-3xl font-light font-technical tracking-tight text-stone-900">
              {new Intl.NumberFormat(locale, {
                style: "currency",
                currency: item.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.price)}
            </div>
            <div className="flex items-center space-x-2 text-sm mt-2 font-technical">
              <span
                className={`font-light flex items-center ${
                  isPositive
                    ? "text-emerald-700"
                    : isNegative
                    ? "text-rose-700"
                    : "text-stone-400"
                }`}
              >
                {isPositive && (
                  <ArrowUpIcon className="h-3 w-3 mr-1.5" strokeWidth={2} />
                )}
                {isNegative && (
                  <ArrowDownIcon className="h-3 w-3 mr-1.5" strokeWidth={2} />
                )}
                {isNeutral && (
                  <MinusIcon className="h-3 w-3 mr-1.5" strokeWidth={2} />
                )}
                {isPositive ? "+" : ""}
                {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
