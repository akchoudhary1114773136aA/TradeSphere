import React, { useState } from "react";
import "./Hero.css";

const ranges = ["1D", "6M", "1Y", "5Y"];

const rangePathShift = {
  "1D": 0,
  "6M": 10,
  "1Y": -8,
  "5Y": 16,
};

const markets = [
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

function Hero() {
  const [activeRange, setActiveRange] = useState("1D");
  const [activeMarket, setActiveMarket] = useState(markets[0]);
  const chartPath = activeMarket.path.replace(
    /(\d+)$/,
    (value) => Number(value) + rangePathShift[activeRange]
  );

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
            <div className="chart-strip"></div>
          </button>
        ))}

      </div>

      <div className="tradehero-info">

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">52W High</p>
          <p className="info-value">23,441</p>
          <p className="info-note">4.2% away</p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">Volume</p>
          <p className="info-value">2.4B</p>
          <p className="info-note">Avg 2.1B</p>
        </div>

        <div className="tradehero-info-card" data-aos="fade-up">
          <p className="info-label">P/E Ratio</p>
          <p className="info-value">21.3x</p>
          <p className="info-note">Hist. 19.8x</p>
        </div>

      </div>

    </section>
  );
}

export default Hero;
