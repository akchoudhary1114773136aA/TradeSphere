import axiosInstance from "./axiosConfig";

export const getMe = () => {
  return axiosInstance.get("/auth/me");
};

export const getMarketWatch = () => {
  return axiosInstance.get("/stocks/market-watch");
};

export const getQuote = (symbol) => {
  return axiosInstance.get(`/stocks/quote/${symbol}`);
};

export const getHistory = (symbol, period) => {
  return axiosInstance.get(`/stocks/history/${symbol}`, {
    params: { period },
  });
};

export const getHoldings = () => {
  return axiosInstance.get("/portfolio/holdings");
};

export const getTransactionHistory = () => {
  return axiosInstance.get("/portfolio/history");
};

export const placeOrder = (stockSymbol, quantity, type) => {
  return axiosInstance.post("/trade/order", {
    stockSymbol,
    quantity,
    type,
  });
};

export const updateProfile = (data) => {
  return axiosInstance.put("/auth/profile", data);
};
