import React, { useState, useEffect } from "react";
import { VerticalGraph } from "./VerticalGraph";
import { getHoldings } from "../api";

const stripSuffix = (symbol) =>
  symbol ? symbol.replace(/\.(NS|BO)$/i, "") : symbol;

const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatInteger = (value) => {
  if (value == null || isNaN(value)) return { intPart: "0", decimalPart: "00" };
  const [intPart, decimalPart] = value.toFixed(2).split(".");
  return { intPart: parseInt(intPart).toLocaleString("en-IN"), decimalPart };
};

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState({
    totalInvested: 0,
    totalCurrent: 0,
    totalProfitLoss: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHoldings()
      .then((res) => {
        if (res.data) {
          setHoldings(res.data.holdings || []);
          setSummary(res.data.summary || {
            totalInvested: 0,
            totalCurrent: 0,
            totalProfitLoss: 0,
          });
        }
      })
      .catch(() => {
        setHoldings([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const labels = holdings.map((stock) => stripSuffix(stock.stockSymbol));

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: holdings.map((stock) => stock.currentPrice || 0),
        backgroundColor: "rgba(18, 214, 167, 0.58)",
        borderColor: "rgba(18, 214, 167, 0.9)",
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        <p>Loading holdings...</p>
      </div>
    );
  }

  const profitLossPct = summary.totalInvested > 0 
    ? ((summary.totalProfitLoss / summary.totalInvested) * 100).toFixed(2) 
    : "0.00";
    
  const investedParts = formatInteger(summary.totalInvested);
  const currentParts = formatInteger(summary.totalCurrent);

  return (
    <>
      <h3 className="title">Holdings ({holdings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((stock, index) => {
              const isProfit = stock.profitLoss >= 0;
              const profClass = isProfit ? "profit" : "loss";

              return (
                <tr key={index}>
                  <td>{stripSuffix(stock.stockSymbol)}</td>
                  <td>{stock.quantity}</td>
                  <td>{formatCurrency(stock.averagePrice)}</td>
                  <td>{formatCurrency(stock.currentPrice)}</td>
                  <td>{formatCurrency(stock.currentValue)}</td>
                  <td className={profClass}>
                    {stock.profitLoss != null ? (isProfit ? "+" : "") : ""}
                    {formatCurrency(stock.profitLoss)}
                  </td>
                </tr>
              );
            })}
            {holdings.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                  No holdings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            {investedParts.intPart}.<span>{investedParts.decimalPart}</span>{" "}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            {currentParts.intPart}.<span>{currentParts.decimalPart}</span>{" "}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={summary.totalProfitLoss >= 0 ? "profit" : "loss"} style={{ fontSize: "1.2rem", fontWeight: 500 }}>
            {summary.totalProfitLoss >= 0 ? "+" : ""}{formatCurrency(summary.totalProfitLoss)} ({summary.totalProfitLoss >= 0 ? "+" : ""}{profitLossPct}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      
      {holdings.length > 0 && <VerticalGraph data={data} />}
    </>
  );
};

export default Holdings;
