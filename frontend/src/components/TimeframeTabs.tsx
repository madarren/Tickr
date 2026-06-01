import { RANGE_LABELS, TIME_RANGES, type TimeRange } from "../types";

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeframeTabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
      {TIME_RANGES.map((range) => {
        const active = range === value;
        return (
          <button
            key={range}
            type="button"
            onClick={() => onChange(range)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-sky-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {RANGE_LABELS[range]}
          </button>
        );
      })}
    </div>
  );
}
