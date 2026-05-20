import React, { useState, useEffect } from "react";
import { getTransactionHistory } from "../api";

const stripSuffix = (symbol) =>
  symbol ? symbol.replace(/\.(NS|BO)$/i, "") : symbol;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactionHistory()
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>No orders placed yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders" style={{ padding: "20px" }}>
      <h3 className="title">Order History</h3>
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Date / Time</th>
              <th>Stock</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const date = new Date(order.timestamp);
              const dateStr = date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const timeStr = date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={index}>
                  <td>
                    {dateStr}{" "}
                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                      {timeStr}
                    </span>
                  </td>
                  <td>{stripSuffix(order.stockSymbol)}</td>
                  <td
                    className={order.type === "BUY" ? "profit" : "loss"}
                    style={{ fontWeight: 600 }}
                  >
                    {order.type}
                  </td>
                  <td>{order.quantity}</td>
                  <td>
                    ₹
                    {order.priceAtTransaction.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    ₹
                    {order.totalAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
