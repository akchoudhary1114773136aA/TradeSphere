import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const API_BASE_URL = "http://localhost:3002";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    experience: "Beginner",
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

  const closeDialog = () => {
    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phone,
          city: formData.city,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("stockly_token", data.token);
      window.location.href = `http://localhost:3001?token=${encodeURIComponent(data.token)}`;
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page" aria-labelledby="signup-title">
      <div
        className="signup-backdrop"
        role="button"
        tabIndex={0}
        aria-label="Close signup dialog"
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
        aria-labelledby="signup-title"
      >
        <button
          className="signup-close"
          type="button"
          aria-label="Close signup dialog"
          onClick={closeDialog}
        >
          x
        </button>

        <p className="signup-kicker">Create your account</p>
        <h1 id="signup-title">Tell us a few details</h1>
        <p className="signup-copy">
          Enter your information to start your Stockly signup.
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          {error && <p className="signup-error">{error}</p>}

          <label>
            Full name
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Aishwarya Kumar"
              required
            />
          </label>

          <label>
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

          <label>
            Phone number
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength="6"
              required
            />
          </label>

          <label>
            City
            <input
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="Bengaluru"
            />
          </label>

          <label>
            Trading experience
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          <button className="signup-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit details"}
          </button>

          <p style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "8px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 700 }}>
              Log in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Signup;
