import React, { useState, useEffect, useContext } from "react";

import GeneralContext from "./GeneralContext";
import { placeOrder, getMe } from "../api";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ stock }) => {
  const { closeBuyWindow } = useContext(GeneralContext);

  const [stockQuantity, setStockQuantity] = useState(1);
  const [walletBalance, setWalletBalance] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mode = stock.mode || "BUY";
  const livePrice = stock.currentPrice || 0;
  const total = (livePrice * stockQuantity).toFixed(2);

  useEffect(() => {
    getMe()
      .then((res) => {
        setWalletBalance(res.data.walletBalance);
      })
      .catch(() => {});
  }, []);

  const handleConfirm = () => {
    setError("");
    setIsSubmitting(true);

    placeOrder(stock.symbol, Number(stockQuantity), mode)
      .then(() => {
        closeBuyWindow();
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message || "Trade failed. Please try again.";
        setError(msg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleCancelClick = () => {
    closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="header">
        <h3>
          {stock.name}{" "}
          <span>({stock.symbol})</span>
        </h3>
        <p className="market-options">
          {mode === "BUY" ? "Buy" : "Sell"} · ₹
          {livePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(Math.max(1, e.target.value))}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              value={livePrice.toFixed(2)}
              disabled
            />
          </fieldset>
        </div>

        {error && (
          <p
            style={{
              color: "var(--loss)",
              fontSize: "0.82rem",
              marginBottom: "10px",
              background: "var(--loss-bg)",
              padding: "6px 12px",
              borderRadius: "6px",
            }}
          >
            {error}
          </p>
        )}
      </div>

      <div className="buttons">
        <span>
          Total ₹{Number(total).toLocaleString("en-IN")}
          {walletBalance != null && (
            <> · Wallet ₹{walletBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</>
          )}
        </span>
        <div>
          <button
            className="btn btn-blue"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : mode === "BUY" ? "Buy" : "Sell"}
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
