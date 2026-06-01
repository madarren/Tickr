import { useState } from "react";
import { ApiError, fetchHistory, fetchQuote } from "./api";
import type { History, Quote, TimeRange } from "./types";
import TickerInput from "./components/TickerInput";
import ErrorBanner from "./components/ErrorBanner";
import QuoteStats from "./components/QuoteStats";
import TimeframeTabs from "./components/TimeframeTabs";
import PriceChart from "./components/PriceChart";

export default function App() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [range, setRange] = useState<TimeRange>("1mo");
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(ticker: string) {
    setLoading(true);
    setError(null);
    try {
      // Fetch the snapshot and the chart for the current range together.
      const [q, h] = await Promise.all([
        fetchQuote(ticker),
        fetchHistory(ticker, range),
      ]);
      setQuote(q);
      setHistory(h);
    } catch (err) {
      // Clear any previously displayed stock and show the error inline.
      setQuote(null);
      setHistory(null);
      setError(
        err instanceof ApiError ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function changeRange(next: TimeRange) {
    setRange(next);
    if (!quote) return;
    setChartLoading(true);
    try {
      setHistory(await fetchHistory(quote.symbol, next));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load chart data.",
      );
    } finally {
      setChartLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Tickr <span className="text-sky-600">📈</span>
          </h1>
          <p className="text-slate-500">
            Look up real-time market data for any stock ticker.
          </p>
        </header>

        <TickerInput onSearch={search} loading={loading} />

        {/* Inline error directly below the input — no page navigation. */}
        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} />
          </div>
        )}

        {quote && !error && (
          <div className="mt-8 space-y-8">
            <QuoteStats quote={quote} />

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Price History
                </h3>
                <TimeframeTabs value={range} onChange={changeRange} />
              </div>
              <div
                className={`rounded-xl border border-slate-200 bg-white p-4 transition-opacity ${
                  chartLoading ? "opacity-50" : ""
                }`}
              >
                <PriceChart points={history?.points ?? []} range={range} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
