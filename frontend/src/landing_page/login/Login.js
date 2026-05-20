import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../signup/Signup.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";
function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If redirected here after logout, clear port 3000's token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "true") {
      localStorage.removeItem("stockly_token");
      // Clean the URL
      window.history.replaceState({}, document.title, "/login");
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const closeDialog = () => {
    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("stockly_token", data.token);
      window.location.href = `${DASHBOARD_URL}?token=${encodeURIComponent(data.token)}`;
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page" aria-labelledby="login-title">
      <div
        className="signup-backdrop"
        role="button"
        tabIndex={0}
        aria-label="Close login dialog"
        onClick={closeDialog}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "Escape") {
            closeDialog();
          }
        }}
      />

      <section
        className="signup-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <button
          className="signup-close"
          type="button"
          aria-label="Close login dialog"
          onClick={closeDialog}
        >
          x
        </button>

        <p className="signup-kicker">Welcome back</p>
        <h1 id="login-title">Log in to Stockly</h1>
        <p className="signup-copy">
          Enter your credentials to access your dashboard.
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          {error && <p className="signup-error">{error}</p>}

          <label style={{ gridColumn: "1 / -1" }}>
            Email address
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Password
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              minLength="6"
              required
            />
          </label>

          <button className="signup-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>

          <p style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "8px" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ fontWeight: 700 }}>
              Sign up
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
