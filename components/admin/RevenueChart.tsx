"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Donation = { amount: string; createdAt: string };

// Single-series trend chart (job: "revenue over time") — one hue, the brand
// accent, no categorical palette or legend needed (dataviz skill: a single
// series needs no legend box, the card title already says what's plotted).
const ACCENT = "#91008D";

function formatNaira(value: number) {
  return `₦${value.toLocaleString()}`;
}

function formatCompactNaira(value: number) {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value}`;
}

function useMonthlyRevenue(donations: Donation[]) {
  return useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        total: 0,
      });
    }
    const byKey = new Map(months.map((m) => [m.key, m]));
    for (const donation of donations) {
      const d = new Date(donation.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.total += Number(donation.amount) || 0;
    }
    return months;
  }, [donations]);
}

export function RevenueChart({ donations }: { donations: Donation[] }) {
  const data = useMonthlyRevenue(donations);
  const hasData = data.some((m) => m.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center text-center text-sm text-muted-foreground px-6">
        No donations yet — revenue will show here once they start coming in.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e1e0d9" strokeDasharray="0" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#898781", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#898781", fontSize: 12 }}
            tickFormatter={formatCompactNaira}
            width={56}
          />
          <Tooltip
            formatter={(value: number) => [formatNaira(value), "Revenue"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e1e0d9",
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={ACCENT}
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
