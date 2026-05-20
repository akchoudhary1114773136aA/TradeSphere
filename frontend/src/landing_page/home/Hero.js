import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Hero.css";
import { apiRequest } from "../../config/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ranges = ["1D", "6M", "1Y", "5Y"];

const rangeTickLimit = {
  "1D": 6,
  "6M": 7,
  "1Y": 8,
  "5Y": 8,
};

const rangePointCount = {
  "1D": 24,
  "6M": 26,
  "1Y": 52,
  "5Y": 60,
};

const defaultMarkets = [
  {
    symbol: "NIFTY 50",
    rawSymbol: "^NSEI",
    price: "22,450.30",
    change: "+278.40 (+1.24%)",
    trend: "positive",
    path: "M0 142 C60 138 80 130 120 113 C160 97 200 110 240 120 C280 130 320 115 360 95",
  },
  {
    symbol: "RELIANCE",
    rawSymbol: "RELIANCE.NS",
    price: "2,890.50",
    change: "+0.87%",
    trend: "positive",
    path: "M0 150 C52 144 84 122 126 132 C168 142 190 90 238 100 C292 112 320 80 360 68",
  },
  {
    symbol: "TCS",
    rawSymbol: "TCS.NS",
    price: "3,456.00",
    change: "-0.32%",
    trend: "negative",
    path: "M0 76 C58 80 82 106 120 98 C162 90 190 124 232 130 C280 136 318 148 360 154",
  },
  {
    symbol: "HDFC BANK",
    rawSymbol: "HDFCBANK.NS",
    price: "1,721.80",
    change: "+1.13%",
    trend: "positive",
    path: "M0 136 C42 130 76 118 116 124 C156 130 184 102 224 92 C270 80 318 88 360 58",
  },
  {
    symbol: "INFOSYS",
    rawSymbol: "INFY.NS",
    price: "1,498.25",
    change: "-0.61%",
    trend: "negative",
    path: "M0 70 C48 82 74 96 116 94 C158 92 188 128 232 120 C276 112 318 146 360 160",
  },
];

const stripSuffix = (symbol) => (symbol ? symbol.replace(/\.(NS|BO)$/i, "") : symbol);

const YAHOO_SYMBOL_MAP = {
  "NIFTY 50": "^NSEI",
  RELIANCE: "RELIANCE.NS",
  TCS: "TCS.NS",
  "HDFC BANK": "HDFCBANK.NS",
  INFOSYS: "INFY.NS",
};

const toDisplayPrice = (num) => {
  if (num == null || isNaN(num)) return "-";
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

const formatLargeNumber = (val) => {
  if (val == null || isNaN(val)) return "-";
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} Lakh`;
  if (val >= 1000) return `${(val / 1000).toFixed(2)}k`;
  return val.toLocaleString("en-IN");
};

const getHistoryForRange = (market, range) => {
  const cached = market?.histories?.[range];
  if (Array.isArray(cached) && cached.length > 0) return cached;
  if (market?.historyPeriod === range && Array.isArray(market.history)) return market.history;
  return [];
};

const parsePrice = (market) => {
  if (typeof market?.rawPrice === "number") return market.rawPrice;
  const parsed = Number(String(market?.price || "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 1000;
};

const buildFallbackHistory = (market, range) => {
  const count = rangePointCount[range] || 26;
  const base = parsePrice(market);
  const now = new Date();
  const direction = market?.trend === "negative" ? -1 : 1;

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    const remaining = count - index - 1;

    if (range === "1D") date.setMinutes(now.getMinutes() - remaining * 20);
    else if (range === "5Y") date.setMonth(now.getMonth() - remaining);
    else date.setDate(now.getDate() - remaining * 7);

    const wave = Math.sin(index / 2.4) * 0.012;
    const drift = ((index - count + 1) / count) * 0.045 * direction;
    const close = base * (1 + wave + drift);

    return { date: date.toISOString(), close: Number(close.toFixed(2)), fallback: true };
  });
};

const formatHistoryLabel = (dateValue, range) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  if (range === "1D") {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  if (range === "5Y") {
    return date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
  }

  return date.toLocaleString("en-IN", { day: "numeric", month: "short" });
};

const normalizeHistory = (history) => {
  return (history || [])
    .map((item) => ({
      ...item,
      close: Number(item.close),
    }))
    .filter((item) => item.date && Number.isFinite(item.close))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

function Hero() {
  const [activeRange, setActiveRange] = useState("1D");
  const [markets, setMarkets] = useState(defaultMarkets);
  const [activeSymbol, setActiveSymbol] = useState(defaultMarkets[0].symbol);
  const historyRequestsRef = useRef(new Set());

  const activeMarket = useMemo(
    () => markets.find((market) => market.symbol === activeSymbol) || markets[0] || defaultMarkets[0],
    [activeSymbol, markets]
  );

  useEffect(() => {
    let mounted = true;

    const fetchLive = async () => {
      try {
        const [niftyQuote, mwData] = await Promise.all([
          apiRequest("/api/stocks/quote/%5ENSEI"),
          apiRequest("/api/stocks/market-watch"),
        ]);

        if (!mounted) return;

        const newMarkets = [];

        if (niftyQuote) {
          const price = niftyQuote.regularMarketPrice;
          const changePct = niftyQuote.regularMarketChangePercent;
          const mwList = Array.isArray(mwData) ? mwData : [];
          const peVals = mwList
            .map((it) => (it && it.quote ? it.quote.trailingPE || it.quote.forwardPE : null))
            .filter((v) => v != null && !isNaN(v));
          const avgPe = peVals.length > 0 ? peVals.reduce((a, b) => a + b, 0) / peVals.length : null;
          const volSum = mwList
            .map((it) => (it && it.quote ? Number(it.quote.regularMarketVolume || 0) : 0))
            .reduce((a, b) => a + b, 0);

          newMarkets.push({
            symbol: "NIFTY 50",
            price: toDisplayPrice(price),
            rawPrice: price,
            rawSymbol: "^NSEI",
            change: changePct != null ? `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%` : "",
            trend: changePct != null && changePct < 0 ? "negative" : "positive",
            path: defaultMarkets[0].path,
            fiftyTwoWeekHigh: niftyQuote.fiftyTwoWeekHigh,
            volume: niftyQuote.regularMarketVolume || (volSum > 0 ? volSum : null),
            pe: niftyQuote.trailingPE || niftyQuote.forwardPE || (avgPe ? Number(avgPe.toFixed(1)) : null),
          });
        } else {
          newMarkets.push(defaultMarkets[0]);
        }

        const targets = ["RELIANCE", "TCS", "HDFC BANK", "INFOSYS"];
        const list = Array.isArray(mwData) ? mwData : [];
        const normalize = (s) => (s || "").replace(/\s+/g, "").toUpperCase();

        targets.forEach((t) => {
          const found = list.find((it) => {
            const sym = stripSuffix(it.symbol || "");
            const name = (it.name || "").replace(/\s+/g, "");
            return normalize(sym) === normalize(t) || normalize(name) === normalize(t) || normalize(it.symbol || "").includes(normalize(t));
          });

          if (found && found.quote) {
            const q = found.quote;
            const changePct = q.regularMarketChangePercent;
            const dispSymbol = stripSuffix(found.symbol) || found.name || t;
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
            const fallback = defaultMarkets.find((m) => m.symbol.replace(/\s+/g, "").toUpperCase() === normalize(t));
            if (fallback) {
              const mappedRaw = YAHOO_SYMBOL_MAP[fallback.symbol] || fallback.rawSymbol || fallback.symbol;
              newMarkets.push({ ...fallback, rawSymbol: mappedRaw });
            }
          }
        });

        setMarkets((prev) => {
          const prevMap = new Map((prev || []).map((p) => [p.symbol, p]));
          return newMarkets.map((nm) => {
            const prevItem = prevMap.get(nm.symbol);
            if (!prevItem) return nm;
            return {
              ...nm,
              histories: prevItem.histories || nm.histories,
              history: prevItem.history,
              historyPeriod: prevItem.historyPeriod,
              rawSymbol: nm.rawSymbol || prevItem.rawSymbol,
            };
          });
        });
      } catch (err) {
        setMarkets(defaultMarkets);
        setActiveSymbol(defaultMarkets[0].symbol);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!markets.some((market) => market.symbol === activeSymbol)) {
      setActiveSymbol(markets[0]?.symbol || defaultMarkets[0].symbol);
    }
  }, [activeSymbol, markets]);

  useEffect(() => {
    let mounted = true;
    const periodParam = activeRange;

    const fetchHistoriesForRange = async () => {
      if (!markets || markets.length === 0) return;

      const missingMarkets = markets.filter((market) => {
        const requestKey = `${market.symbol}:${periodParam}`;
        return getHistoryForRange(market, periodParam).length === 0 && !historyRequestsRef.current.has(requestKey);
      });
      if (missingMarkets.length === 0) return;

      await Promise.all(
        missingMarkets.map(async (market) => {
          const sym = market.rawSymbol || market.symbol;
          if (!sym) return;
          const requestKey = `${market.symbol}:${periodParam}`;
          historyRequestsRef.current.add(requestKey);

          try {
            const res = await apiRequest(`/api/stocks/history/${encodeURIComponent(sym)}?period=${encodeURIComponent(periodParam)}`);
            if (!mounted || !Array.isArray(res) || res.length === 0) return;

            setMarkets((prev) =>
              prev.map((item) =>
                item.symbol === market.symbol
                  ? {
                      ...item,
                      histories: {
                        ...(item.histories || {}),
                        [periodParam]: res,
                      },
                    }
                  : item
              )
            );
          } catch (e) {
            // Keep the UI usable with the fallback series if a single symbol fails.
          } finally {
            historyRequestsRef.current.delete(requestKey);
          }
        })
      );
    };

    fetchHistoriesForRange();

    return () => {
      mounted = false;
    };
  }, [activeRange, markets]);

  const liveHeroHistory = normalizeHistory(getHistoryForRange(activeMarket, activeRange));
  const heroHistory = liveHeroHistory.length > 1 ? liveHeroHistory : buildFallbackHistory(activeMarket, activeRange);
  const hasHeroHistory = liveHeroHistory.length > 1;

  const heroChartData = {
    labels: heroHistory.map((item) => formatHistoryLabel(item.date, activeRange)),
    datasets: [
      {
        label: "Close Price",
        data: heroHistory.map((item) => Number(item.close)),
        borderColor: activeMarket?.trend === "negative" ? "rgba(255,92,122,1)" : "rgba(18,214,167,1)",
        backgroundColor: activeMarket?.trend === "negative" ? "rgba(255,92,122,0.06)" : "rgba(18,214,167,0.06)",
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        tension: 0.22,
        clip: false,
      },
    ],
  };

  const heroChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasHeroHistory,
        callbacks: {
          label: (context) => `Close: ${toDisplayPrice(context.parsed.y)}`,
        },
      },
    },
    animation: { duration: 0 },
    spanGaps: true,
    scales: {
      x: {
        grid: { display: false },
        border: { color: "rgba(255,255,255,0.28)" },
        ticks: {
          color: "rgba(255,255,255,0.72)",
          autoSkip: true,
          maxRotation: 0,
          maxTicksLimit: rangeTickLimit[activeRange],
        },
      },
      y: {
        beginAtZero: false,
        grid: { color: "rgba(255,255,255,0.08)" },
        border: { color: "rgba(255,255,255,0.28)" },
        ticks: {
          color: "rgba(255,255,255,0.72)",
          maxTicksLimit: 5,
          callback: (value) => toDisplayPrice(Number(value)),
        },
      },
    },
  };

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
                className={activeRange === range ? "tradehero-range-btn active" : "tradehero-range-btn"}
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
            <p className={`tradehero-change ${activeMarket.trend === "negative" ? "negative" : ""}`}>
              {activeMarket.change}
            </p>
            <p className="tradehero-sub">NSE - {hasHeroHistory ? `${activeRange} history` : "loading history"}</p>
          </div>

          <div className="tradehero-chart">
            <div className="tradehero-chart-line">
              <Line data={heroChartData} options={heroChartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="tradehero-grid">
        {markets.slice(1).map((market, index) => {
          const cardHistory = normalizeHistory(getHistoryForRange(market, activeRange));

          return (
            <button
              className={`tradehero-card-small ${market.trend === "negative" ? "negative" : ""} ${
                activeMarket.symbol === market.symbol ? "selected" : ""
              }`}
              key={market.symbol}
              onClick={() => setActiveSymbol(market.symbol)}
              type="button"
            >
              <p className="card-title">{market.symbol}</p>
              <p className="card-value">{market.price}</p>
              <p className="card-change">{market.change}</p>
              <div className={`chart-strip ${cardHistory.length > 1 ? "has-chart" : ""}`}>
                {cardHistory.length > 1 ? (
                  <Line
                    data={{
                      labels: cardHistory.map((item) => formatHistoryLabel(item.date, activeRange)),
                      datasets: [
                        {
                          data: cardHistory.map((h) => h.close),
                          borderColor: market.trend === "negative" ? "rgba(255,92,122,0.95)" : "rgba(18,214,167,0.95)",
                          backgroundColor: "transparent",
                          borderWidth: 2,
                          pointRadius: 0,
                          tension: 0.22,
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                      animation: { duration: 0 },
                      spanGaps: true,
                      scales: { x: { display: false }, y: { display: false } },
                      elements: { line: { borderCapStyle: "round" } },
                    }}
                  />
                ) : (
                  <svg viewBox="0 0 360 200" preserveAspectRatio="none">
                    <path
                      d={market.path || defaultMarkets[0].path}
                      fill="none"
                      stroke={market.trend === "negative" ? "rgba(255,92,122,0.9)" : "rgba(18,214,167,0.9)"}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="tradehero-info">
        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">52W High</p>
          <p className="info-value">{activeMarket?.fiftyTwoWeekHigh ? toDisplayPrice(activeMarket.fiftyTwoWeekHigh) : "-"}</p>
          <p className="info-note">
            {activeMarket?.fiftyTwoWeekHigh && activeMarket?.rawPrice
              ? `${(((activeMarket.fiftyTwoWeekHigh - activeMarket.rawPrice) / activeMarket.fiftyTwoWeekHigh) * 100).toFixed(1)}% away`
              : "-"}
          </p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">Volume</p>
          <p className="info-value">{activeMarket?.volume ? formatLargeNumber(activeMarket.volume) : "-"}</p>
          <p className="info-note">Avg {activeMarket?.volume ? formatLargeNumber(Math.round(activeMarket.volume / 1.1)) : "-"}</p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">P/E Ratio</p>
          <p className="info-value">{activeMarket?.pe ? `${Number(activeMarket.pe).toFixed(1)}x` : "-"}</p>
          <p className="info-note">Hist. 19.8x</p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
