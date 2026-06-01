"""Pydantic response models for the Tickr API."""

from __future__ import annotations

from pydantic import BaseModel


class Quote(BaseModel):
    """Current market data for a single ticker.

    Every numeric field is optional because yfinance occasionally omits
    fields (or Yahoo rate-limits a request); the frontend renders a dash
    for any value that is ``None``.
    """

    symbol: str
    name: str | None = None
    sector: str | None = None
    currency: str | None = None

    price: float | None = None
    previous_close: float | None = None
    open: float | None = None

    change: float | None = None
    change_percent: float | None = None

    day_high: float | None = None
    day_low: float | None = None
    fifty_two_week_high: float | None = None
    fifty_two_week_low: float | None = None

    volume: int | None = None
    average_volume: int | None = None
    market_cap: int | None = None

    bid: float | None = None
    ask: float | None = None


class HistoryPoint(BaseModel):
    """A single point on the price chart."""

    t: str  # ISO-8601 timestamp
    close: float


class History(BaseModel):
    symbol: str
    range: str
    points: list[HistoryPoint]
