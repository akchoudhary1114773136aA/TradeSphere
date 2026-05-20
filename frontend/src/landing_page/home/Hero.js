import React, { useState, useEffect } from "react";
import "./Hero.css";
import { apiRequest } from "../../config/api";

const ranges = ["1D", "6M", "1Y", "5Y"];

const rangePathShift = {
  "1D": 0,
  "6M": 10,
  "1Y": -8,
  "5Y": 16,
};

const defaultMarkets = [
  {
    symbol: "NIFTY 50",
    price: "22,450.30",
    change: "+278.40 (+1.24%)",
    trend: "positive",
    path: "M0 142 C60 138 80 130 120 113 C160 97 200 110 240 120 C280 130 320 115 360 95",
  },
  {
    symbol: "RELIANCE",
    price: "2,890.50",
    change: "+0.87%",
    trend: "positive",
    path: "M0 150 C52 144 84 122 126 132 C168 142 190 90 238 100 C292 112 320 80 360 68",
  },
  {
    symbol: "TCS",
    price: "3,456.00",
    change: "-0.32%",
    trend: "negative",
    path: "M0 76 C58 80 82 106 120 98 C162 90 190 124 232 130 C280 136 318 148 360 154",
  },
  {
    symbol: "HDFC BANK",
    price: "1,721.80",
    change: "+1.13%",
    trend: "positive",
    path: "M0 136 C42 130 76 118 116 124 C156 130 184 102 224 92 C270 80 318 88 360 58",
  },
  {
    symbol: "INFOSYS",
    price: "1,498.25",
    change: "-0.61%",
    trend: "negative",
    path: "M0 70 C48 82 74 96 116 94 C158 92 188 128 232 120 C276 112 318 146 360 160",
  },
];

const stripSuffix = (symbol) => (symbol ? symbol.replace(/\.(NS|BO)$/i, "") : symbol);

const toDisplayPrice = (num) => {
  if (num == null || isNaN(num)) return "—";
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

const formatLargeNumber = (val) => {
  if (val == null || isNaN(val)) return "—";
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} Lakh`;
  if (val >= 1000) return `${(val / 1000).toFixed(2)}k`;
  return val.toLocaleString("en-IN");
};

const buildPathFromHistory = (history, width = 360, height = 200, pad = 10) => {
  if (!history || history.length === 0) return "M0 100 C60 90 120 110 180 100 C240 90 300 110 360 100";
  const closes = history.map((it) => Number(it.close ?? it.adjClose ?? it.close ?? 0)).filter((v) => !isNaN(v));
  if (closes.length === 0) return "M0 100 C60 90 120 110 180 100 C240 90 300 110 360 100";

  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const n = closes.length;
  const stepX = n > 1 ? (width - pad * 2) / (n - 1) : 0;

  const points = closes.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return { x: Math.round(x), y: Math.round(y) };
  });

  let path = ``;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i === 0) path += `M ${p.x} ${p.y}`;
    else path += ` L ${p.x} ${p.y}`;
  }
  return path;
};

function Hero() {
  const [activeRange, setActiveRange] = useState("1D");
  const [markets, setMarkets] = useState(defaultMarkets);
  const [activeMarket, setActiveMarket] = useState(defaultMarkets[0]);

  const chartPath = (activeMarket && activeMarket.path ? activeMarket.path : defaultMarkets[0].path).replace(
    /(\d+)$/,
    (value) => Number(value) + rangePathShift[activeRange]
  );

  useEffect(() => {
    let mounted = true;

    const fetchLive = async () => {
      try {
        const [niftyQuote, mwData] = await Promise.all([
          apiRequest("/api/stocks/quote/^NSEI"),
          apiRequest("/api/stocks/market-watch"),
        ]);

        if (!mounted) return;

        const newMarkets = [];

        // NIFTY
        if (niftyQuote) {
          const price = niftyQuote.regularMarketPrice;
          const changePct = niftyQuote.regularMarketChangePercent;
          newMarkets.push({
            symbol: "NIFTY 50",
            price: toDisplayPrice(price),
            rawPrice: price,
            rawSymbol: "^NSEI",
            change: changePct != null ? `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%` : "",
            trend: changePct != null && changePct < 0 ? "negative" : "positive",
            path: defaultMarkets[0].path,
            fiftyTwoWeekHigh: niftyQuote.fiftyTwoWeekHigh,
            volume: niftyQuote.regularMarketVolume,
            pe: niftyQuote.trailingPE || niftyQuote.forwardPE || null,
          });
        } else {
          newMarkets.push(defaultMarkets[0]);
        }

        // target small cards order: RELIANCE, TCS, HDFC BANK, INFOSYS
        const targets = ["RELIANCE", "TCS", "HDFC BANK", "INFOSYS"];

        const list = Array.isArray(mwData) ? mwData : [];

        const normalize = (s) => (s || "").replace(/\s+/g, "").toUpperCase();

        targets.forEach((t) => {
          let found = list.find((it) => {
            const sym = stripSuffix(it.symbol || "");
            const name = (it.name || "").replace(/\s+/g, "");
            return normalize(sym) === normalize(t) || normalize(name) === normalize(t) || normalize(it.symbol || "").includes(normalize(t));
          });

          if (found && found.quote) {
            const q = found.quote;
            const changePct = q.regularMarketChangePercent;
            const dispSymbol = stripSuffix(found.symbol) || (found.name || t);
            const defaultEntry = defaultMarkets.find((m) => m.symbol.replace(/\s+/g, "").toUpperCase() === normalize(t));
              newMarkets.push({
                symbol: defaultEntry ? defaultEntry.symbol : dispSymbol,
                price: toDisplayPrice(q.regularMarketPrice),
                rawPrice: q.regularMarketPrice,
                rawSymbol: found.symbol,
                change: changePct != null ? `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%` : "",
                trend: changePct != null && changePct < 0 ? "negative" : "positive",
                path: defaultEntry ? defaultEntry.path : "M0 100 C80 90 160 110 240 100 320 90 360 95",
                fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
                volume: q.regularMarketVolume,
                pe: q.trailingPE || q.forwardPE || null,
              });
          } else {
            // fallback to static
            const fallback = defaultMarkets.find((m) => m.symbol.replace(/\s+/g, "").toUpperCase() === normalize(t));
            if (fallback) newMarkets.push(fallback);
          }
        });

        setMarkets(newMarkets);

        // fetch 1M history for each market to generate sparkline paths
        const fetchHistories = async () => {
          await Promise.all(
            newMarkets.map(async (m) => {
              const sym = m.rawSymbol || m.symbol;
              if (!sym) return;
              try {
                const res = await apiRequest(`/api/stocks/history/${encodeURIComponent(sym)}?period=1M`);
                if (!mounted || !Array.isArray(res) || res.length === 0) return;
                const path = buildPathFromHistory(res, 360, 200, 12);
                setMarkets((prev) => prev.map((itm) => (itm.symbol === m.symbol ? { ...itm, path } : itm)));
              } catch (e) {
                // ignore individual history errors
              }
            })
          );
        };

        fetchHistories();

        // if active market was set previously, refresh it with updated object
        setActiveMarket((prev) => {
          if (!prev) return newMarkets[0];
          const matched = newMarkets.find((m) => m.symbol === prev.symbol);
          return matched || newMarkets[0];
        });
      } catch (err) {
        // If API fails (most likely unauthenticated), keep defaults
        setMarkets(defaultMarkets);
        setActiveMarket(defaultMarkets[0]);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="tradehero">

      <div className="tradehero-card" data-aos="fade-up">

        <div className="tradehero-header">
          <div className="tradehero-brand">
            <span className="tradehero-brand-icon">TS</span>
            <span>TradeSphere</span>
            <span className="tradehero-live">Live</span>
          </div>

          <div className="tradehero-ranges">
            {ranges.map((range) => (
              <button
                className={
                  activeRange === range
                    ? "tradehero-range-btn active"
                    : "tradehero-range-btn"
                }
                key={range}
                onClick={() => setActiveRange(range)}
                type="button"
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="tradehero-main">

          <div>
            <p className="tradehero-label">{activeMarket.symbol}</p>
            <h1 className="tradehero-price">{activeMarket.price}</h1>
            <p
              className={`tradehero-change ${
                activeMarket.trend === "negative" ? "negative" : ""
              }`}
            >
              {activeMarket.change}
            </p>
            <p className="tradehero-sub">NSE - Updated just now</p>
          </div>

          <div className="tradehero-chart">
            <div className="tradehero-chart-line">
              <svg viewBox="0 0 360 200" preserveAspectRatio="none">
                <path
                  d={chartPath}
                  fill="none"
                  stroke="rgba(255,255,255,0.95)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

        </div>

        <div className="tradehero-chart-legend">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
        </div>

      </div>

      <div className="tradehero-grid">

        {markets.slice(1).map((market, index) => (
          <button
            className={`tradehero-card-small ${
              market.trend === "negative" ? "negative" : ""
            } ${activeMarket.symbol === market.symbol ? "selected" : ""}`}
            data-aos="fade-up"
            data-aos-delay={(index + 1) * 100}
            key={market.symbol}
            onClick={() => setActiveMarket(market)}
            type="button"
          >
            <p className="card-title">{market.symbol}</p>
            <p className="card-value">{market.price}</p>
            <p className="card-change">{market.change}</p>
            <div className="chart-strip">
              <svg viewBox="0 0 360 200" preserveAspectRatio="none">
                <path
                  d={market.path || defaultMarkets[0].path}
                  fill="none"
                  stroke={market.trend === "negative" ? "rgba(255,92,122,0.9)" : "rgba(18,214,167,0.9)"}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>
        ))}

      </div>

      <div className="tradehero-info">

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">52W High</p>
          <p className="info-value">{activeMarket?.fiftyTwoWeekHigh ? toDisplayPrice(activeMarket.fiftyTwoWeekHigh) : "—"}</p>
          <p className="info-note">{(activeMarket?.fiftyTwoWeekHigh && activeMarket?.rawPrice) ? `${(((activeMarket.fiftyTwoWeekHigh - activeMarket.rawPrice) / activeMarket.fiftyTwoWeekHigh) * 100).toFixed(1)}% away` : "—"}</p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">Volume</p>
          <p className="info-value">{activeMarket?.volume ? formatLargeNumber(activeMarket.volume) : "—"}</p>
          <p className="info-note">Avg {activeMarket?.volume ? formatLargeNumber(Math.round(activeMarket.volume / 1.1)) : "—"}</p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">P/E Ratio</p>
          <p className="info-value">{activeMarket?.pe ? `${Number(activeMarket.pe).toFixed(1)}x` : "—"}</p>
          <p className="info-note">Hist. 19.8x</p>
        </div>

      </div>

    </section>
  );
}

export default Hero;
