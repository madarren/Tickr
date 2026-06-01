import type { Quote } from "../types";
import { compact, money, percent, signedMoney } from "../format";

interface Props {
  quote: Quote;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function QuoteStats({ quote }: Props) {
  const up = (quote.change ?? 0) >= 0;
  const changeColor = up ? "text-emerald-600" : "text-red-600";
  const cur = quote.currency ?? "";

  return (
    <section>
      {/* Header: name, symbol, sector, price, daily change */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {quote.name ?? quote.symbol}{" "}
            <span className="text-slate-400">({quote.symbol})</span>
          </h2>
          {quote.sector && (
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {quote.sector}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-900">
            {money(quote.price)} {cur}
          </div>
          <div className={`text-lg font-semibold ${changeColor}`}>
            {signedMoney(quote.change)} ({percent(quote.change_percent)})
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Previous Close" value={money(quote.previous_close)} />
        <Stat label="Open" value={money(quote.open)} />
        <Stat label="Day High" value={money(quote.day_high)} />
        <Stat label="Day Low" value={money(quote.day_low)} />
        <Stat label="52-Week High" value={money(quote.fifty_two_week_high)} />
        <Stat label="52-Week Low" value={money(quote.fifty_two_week_low)} />
        <Stat label="Volume" value={compact(quote.volume)} />
        <Stat label="Avg. Volume" value={compact(quote.average_volume)} />
        <Stat label="Market Cap" value={compact(quote.market_cap)} />
        <Stat label="Bid" value={money(quote.bid)} />
        <Stat label="Ask" value={money(quote.ask)} />
      </div>
    </section>
  );
}
