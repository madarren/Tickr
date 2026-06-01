import type { History, Quote, TimeRange } from "./types";

const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

/** Error carrying the backend's human-readable detail message. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new ApiError(0, "Could not reach the Tickr server. Is it running?");
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* keep default detail */
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

export function fetchQuote(ticker: string): Promise<Quote> {
  return request<Quote>(`/api/quote/${encodeURIComponent(ticker)}`);
}

export function fetchHistory(
  ticker: string,
  range: TimeRange,
): Promise<History> {
  return request<History>(
    `/api/history/${encodeURIComponent(ticker)}?range=${range}`,
  );
}
