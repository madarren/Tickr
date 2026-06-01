"""Yahoo Finance access layer.

Wraps the ``yfinance`` library and maps its loosely-typed dictionaries onto
the strongly-typed schemas the API exposes. yfinance keys are inconsistent
between symbols, so most lookups try a couple of fallback keys.
"""

from __future__ import annotations

import yfinance as yf
from curl_cffi import requests as cffi_requests

from .schemas import History, HistoryPoint, Quote

# Yahoo aggressively rate-limits plain HTTP clients based on their TLS
# fingerprint / missing browser headers. Routing yfinance through a
# curl_cffi session that impersonates Chrome avoids those 429s. The session
# is created once and reused across requests.
_session = cffi_requests.Session(impersonate="chrome")


def _ticker(symbol: str) -> "yf.Ticker":
    return yf.Ticker(symbol, session=_session)


class TickerNotFound(Exception):
    """Raised when Yahoo has no data for the requested symbol."""


class UpstreamError(Exception):
    """Raised when the request to Yahoo fails (network, rate limit, etc.)."""


# range -> (yfinance period, yfinance interval)
_RANGE_MAP: dict[str, tuple[str, str]] = {
    "1d": ("1d", "5m"),
    "5d": ("5d", "30m"),
    "1mo": ("1mo", "1d"),
    "6mo": ("6mo", "1d"),
    "1y": ("1y", "1d"),
}

VALID_RANGES = tuple(_RANGE_MAP.keys())


def _first(info: dict, *keys: str):
    """Return the first non-null value among ``keys`` in ``info``."""
    for key in keys:
        value = info.get(key)
        if value is not None:
            return value
    return None


def get_quote(symbol: str) -> Quote:
    """Fetch the current market snapshot for ``symbol``.

    Raises ``TickerNotFound`` if Yahoo has no price data, ``UpstreamError``
    on any other failure talking to Yahoo.
    """
    symbol = symbol.strip().upper()
    try:
        info = _ticker(symbol).info
    except Exception as exc:  # network / parse / rate-limit
        # Yahoo replies with HTTP 404 for symbols it doesn't know about;
        # surface that as "not found" rather than an upstream failure.
        if "404" in str(exc):
            raise TickerNotFound(symbol) from exc
        raise UpstreamError(str(exc)) from exc

    price = _first(info, "currentPrice", "regularMarketPrice")
    previous_close = _first(info, "previousClose", "regularMarketPreviousClose")

    # A non-existent symbol comes back as an empty-ish dict with no price.
    if not info or price is None:
        raise TickerNotFound(symbol)

    change = None
    change_percent = None
    if price is not None and previous_close:
        change = price - previous_close
        change_percent = (change / previous_close) * 100

    return Quote(
        symbol=symbol,
        name=_first(info, "longName", "shortName"),
        sector=info.get("sector"),
        currency=info.get("currency"),
        price=price,
        previous_close=previous_close,
        open=_first(info, "open", "regularMarketOpen"),
        change=change,
        change_percent=change_percent,
        day_high=_first(info, "dayHigh", "regularMarketDayHigh"),
        day_low=_first(info, "dayLow", "regularMarketDayLow"),
        fifty_two_week_high=info.get("fiftyTwoWeekHigh"),
        fifty_two_week_low=info.get("fiftyTwoWeekLow"),
        volume=_first(info, "volume", "regularMarketVolume"),
        average_volume=_first(info, "averageVolume", "averageDailyVolume10Day"),
        market_cap=info.get("marketCap"),
        bid=info.get("bid"),
        ask=info.get("ask"),
    )


def get_history(symbol: str, range_: str) -> History:
    """Fetch chart data for ``symbol`` over the requested ``range_``."""
    symbol = symbol.strip().upper()
    if range_ not in _RANGE_MAP:
        raise ValueError(f"Invalid range '{range_}'. Use one of {VALID_RANGES}.")

    period, interval = _RANGE_MAP[range_]
    try:
        frame = _ticker(symbol).history(period=period, interval=interval)
    except Exception as exc:
        if "404" in str(exc):
            raise TickerNotFound(symbol) from exc
        raise UpstreamError(str(exc)) from exc

    if frame is None or frame.empty or "Close" not in frame:
        raise TickerNotFound(symbol)

    closes = frame["Close"].dropna()
    points = [
        HistoryPoint(t=index.isoformat(), close=round(float(value), 4))
        for index, value in closes.items()
    ]
    if not points:
        raise TickerNotFound(symbol)

    return History(symbol=symbol, range=range_, points=points)
