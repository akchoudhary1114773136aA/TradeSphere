import React, { useEffect, useState } from "react";
import { getMe, getHoldings, getMarketWatch } from "../api";

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "—";
  return Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(2)}k` : value.toFixed(2);
};

const Summary = () => {
  const [activeMetric, setActiveMetric] = useState("pnl");
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketWatch, setMarketWatch] = useState(null);

  useEffect(() => {
    Promise.allSettled([getMe(), getHoldings(), getMarketWatch()])
      .then(([meRes, holdRes, mwRes]) => {
        if (meRes.status === "fulfilled") {
          setUserData(meRes.value.data);
        }
        if (holdRes.status === "fulfilled") {
          setPortfolioData(holdRes.value.data);
        }
        if (mwRes.status === "fulfilled") {
          setMarketWatch(mwRes.value.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="summary-page" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        <div style={{ display: "inline-block", width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderRadius: "50%", borderTopColor: "var(--accent-blue)", animation: "spin 1s ease-in-out infinite" }} />
        <p style={{ marginTop: "16px" }}>Loading dashboard...</p>
        <style>{`
          @keyframes spin { 
            to { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    );
  }

  // Calculate fields
  const userName = userData && userData.name ? userData.name.split(" ")[0] : "User";
  const walletBalance = userData ? userData.walletBalance : 0;
  
  const totalInvested = portfolioData?.summary?.totalInvested || 0;
  const totalCurrent = portfolioData?.summary?.totalCurrent || 0;
  const totalProfitLoss = portfolioData?.summary?.totalProfitLoss || 0;
  const holdingsCount = portfolioData?.holdings?.length || 0;
  
  const profitLossPct = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : "0.00";
  
  const mwData = marketWatch || [];
  const gainersCount = mwData.filter(stock => stock.quote?.regularMarketChangePercent > 0).length;
  const losersCount = mwData.filter(stock => stock.quote?.regularMarketChangePercent < 0).length;
  
  const availableCash = walletBalance - totalInvested;

  const metricDetails = {
    margin: {
      title: "Wallet Balance",
      value: formatCurrency(walletBalance),
      note: "Total wallet balance available in your account.",
      accent: "blue",
    },
    used: {
      title: "Invested",
      value: formatCurrency(totalInvested),
      note: "Total amount invested in holdings.",
      accent: "orange",
    },
    value: {
      title: "Current Value",
      value: formatCurrency(totalCurrent),
      note: `Invested ${formatCurrency(totalInvested)} across ${holdingsCount} holdings.`,
      accent: "blue",
    },
    pnl: {
      title: "Live P&L",
      value: `${totalProfitLoss >= 0 ? "+" : ""}${formatCurrency(totalProfitLoss)}`,
      note: `${profitLossPct}% overall with ${gainersCount} watchlist gainers.`,
      accent: "green",
    },
  };

  const activeDetail = metricDetails[activeMetric];

  // Top movers for pulse
  const topMovers = [...mwData]
    .map(stock => {
      const q = stock.quote || {};
      const changePct = q.regularMarketChangePercent || 0;
      return {
        name: stock.name || stock.symbol.replace(/\.(NS|BO)$/i, ""),
        percent: changePct,
        percentStr: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
        isDown: changePct < 0
      };
    })
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 6);

  return (
    <div className="summary-page">
      <section className="summary-hero">
        <div>
          <p className="eyebrow">Portfolio overview</p>
          <h1>Hi, {userName}</h1>
          <p className="summary-subtitle">
            Your equity balance, holdings, and buying power at a glance.
          </p>
        </div>
        <div className="hero-balance">
          <span>Total P&L</span>
          <strong className={totalProfitLoss >= 0 ? "profit" : "loss"} style={ { color: totalProfitLoss >= 0 ? "var(--profit)" : "var(--loss)" } }>
            {totalProfitLoss >= 0 ? "+" : ""}
            {formatCurrency(totalProfitLoss)}
          </strong>
          <small>{profitLossPct}% overall</small>
        </div>
      </section>

      <div className="metric-grid">
        <button
          className={`metric-card ${activeMetric === "margin" ? "selected" : ""}`}
          onClick={() => setActiveMetric("margin")}
          type="button"
        >
          <span>Wallet Balance</span>
          <strong>{formatCurrency(walletBalance)}</strong>
          <p>Opening balance {formatCurrency(walletBalance)}</p>
        </button>
        <button
          className={`metric-card ${activeMetric === "used" ? "selected" : ""}`}
          onClick={() => setActiveMetric("used")}
          type="button"
        >
          <span>Invested</span>
          <strong>{formatCurrency(totalInvested)}</strong>
          <p>No active utilization</p>
        </button>
        <button
          className={`metric-card highlight ${activeMetric === "value" ? "selected" : ""}`}
          onClick={() => setActiveMetric("value")}
          type="button"
        >
          <span>Current Value</span>
          <strong>{formatCurrency(totalCurrent)}</strong>
          <p>Investment {formatCurrency(totalInvested)}</p>
        </button>
        <button
          className={`metric-card ${activeMetric === "pnl" ? "selected" : ""}`}
          onClick={() => setActiveMetric("pnl")}
          type="button"
        >
          <span>Holdings</span>
          <strong>{holdingsCount} stocks</strong>
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
          <strong style={ activeMetric === 'pnl' ? { color: totalProfitLoss >= 0 ? "var(--profit)" : "var(--loss)" } : {} }>{activeDetail.value}</strong>
        </div>

        <div className="market-pulse-card">
          <div className="pulse-header">
            <span>Market pulse</span>
            <small>{gainersCount} up / {losersCount} down</small>
          </div>
          <div className="pulse-bars">
            {topMovers.map((stock) => (
              <div className="pulse-row" key={stock.name}>
                <span>{stock.name}</span>
                <div>
                  <i
                    style={{
                      width: `${Math.min(Math.abs(stock.percent) * 10 + 10, 100)}%`,
                    }}
                    className={stock.isDown ? "loss-bar" : "profit-bar"}
                  />
                </div>
                <b className={stock.isDown ? "loss-text" : "profit-text"}>
                  {stock.percentStr}
                </b>
              </div>
            ))}
            {topMovers.length === 0 && (
              <div className="pulse-row">
                <span style={{ color: "var(--text-muted)" }}>—</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="section">
          <span>
            <p>Available Cash</p>
          </span>

          <div className="data">
            <div className="first">
              <h3>{formatCurrency(availableCash)}</h3>
              <p>Available cash</p>
            </div>
            <hr />

            <div className="second">
              <p>
                Margins used <span>{formatCurrency(totalInvested)}</span>{" "}
              </p>
              <p>
                Opening balance <span>{formatCurrency(walletBalance)}</span>{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="section">
          <span>
            <p>Holdings ({holdingsCount})</p>
          </span>

          <div className="data">
            <div className="first">
              <h3 className={totalProfitLoss >= 0 ? "profit" : "loss"}>
                {formatCurrency(totalProfitLoss)} <small>{totalProfitLoss >= 0 ? "+" : ""}{profitLossPct}%</small>{" "}
              </h3>
              <p>P&L</p>
            </div>
            <hr />

            <div className="second">
              <p>
                Current Value <span>{formatCurrency(totalCurrent)}</span>{" "}
              </p>
              <p>
                Investment <span>{formatCurrency(totalInvested)}</span>{" "}
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
              <span>{gainersCount} symbols trading higher</span>
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
