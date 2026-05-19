import React from "react";
import "./DashboardFrame.css";

const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

function DashboardFrame() {
  return (
    <main className="dashboard-frame-page">
      <iframe
        className="dashboard-frame"
        src={DASHBOARD_URL}
        title="TradeSphere Dashboard"
      />
    </main>
  );
}

export default DashboardFrame;
