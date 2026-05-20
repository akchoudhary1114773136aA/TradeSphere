import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { getQuote, getHistory } from "../api";
import "./StockAnalytics.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const formatCurrency = (val) => {
  if (val == null || isNaN(val)) return "—";
  return val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatLargeNumber = (val) => {
  if (val == null || isNaN(val)) return "—";
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} Lakh`;
  return val.toLocaleString("en-IN");
};

const StockAnalytics = ({ symbol, name, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState("1M");
  const [chartLoading, setChartLoading] = useState(false);

  const fetchInitialData = () => {
    setLoading(true);
    setError(false);
    Promise.allSettled([getQuote(symbol), getHistory(symbol, "1M")])
      .then(([quoteRes, histRes]) => {
        if (quoteRes.status === "fulfilled" && quoteRes.value.data) {
          setQuote(quoteRes.value.data);
        } else {
          throw new Error("Quote failed");
        }
        if (histRes.status === "fulfilled" && histRes.value.data) {
          setHistory(histRes.value.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInitialData();
  }, [symbol]);

  const handlePeriodChange = (newPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    setChartLoading(true);
    getHistory(symbol, newPeriod)
      .then((res) => {
        if (res.data) setHistory(res.data);
      })
      .catch(() => {})
      .finally(() => setChartLoading(false));
  };

  if (loading) {
    return createPortal(
      <div className="analytics-overlay" onClick={onClose}>
        <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
          <div className="analytics-loading">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (error || !quote) {
    return createPortal(
      <div className="analytics-overlay" onClick={onClose}>
        <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
          <div className="analytics-error">
            <p>Unable to load data for this stock</p>
            <div style={{ marginTop: "16px" }}>
              <button className="btn btn-blue" onClick={fetchInitialData}>Retry</button>
              <button className="btn btn-grey" onClick={onClose} style={{marginLeft: "10px"}}>Close</button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const livePrice = quote.regularMarketPrice || 0;
  const changePct = quote.regularMarketChangePercent || 0;
  const isUp = changePct >= 0;

  const chartData = {
    labels: history.map((item) => {
      const d = new Date(item.date);
      return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
    }),
    datasets: [
      {
        label: "Close Price",
        data: history.map((item) => item.close),
        borderColor: isUp ? "rgba(18, 214, 167, 1)" : "rgba(255, 92, 122, 1)",
        backgroundColor: isUp ? "rgba(18, 214, 167, 0.1)" : "rgba(255, 92, 122, 0.1)",
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  return createPortal(
    <div className="analytics-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-header">
          <div className="analytics-header-left">
            <h2>{name} <span>({symbol.replace(/\.(NS|BO)$/i, "")})</span></h2>
            <div className="price-info">
              <span className="price">₹{formatCurrency(livePrice)}</span>
              <span className={`percent ${isUp ? "profit" : "loss"}`}>
                {isUp ? "+" : ""}{changePct.toFixed(2)}%
              </span>
            </div>
          </div>
          <button className="analytics-close" onClick={onClose}>×</button>
        </div>

        <div className="analytics-stats-grid">
          <div className="stat-box">
            <label>Day High</label>
            <span>{formatCurrency(quote.regularMarketDayHigh)}</span>
          </div>
          <div className="stat-box">
            <label>Day Low</label>
            <span>{formatCurrency(quote.regularMarketDayLow)}</span>
          </div>
          <div className="stat-box">
            <label>Volume</label>
            <span>{formatLargeNumber(quote.regularMarketVolume)}</span>
          </div>
          <div className="stat-box">
            <label>Open Price</label>
            <span>{formatCurrency(quote.regularMarketOpen)}</span>
          </div>
          <div className="stat-box">
            <label>Previous Close</label>
            <span>{formatCurrency(quote.regularMarketPreviousClose)}</span>
          </div>
          <div className="stat-box">
            <label>52 Week High</label>
            <span>{formatCurrency(quote.fiftyTwoWeekHigh)}</span>
          </div>
          <div className="stat-box">
            <label>52 Week Low</label>
            <span>{formatCurrency(quote.fiftyTwoWeekLow)}</span>
          </div>
          <div className="stat-box">
            <label>Market Cap</label>
            <span>{formatLargeNumber(quote.marketCap)}</span>
          </div>
        </div>

        <div className="analytics-chart-section">
          <div className="chart-controls">
            {["1W", "1M", "3M", "1Y"].map((p) => (
              <button
                key={p}
                className={`period-btn ${period === p ? "active" : ""}`}
                onClick={() => handlePeriodChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="chart-container">
            {chartLoading ? (
              <div className="chart-loading"><div className="spinner"></div></div>
            ) : history.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="chart-no-data">No history available for this period</div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StockAnalytics;
