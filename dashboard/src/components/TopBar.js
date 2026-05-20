import React, { useState, useEffect } from "react";
import { getQuote } from "../api";

import Menu from "./Menu";

const TopBar = () => {
  const [nifty, setNifty] = useState({ price: "—", change: "", isDown: false });
  const [sensex, setSensex] = useState({ price: "—", change: "", isDown: false });

  const fetchIndices = () => {
    getQuote("^NSEI")
      .then((res) => {
        const q = res.data;
        const price = q.regularMarketPrice;
        const changePct = q.regularMarketChangePercent;
        setNifty({
          price: price != null ? price.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—",
          change: changePct != null ? `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%` : "",
          isDown: changePct < 0,
        });
      })
      .catch(() => {});

    getQuote("^BSESN")
      .then((res) => {
        const q = res.data;
        const price = q.regularMarketPrice;
        const changePct = q.regularMarketChangePercent;
        setSensex({
          price: price != null ? price.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—",
          change: changePct != null ? `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%` : "",
          isDown: changePct < 0,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">{nifty.price}</p>
          <p className={`percent ${nifty.isDown ? "down" : "up"}`}>{nifty.change}</p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">{sensex.price}</p>
          <p className={`percent ${sensex.isDown ? "down" : "up"}`}>{sensex.change}</p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
