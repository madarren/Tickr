"""API routes for Tickr."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from . import services
from .schemas import History, Quote

router = APIRouter(prefix="/api")


@router.get("/quote/{ticker}", response_model=Quote)
def quote(ticker: str) -> Quote:
    try:
        return services.get_quote(ticker)
    except services.TickerNotFound:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker.upper()}' does not exist",
        )
    except services.UpstreamError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Yahoo Finance: {exc}",
        )


@router.get("/history/{ticker}", response_model=History)
def history(
    ticker: str,
    range: str = Query(default="1mo", description="One of: 1d, 5d, 1mo, 6mo, 1y"),
) -> History:
    try:
        return services.get_history(ticker, range)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except services.TickerNotFound:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker '{ticker.upper()}' does not exist",
        )
    except services.UpstreamError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Yahoo Finance: {exc}",
        )
