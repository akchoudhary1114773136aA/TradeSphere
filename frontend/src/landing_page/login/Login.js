import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../signup/Signup.css";

const API_BASE_URL = "http://localhost:3002";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
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
      window.location.href = "http://localhost:3001";
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page" aria-labelledby="login-title">
      <div className="signup-backdrop" />

      <section
        className="signup-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
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
