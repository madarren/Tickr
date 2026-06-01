const DASH = "—";

/** Money with two decimals, e.g. 312.06 -> "312.06". */
export function money(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return DASH;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Signed percent, e.g. -0.14 -> "-0.14%". */
export function percent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return DASH;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** Signed money for the daily change, e.g. -0.45 -> "-0.45". */
export function signedMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return DASH;
  const sign = value > 0 ? "+" : "";
  return `${sign}${money(value)}`;
}

/** Compact large integers: 4583336181760 -> "4.58T", 56381546 -> "56.38M". */
export function compact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return DASH;
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [threshold, suffix] of units) {
    if (Math.abs(value) >= threshold) {
      return `${(value / threshold).toFixed(2)}${suffix}`;
    }
  }
  return value.toLocaleString();
}
