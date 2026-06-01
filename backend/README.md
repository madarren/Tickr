# Tickr Backend

FastAPI service that fetches stock market data from Yahoo Finance via
[`yfinance`](https://github.com/ranaroussi/yfinance).

## Setup

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## Run

```bash
.venv/bin/uvicorn app.main:app --reload --port 8000
```

The API is then available at `http://localhost:8000`. Interactive docs:
`http://localhost:8000/docs`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness check. |
| `GET` | `/api/quote/{ticker}` | Current market snapshot (price, change, open, high/low, 52-week range, volume, market cap, bid/ask, sector). |
| `GET` | `/api/history/{ticker}?range=1d\|5d\|1mo\|6mo\|1y` | Closing-price series for the chart. |

A non-existent ticker returns **HTTP 404** with
`{"detail": "Ticker 'XYZ' does not exist"}`. Network/upstream failures return
**HTTP 502**.

### Examples

```bash
curl localhost:8000/api/quote/AAPL
curl "localhost:8000/api/history/AAPL?range=1mo"
curl -i localhost:8000/api/quote/NOTAREAL   # -> 404
```

## Notes

- Yahoo rate-limits plain HTTP clients aggressively. Requests are routed
  through a [`curl_cffi`](https://github.com/lexiforest/curl_cffi) session that
  impersonates Chrome (see [app/services.py](app/services.py)) to avoid 429s.
- yfinance occasionally omits fields; those come back as `null` and the
  frontend renders a dash.

## Project layout

```
app/
  main.py      # FastAPI app + CORS + route registration
  routes.py    # /api/quote, /api/history; maps service errors to HTTP codes
  services.py  # yfinance access + field mapping
  schemas.py   # Pydantic response models
```
