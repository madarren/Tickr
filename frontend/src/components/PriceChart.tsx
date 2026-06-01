import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint, TimeRange } from "../types";
import { money } from "../format";

interface Props {
  points: HistoryPoint[];
  range: TimeRange;
}

// Intraday ranges show a time-of-day axis; longer ranges show dates.
const INTRADAY: TimeRange[] = ["1d", "5d"];

function formatTick(iso: string, range: TimeRange): string {
  const d = new Date(iso);
  if (range === "1d") {
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (range === "5d") {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (range === "1y") {
    return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PriceChart({ points, range }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-slate-400">
        No chart data available.
      </div>
    );
  }

  const first = points[0].close;
  const last = points[points.length - 1].close;
  const up = last >= first;
  const color = up ? "#059669" : "#dc2626"; // emerald-600 / red-600

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => formatTick(v, range)}
            minTickGap={40}
            tick={{ fontSize: 12, fill: "#64748b" }}
            stroke="#cbd5e1"
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => money(v)}
            width={64}
            tick={{ fontSize: 12, fill: "#64748b" }}
            stroke="#cbd5e1"
          />
          <Tooltip
            formatter={(v) => [money(Number(v)), "Close"]}
            labelFormatter={(iso) =>
              new Date(iso as string).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: INTRADAY.includes(range) ? "short" : undefined,
              })
            }
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
