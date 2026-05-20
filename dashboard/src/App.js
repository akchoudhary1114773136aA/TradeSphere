import React, { useEffect, useState } from "react";
import Home from "./components/Home";
const LANDING_URL = process.env.REACT_APP_LANDING_URL || "http://localhost:3000";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Read token from URL query params (cross-port handoff from port 3000)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken && urlToken !== "undefined" && urlToken !== "null") {
      localStorage.setItem("stockly_token", urlToken);
      // Clean the token from the URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Now check localStorage
    const token = localStorage.getItem("stockly_token");

    if (!token || token === "undefined" || token === "null") {
      localStorage.removeItem("stockly_token");
      // Redirect — use window.top for iframe contexts
      try {
        window.top.location.href = `${LANDING_URL}/login`;
      } catch (e) {
        window.location.href = `${LANDING_URL}/login`;
      }
    } else {
      setIsAuthenticated(true);
    }

    setChecking(false);
  }, []);

  if (checking || !isAuthenticated) {
    return null;
  }

  return <Home />;
};

export default App;
