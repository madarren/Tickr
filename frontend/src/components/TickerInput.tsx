import { useState, type FormEvent } from "react";

interface Props {
  onSearch: (ticker: string) => void;
  loading: boolean;
}

export default function TickerInput({ onSearch, loading }: Props) {
  const [value, setValue] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const ticker = value.trim().toUpperCase();
    if (ticker) onSearch(ticker);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        placeholder="Enter ticker symbol (e.g. AAPL)"
        autoFocus
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg uppercase tracking-wide text-slate-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-lg bg-sky-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Loading…" : "Search"}
      </button>
    </form>
  );
}
