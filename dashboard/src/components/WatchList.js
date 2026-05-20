import React, { useState, useEffect, useContext } from "react";

import GeneralContext from "./GeneralContext";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { getMarketWatch } from "../api";
import { DoughnutChart } from "./DoughnoutChart";
import StockAnalytics from "./StockAnalytics";

const stripSuffix = (symbol) =>
  symbol ? symbol.replace(/\.(NS|BO)$/i, "") : symbol;

const WatchList = () => {
  const [stocks, setStocks] = useState([]);
  const [analyticsStock, setAnalyticsStock] = useState(null);

  const fetchData = () => {
    getMarketWatch()
      .then((res) => {
        const list = (res.data || []).slice(0, 15).map((item) => {
          const q = item.quote || {};
          const changePct = q.regularMarketChangePercent || 0;
          return {
            symbol: item.symbol,
            name: item.name,
            displayName: stripSuffix(item.symbol),
            price: q.regularMarketPrice || 0,
            changePercent: changePct,
            isDown: changePct < 0,
          };
        });
        setStocks(list);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: stocks.map((s) => s.displayName),
    datasets: [
      {
        label: "Price",
        data: stocks.map((s) => s.price),
        backgroundColor: [
          "rgba(18, 214, 167, 0.62)",
          "rgba(77, 141, 255, 0.62)",
          "rgba(255, 138, 61, 0.62)",
          "rgba(255, 92, 122, 0.62)",
          "rgba(182, 194, 209, 0.46)",
          "rgba(123, 220, 255, 0.58)",
          "rgba(18, 214, 167, 0.42)",
          "rgba(77, 141, 255, 0.42)",
          "rgba(255, 138, 61, 0.42)",
          "rgba(255, 92, 122, 0.42)",
          "rgba(182, 194, 209, 0.36)",
          "rgba(123, 220, 255, 0.38)",
          "rgba(18, 214, 167, 0.30)",
          "rgba(77, 141, 255, 0.30)",
          "rgba(255, 138, 61, 0.30)",
        ],
        borderColor: [
          "rgba(18, 214, 167, 1)",
          "rgba(77, 141, 255, 1)",
          "rgba(255, 138, 61, 1)",
          "rgba(255, 92, 122, 1)",
          "rgba(182, 194, 209, 0.9)",
          "rgba(123, 220, 255, 0.95)",
          "rgba(18, 214, 167, 0.9)",
          "rgba(77, 141, 255, 0.9)",
          "rgba(255, 138, 61, 0.9)",
          "rgba(255, 92, 122, 0.9)",
          "rgba(182, 194, 209, 0.8)",
          "rgba(123, 220, 255, 0.85)",
          "rgba(18, 214, 167, 0.8)",
          "rgba(77, 141, 255, 0.8)",
          "rgba(255, 138, 61, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {stocks.length} / 50</span>
      </div>

      <ul className="list">
        {stocks.map((stock, index) => (
          <WatchListItem 
            stock={stock} 
            key={stock.symbol || index} 
            onOpenAnalytics={() => setAnalyticsStock({ symbol: stock.symbol, name: stock.name || stock.displayName })}
          />
        ))}
      </ul>

      {stocks.length > 0 && (
        <div className="watchlist-chart">
          <DoughnutChart data={chartData} />
        </div>
      )}

      {analyticsStock && (
        <StockAnalytics 
          symbol={analyticsStock.symbol} 
          name={analyticsStock.name} 
          onClose={() => setAnalyticsStock(null)} 
        />
      )}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onOpenAnalytics }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  return (
    <li
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
    >
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.displayName}</p>
        <div className="itemInfo">
          <span className={`percent ${stock.isDown ? "down" : "up"}`}>
            {stock.changePercent >= 0 ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className="price">
            {stock.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      {showWatchlistActions && (
        <WatchListActions
          uid={stock.displayName}
          symbol={stock.symbol}
          price={stock.price}
          name={stock.name}
          onOpenAnalytics={onOpenAnalytics}
        />
      )}
    </li>
  );
};

const WatchListActions = ({ uid, symbol, price, name, onOpenAnalytics }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow({ symbol, name: uid, currentPrice: price, fullName: name });
  };

  const handleSellClick = () => {
    generalContext.openBuyWindow({ symbol, name: uid, currentPrice: price, fullName: name, mode: "SELL" });
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleSellClick}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action" onClick={onOpenAnalytics}>
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
