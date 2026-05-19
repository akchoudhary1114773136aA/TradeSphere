import React, { useEffect, useMemo, useState } from "react";
import { holdings, watchlist } from "../data/data";

const formatCurrency = (value) =>
  value >= 1000 ? `${(value / 1000).toFixed(2)}k` : value.toFixed(2);

const Summary = () => {
  const [activeMetric, setActiveMetric] = useState("pnl");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((current) => (current + 1) % 12);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  const portfolio = useMemo(() => {
    const investment = holdings.reduce(
      (sum, stock) => sum + stock.avg * stock.qty,
      0
    );
    const current = holdings.reduce(
      (sum, stock) => sum + stock.price * stock.qty,
      0
    );
    const pnl = current - investment + pulse * 3.4;
    const pnlPercent = (pnl / investment) * 100;
    const gainers = watchlist.filter((stock) => !stock.isDown).length;

    return {
      investment,
      current: current + pulse * 3.4,
      pnl,
      pnlPercent,
      gainers,
      losers: watchlist.length - gainers,
    };
  }, [pulse]);

  const metricDetails = {
    margin: {
      title: "Buying power",
      value: "3.74k",
      note: "Available margin is ready for new equity positions.",
      accent: "blue",
    },
    used: {
      title: "Risk usage",
      value: "0",
      note: "No margin is currently blocked by open intraday exposure.",
      accent: "orange",
    },
    value: {
      title: "Portfolio value",
      value: formatCurrency(portfolio.current),
      note: `Invested ${formatCurrency(portfolio.investment)} across ${
        holdings.length
      } holdings.`,
      accent: "blue",
    },
    pnl: {
      title: "Live P&L",
      value: `${portfolio.pnl >= 0 ? "+" : ""}${formatCurrency(portfolio.pnl)}`,
      note: `${portfolio.pnlPercent.toFixed(2)}% overall with ${
        portfolio.gainers
      } watchlist gainers.`,
      accent: "green",
    },
  };

  const activeDetail = metricDetails[activeMetric];
  const topMovers = [...watchlist]
    .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent))
    .slice(0, 4);

  return (
    <div className="summary-page">
      <section className="summary-hero">
        <div>
          <p className="eyebrow">Portfolio overview</p>
          <h1>Hi, User</h1>
          <p className="summary-subtitle">
            Your equity balance, holdings, and buying power at a glance.
          </p>
        </div>
        <div className="hero-balance">
          <span>Total P&L</span>
          <strong>
            {portfolio.pnl >= 0 ? "+" : ""}
            {formatCurrency(portfolio.pnl)}
          </strong>
          <small>{portfolio.pnlPercent.toFixed(2)}% overall</small>
        </div>
      </section>

      <div className="metric-grid">
        <button
          className={`metric-card ${activeMetric === "margin" ? "selected" : ""}`}
          onClick={() => setActiveMetric("margin")}
          type="button"
        >
          <span>Margin available</span>
          <strong>3.74k</strong>
          <p>Opening balance 3.74k</p>
        </button>
        <button
          className={`metric-card ${activeMetric === "used" ? "selected" : ""}`}
          onClick={() => setActiveMetric("used")}
          type="button"
        >
          <span>Margins used</span>
          <strong>0</strong>
          <p>No active utilization</p>
        </button>
        <button
          className={`metric-card highlight ${
            activeMetric === "value" ? "selected" : ""
          }`}
          onClick={() => setActiveMetric("value")}
          type="button"
        >
          <span>Current value</span>
          <strong>{formatCurrency(portfolio.current)}</strong>
          <p>Investment {formatCurrency(portfolio.investment)}</p>
        </button>
        <button
          className={`metric-card ${activeMetric === "pnl" ? "selected" : ""}`}
          onClick={() => setActiveMetric("pnl")}
          type="button"
        >
          <span>Holdings</span>
          <strong>{holdings.length}</strong>
          <p>Diversified positions</p>
        </button>
      </div>

      <section className="live-dashboard-panel">
        <div className={`live-focus-card ${activeDetail.accent}`}>
          <div>
            <span className="live-label">Selected insight</span>
            <h2>{activeDetail.title}</h2>
            <p>{activeDetail.note}</p>
          </div>
          <strong>{activeDetail.value}</strong>
        </div>

        <div className="market-pulse-card">
          <div className="pulse-header">
            <span>Market pulse</span>
            <small>{portfolio.gainers} up / {portfolio.losers} down</small>
          </div>
          <div className="pulse-bars">
            {topMovers.map((stock, index) => (
              <div className="pulse-row" key={stock.name}>
                <span>{stock.name}</span>
                <div>
                  <i
                    style={{
                      width: `${Math.min(
                        Math.abs(parseFloat(stock.percent)) * 24 + 18,
                        100
                      )}%`,
                    }}
                    className={stock.isDown ? "loss-bar" : "profit-bar"}
                  />
                </div>
                <b className={stock.isDown ? "loss-text" : "profit-text"}>
                  {stock.percent}
                </b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>3.74k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>{" "}
            </p>
            <p>
              Opening balance <span>3.74k</span>{" "}
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <span>
          <p>Holdings (13)</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className="profit">
              1.55k <small>+5.20%</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>31.43k</span>{" "}
            </p>
            <p>
              Investment <span>29.88k</span>{" "}
            </p>
          </div>
        </div>
      </div>
      <div className="section activity-card">
        <span>
          <p>Recent activity</p>
        </span>
        <ul>
          <li>
            <b>Watchlist</b>
            <span>{portfolio.gainers} symbols trading higher</span>
          </li>
          <li>
            <b>Portfolio</b>
            <span>Current value refreshed just now</span>
          </li>
          <li>
            <b>Risk</b>
            <span>No intraday margin usage detected</span>
          </li>
        </ul>
      </div>
      </section>
    </div>
  );
};

export default Summary;
