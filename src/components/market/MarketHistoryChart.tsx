"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeRange } from "@/lib/market-db";
import { MarketItem } from "@/lib/market-service";
// Helper Server Action
import { fetchHistory } from "@/app/actions/market-actions";

interface MarketHistoryChartProps {
  initialItem: MarketItem;
  selectedItem: MarketItem;
  onHover?: (
    data: {
      price: number;
      change: number;
      changePercent: number;
      date: Date;
    } | null
  ) => void;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export function MarketHistoryChart({
  initialItem,
  selectedItem,
  onHover,
  range,
  onRangeChange,
}: MarketHistoryChartProps) {
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
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedItem.currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMouseMove = (props: any) => {
    if (!onHover || !props.activePayload || !props.activePayload[0]) {
      return;
    }

    const currentData = props.activePayload[0].payload;
    // Find index matching current date to calculate change
    const currentMs = new Date(currentData.date).getTime();
    const currentIndex = data.findIndex(
      (d) => new Date(d.date).getTime() === currentMs
    );

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
      date: currentData.date,
    });
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };

  return (
    <Card className="col-span-full rounded-none border-stone-200 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 pt-6 border-b border-stone-100 bg-stone-50/50">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-serif font-normal tracking-wide text-stone-900">
            Histórico — {selectedItem.name}
          </CardTitle>
          <div className="text-sm font-light text-stone-500 tracking-wider uppercase">
            {selectedItem.symbol} • {range}
          </div>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          {(["1D", "5D", "1M", "6M", "1Y", "5Y"] as TimeRange[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "outline"}
              size="sm"
              onClick={() => onRangeChange(r)}
              className={`rounded-none px-4 font-light text-xs transition-all duration-300 ${
                range === r
                  ? "bg-lebedeva-gold hover:bg-[#9a7009] text-white ring-0"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-lebedeva-gold"
              }`}
            >
              {r}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="h-[350px] w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-lebedeva-gold font-light animate-pulse">
              Cargando datos...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b8860b" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e5e5"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  minTickGap={50}
                  tick={{
                    fontSize: 11,
                    fontFamily: "sans-serif",
                    fill: "#78716c",
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(val) =>
                    new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(val)
                  }
                  domain={["auto", "auto"]}
                  scale="linear"
                  tick={{
                    fontSize: 11,
                    fontFamily: "sans-serif",
                    fill: "#78716c",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAFAFA",
                    border: "1px solid #e7e5e4",
                    borderRadius: "0px",
                    fontFamily: "serif",
                    padding: "8px 12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                  itemStyle={{ color: "#b8860b" }}
                  formatter={(value: any) => [
                    formatPrice(Number(value)),
                    "Precio",
                  ]}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#b8860b"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#b8860b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
