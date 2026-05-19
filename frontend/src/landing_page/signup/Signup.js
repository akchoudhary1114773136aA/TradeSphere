import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../../config/api";
import "./Signup.css";

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
  const [submitted, setSubmitted] = useState(false);
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
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      saveSession(data);
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    navigate("/");
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

        {submitted ? (
          <div className="signup-success">
            <p className="signup-kicker">Account request received</p>
            <h1 id="signup-title">Thanks, {formData.fullName || "there"}.</h1>
            <p>
              We have your details and will help you finish opening your
              TradeSphere account.
            </p>
            <button className="signup-primary" type="button" onClick={closeDialog}>
              Back to home
            </button>
          </div>
        ) : (
          <>
            <p className="signup-kicker">Create your account</p>
            <h1 id="signup-title">Tell us a few details</h1>
            <p className="signup-copy">
              Enter your information to start your TradeSphere signup.
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
                  required
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
                  required
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
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default Signup;
