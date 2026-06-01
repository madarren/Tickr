export interface Quote {
  symbol: string;
  name: string | null;
  sector: string | null;
  currency: string | null;
  price: number | null;
  previous_close: number | null;
  open: number | null;
  change: number | null;
  change_percent: number | null;
  day_high: number | null;
  day_low: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
  volume: number | null;
  average_volume: number | null;
  market_cap: number | null;
  bid: number | null;
  ask: number | null;
}

export interface HistoryPoint {
  t: string;
  close: number;
}

export interface History {
  symbol: string;
  range: TimeRange;
  points: HistoryPoint[];
}

export const TIME_RANGES = ["1d", "5d", "1mo", "6mo", "1y"] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

export const RANGE_LABELS: Record<TimeRange, string> = {
  "1d": "1D",
  "5d": "5D",
  "1mo": "1M",
  "6mo": "6M",
  "1y": "1Y",
};
